import bcrypt from 'bcryptjs';

const LOGIN_RATE_LIMIT = {
  key: 'auth:login',
  limit: 5,
  windowMs: 15 * 60 * 1000,
  message: 'Too many login attempts. Try again in 15 minutes.',
} as const;

export default defineEventHandler(async (event) => {
  rateLimit(event, LOGIN_RATE_LIMIT);

  const ip = getRequestIP(event) || 'unknown';
  const body = await readBody(event);
  const sanitized = sanitize(body);
  const validated = await validateBody(sanitized, userLoginSchema);

  const users = await User.find({ email: validated.email });
  if (users.length === 0) {
    console.warn(`[AUTH] Failed login for ${validated.email} from ${ip} (unknown user)`);
    throw createError({ status: 401, statusText: 'Invalid credentials' });
  }

  const user = users[0]!;
  const userObj = user.toObject();
  const storedPassword = userObj.password as unknown as string;

  // Check if stored password is a bcrypt hash
  const isBcryptHash = /^\$2[aby]\$/.test(storedPassword);

  let isMatch = false;
  if (isBcryptHash) {
    isMatch = await bcrypt.compare(validated.password, storedPassword);
  } else {
    // Legacy plaintext password — verify directly, then migrate to bcrypt
    isMatch = validated.password === storedPassword;
    if (isMatch) {
      const hashed = await bcrypt.hash(validated.password, 10);
      await User.updateOne({ _id: user._id }, { password: hashed });
    }
  }

  if (!isMatch) {
    console.warn(`[AUTH] Failed login for ${validated.email} from ${ip}`);
    throw createError({ status: 401, statusText: 'Invalid credentials' });
  }

  // Clear bucket on successful login so the user isn't penalized for typos.
  rateLimitClear(event, LOGIN_RATE_LIMIT.key);

  // Regenerate session to prevent session fixation
  const session = await getAuthSession(event);
  await session.clear();
  const newSession = await getAuthSession(event);
  await newSession.update({ userId: userObj._id.toString(), email: userObj.email as unknown as string });

  const { password, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
});

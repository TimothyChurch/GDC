import bcrypt from 'bcryptjs';

// In-memory rate limiter (5 attempts per IP per 15 minutes)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event) || 'unknown';
  const now = Date.now();

  // Clean expired entries
  const existing = loginAttempts.get(ip);
  if (existing && now >= existing.resetAt) {
    loginAttempts.delete(ip);
  }

  // Check rate limit
  const attempts = loginAttempts.get(ip);
  if (attempts && attempts.count >= 5) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many login attempts. Try again in 15 minutes.',
    });
  }

  const body = await readBody(event);
  const sanitized = sanitize(body);
  const validated = await validateBody(sanitized, userLoginSchema);

  const users = await User.find({ email: validated.email });
  if (users.length === 0) {
    const current = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
    current.count++;
    loginAttempts.set(ip, current);
    console.warn(`[AUTH] Failed login for ${validated.email} from ${ip} (unknown user)`);
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  const user = users[0];
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
    const current = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
    current.count++;
    loginAttempts.set(ip, current);
    console.warn(`[AUTH] Failed login for ${validated.email} from ${ip}`);
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  // Clear attempts on successful login
  loginAttempts.delete(ip);

  // Regenerate session to prevent session fixation
  const session = await getAuthSession(event);
  await session.clear();
  const newSession = await getAuthSession(event);
  await newSession.update({ userId: userObj._id.toString(), email: userObj.email });

  const { password, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
});

import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validated = await validateBody(body, userLoginSchema);

  const users = await User.find({ email: validated.email });
  if (users.length === 0) {
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
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  // Create server-side session
  const session = await getAuthSession(event);
  await session.update({ userId: userObj._id.toString(), email: userObj.email });

  const { password, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
});

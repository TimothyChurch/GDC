export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event);

  if (!session.data.userId) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' });
  }

  const user = await User.findById(session.data.userId).select('-password').lean();
  if (!user) {
    await session.clear();
    throw createError({ statusCode: 401, statusMessage: 'User not found' });
  }

  return user;
});

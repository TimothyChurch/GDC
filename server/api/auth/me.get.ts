export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event);

  if (!session.data.userId) {
    throw createError({ status: 401, statusText: 'Not authenticated' });
  }

  const user = await User.findById(session.data.userId).select('-password').lean();
  if (!user) {
    await session.clear();
    throw createError({ status: 401, statusText: 'User not found' });
  }

  return user;
});

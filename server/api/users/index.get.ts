export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin', 'Manager');

	try {
		return await User.find({}).select('-password').lean();
	} catch (error) {
		throw createError({ status: 500, statusText: 'Failed to fetch users' });
	}
});

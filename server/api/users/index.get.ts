export default defineEventHandler(async (event) => {
	await requireRole(event, 'Admin', 'Manager');

	try {
		return await User.find({}).select('-password').lean();
	} catch (error) {
		throw createError({ statusCode: 500, statusMessage: 'Failed to fetch users' });
	}
});

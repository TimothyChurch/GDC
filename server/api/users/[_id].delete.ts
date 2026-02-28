export default defineEventHandler(async (event) => {
	try {
		await requireRole(event, 'Admin');

		const id = event.context.params?._id;
		const deletedUser = await User.findByIdAndDelete(id);
		if (!deletedUser) {
			throw createError({
				statusCode: 404,
				statusMessage: 'User not found',
			});
		}
		return { message: 'User deleted successfully' };
	} catch (error: unknown) {
		if (isH3Error(error)) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to delete user',
		});
	}
});

export default defineEventHandler(async (event) => {
	try {
		await requireRole(event, 'Admin');

		const id = event.context.params?._id;
		const deletedUser = await User.findByIdAndDelete(id);
		if (!deletedUser) {
			throw createError({
				status: 404,
				statusText: 'User not found',
			});
		}
		return { message: 'User deleted successfully' };
	} catch (error: unknown) {
		if (isH3Error(error)) throw error;
		throw createError({
			status: 500,
			statusText: 'Failed to delete user',
		});
	}
});

import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	try {
		if (sanitized.password) {
			sanitized.password = await bcrypt.hash(sanitized.password, 10);
		}
		const user = await User.findOneAndUpdate(
			{ _id: event.context.params?._id },
			sanitized,
			{ new: true }
		);
		if (!user) {
			throw createError({
				statusCode: 404,
				statusMessage: "User not found",
			});
		}
		const { password, ...userWithoutPassword } = user.toObject();
		return userWithoutPassword;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to update user",
		});
	}
});

import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const validated = await validateBody(body, userCreateSchema);
	const sanitized = sanitize(validated);
	try {
		sanitized.password = await bcrypt.hash(sanitized.password, 10);
		const user = await new User(sanitized).save();
		const { password, ...userWithoutPassword } = user.toObject();
		return userWithoutPassword;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create user",
		});
	}
});

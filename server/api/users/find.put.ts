import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const validated = await validateBody(body, userLoginSchema);
	try {
		const users = await User.find({ email: validated.email });
		if (users.length === 0) {
			return [];
		}

		const user = users[0];
		const userObj = user.toObject();
		const isMatch = await bcrypt.compare(validated.password, userObj.password as unknown as string);
		if (!isMatch) {
			return [];
		}

		const { password, ...userWithoutPassword } = userObj;
		return [userWithoutPassword];
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Login failed",
		});
	}
});

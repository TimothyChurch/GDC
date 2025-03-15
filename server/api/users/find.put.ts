export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	console.log(body);
	try {
		return await User.find(body);
	} catch (error) {
		return error;
	}
});

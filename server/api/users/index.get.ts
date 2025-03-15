export default defineEventHandler(async (event) => {
	try {
		return await User.find({});
	} catch (error) {
		return error;
	}
});

export default defineEventHandler(async (event) => {
	try {
		return await Inventory.find({ item: event.context.params?.item });
	} catch (error) {
		throw createError({ statusCode: 500, statusMessage: 'Failed to fetch inventory by item' });
	}
});

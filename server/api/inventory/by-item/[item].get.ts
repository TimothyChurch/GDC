export default defineEventHandler(async (event) => {
	try {
		return await Inventory.find({ item: event.context.params?.item }).lean();
	} catch (error) {
		throw createError({ status: 500, statusText: 'Failed to fetch inventory by item' });
	}
});

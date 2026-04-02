export default defineEventHandler(async (event) => {
	const itemId = validateObjectId(event.context.params?.item, 'Item');
	try {
		return await Inventory.find({ item: itemId }).lean();
	} catch (error) {
		throw createError({ status: 500, statusText: 'Failed to fetch inventory by item' });
	}
});

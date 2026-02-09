export default defineEventHandler(async (event) => {
    try {
        return await Inventory.find({ item: event.context.params?.item });
    } catch (error) {
        return error;

    }
});
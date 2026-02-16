export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;

    // Check for references in Items (vendor)
    const itemRefs = await Item.countDocuments({ vendor: id });
    if (itemRefs > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete: ${itemRefs} item(s) reference this contact as vendor`,
      });
    }

    // Check for references in Purchase Orders (vendor)
    const poRefs = await PurchaseOrder.countDocuments({ vendor: id });
    if (poRefs > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete: ${poRefs} purchase order(s) reference this contact as vendor`,
      });
    }

    // Check for references in Events
    const eventRefs = await Event.countDocuments({ contact: id });
    if (eventRefs > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete: ${eventRefs} event(s) reference this contact`,
      });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      throw createError({
        statusCode: 404,
        statusMessage: "Contact not found",
      });
    }
    return { message: "Contact deleted successfully" };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete contact",
    });
  }
});

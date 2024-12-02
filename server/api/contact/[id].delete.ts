export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      throw createError({
        statusCode: 404,
        statusMessage: "Contact not found",
      });
    }
    return { message: "Contact deleted successfully" };
  } catch (error) {
    console.error("Failed to delete contact:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete contact",
    });
  }
});

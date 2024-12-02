export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const body = await readBody(event);
    const updatedContact = await Contact.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updatedContact) {
      throw createError({
        statusCode: 404,
        statusMessage: "Contact not found",
      });
    }
    return updatedContact;
  } catch (error) {
    console.error("Failed to update contact:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update contact",
    });
  }
});

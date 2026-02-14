export default defineEventHandler(async (event) => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch contacts",
    });
  }
});

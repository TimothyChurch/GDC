export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const newContact = new Contact(body);
    await newContact.save();
    return newContact;
  } catch (error) {
    console.error("Failed to create contact:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create contact",
    });
  }
});

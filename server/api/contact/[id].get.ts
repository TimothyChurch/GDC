export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    const contact = await Contact.findById(id).lean();
    if (!contact) {
      throw createError({ statusCode: 404, statusMessage: 'Contact not found' });
    }
    return contact;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch contact',
    });
  }
});

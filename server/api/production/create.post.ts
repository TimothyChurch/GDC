export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const sanitized = sanitize(body);

  await validateBody(sanitized, productionCreateSchema);

  // Remove empty _id so Mongoose auto-generates it
  if (!sanitized._id) delete sanitized._id;

  // Clean up empty string ObjectId refs in bottling subdocument
  if (sanitized.bottling) {
    for (const key of ['glassware', 'cap', 'label']) {
      if (!sanitized.bottling[key]) delete sanitized.bottling[key];
    }
  }

  try {
    const doc = new Production(sanitized);
    await doc.save();
    return doc;
  } catch (error: any) {
    const details = error?.errors
      ? Object.entries(error.errors).map(([k, v]: [string, any]) => `${k}: ${v.message}`).join('; ')
      : error?.message || String(error);
    console.error('Failed to create production:', details);
    throw createError({ status: 500, statusText: `Failed to create production: ${details}` });
  }
});

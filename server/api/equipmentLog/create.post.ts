export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const sanitized = sanitize(body);
    return await EquipmentLog.create(sanitized);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create equipment log',
    });
  }
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const sanitized = sanitize(body);
    await validateBody(sanitized, equipmentLogCreateSchema);
    return await EquipmentLog.create(sanitized);
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create equipment log',
    });
  }
});

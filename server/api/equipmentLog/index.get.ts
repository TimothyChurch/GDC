export default defineEventHandler(async () => {
  try {
    return await EquipmentLog.find({}).sort({ timestamp: -1 }).limit(50);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch equipment logs',
    });
  }
});

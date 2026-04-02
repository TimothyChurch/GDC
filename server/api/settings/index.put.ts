export default defineEventHandler(async (event) => {
  await requireRole(event, 'Admin');
  const body = await readBody(event);
  const sanitized = sanitize(body);
  await validateBody(sanitized, settingsUpdateSchema);

  try {
    // Upsert: update existing or create if none exists
    const updated = await Settings.findOneAndUpdate(
      {},
      { $set: sanitized },
      { new: true, upsert: true, lean: true }
    );
    if (!updated) {
      throw createError({ status: 500, statusText: "Failed to update settings" });
    }
    // Convert Map to plain object for JSON serialization
    if (updated.barrelAgeDefaults instanceof Map) {
      updated.barrelAgeDefaults = Object.fromEntries(updated.barrelAgeDefaults);
    }
    return updated;
  } catch (error: unknown) {
    if (isH3Error(error)) throw error;
    throw createError({ status: 500, statusText: "Failed to update settings" });
  }
});

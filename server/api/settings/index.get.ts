export default defineEventHandler(async () => {
  try {
    let settings = await Settings.findOne({}).lean();
    if (!settings) {
      settings = await new Settings({}).save().then((doc) => doc.toObject());
    }
    // Convert Map to plain object for JSON serialization
    if (settings.barrelAgeDefaults instanceof Map) {
      settings.barrelAgeDefaults = Object.fromEntries(settings.barrelAgeDefaults);
    }
    return settings;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Failed to fetch settings" });
  }
});

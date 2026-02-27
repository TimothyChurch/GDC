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
    // Migrate old string[] categories to rich InventoryCategoryDef[]
    if (
      Array.isArray(settings.itemCategories) &&
      settings.itemCategories.length > 0 &&
      typeof settings.itemCategories[0] === "string"
    ) {
      const migrated = (settings.itemCategories as unknown as string[]).map((cat) => ({
        key: cat.toLowerCase().replace(/\s+/g, "-"),
        label: cat,
        category: cat,
        icon: "i-lucide-box",
        description: "",
      }));
      // Persist the migration
      await Settings.findByIdAndUpdate(settings._id, {
        $set: { itemCategories: migrated },
      });
      settings.itemCategories = migrated;
    }
    return settings;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Failed to fetch settings" });
  }
});

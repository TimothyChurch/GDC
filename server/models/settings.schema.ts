import { defineMongooseModel } from "#nuxt/mongoose";

const DEFAULT_CATEGORIES = [
  { key: "bottling", label: "Bottling Supplies", category: "Bottling", icon: "i-lucide-wine", description: "Bottles, caps, labels, shrink wraps, and packaging materials" },
  { key: "ingredients", label: "Base Ingredients", category: "Base Ingredient", icon: "i-lucide-wheat", description: "Grains, sugars, yeast, and primary fermentation ingredients" },
  { key: "botanicals", label: "Botanicals", category: "Botanical", icon: "i-lucide-leaf", description: "Herbs, spices, citrus peels, and botanical flavorings" },
  { key: "bar-supplies", label: "Bar Supplies", category: "Bar Supplies", icon: "i-lucide-cup-soda", description: "Mixers, garnishes, glassware, and bar tools" },
  { key: "other", label: "Other", category: "Other", icon: "i-lucide-box", description: "Cleaning supplies, lab supplies, and miscellaneous items" },
];

const InventoryCategoryDefSchema = {
  key: { type: String, required: true },
  label: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, default: "i-lucide-box" },
  description: { type: String, default: "" },
};

export const Settings = defineMongooseModel({
  name: "Settings",
  schema: {
    itemCategories: {
      type: [InventoryCategoryDefSchema],
      default: () => DEFAULT_CATEGORIES,
    },
    barrelAgeDefaults: {
      type: Map,
      of: Number,
      default: () =>
        new Map([
          ["5 Gallon", 12],
          ["10 Gallon", 15],
          ["15 Gallon", 18],
          ["30 Gallon", 24],
          ["53 Gallon", 36],
        ]),
    },
    theme: {
      primaryColor: { type: String, default: "amber" },
    },
    distillery: {
      name: { type: String, default: "Galveston Distilling Co" },
      address: { type: String, default: "" },
      permitNumbers: {
        ttb: { type: String, default: "" },
        tabc: { type: String, default: "" },
      },
    },
    /** Display unit preferences. Storage stays canonical (gallon, ABV%, °F, lb);
     * UI converts at render time via the useDisplayUnits composable. */
    units: {
      volume: {
        type: String,
        enum: ["gallon", "liter", "milliliter", "fluid_ounce"],
        default: "gallon",
      },
      strength: {
        type: String,
        enum: ["abv", "proof"],
        default: "abv",
      },
      temperature: {
        type: String,
        enum: ["fahrenheit", "celsius"],
        default: "fahrenheit",
      },
      weight: {
        type: String,
        enum: ["pound", "kilogram", "ounce", "gram"],
        default: "pound",
      },
    },
    /** Production-projection defaults. Used by utils/grainBill.ts to compute
     * projected OG / FG / wash ABV / proof gallons from a recipe's grain bill.
     * Recipes may override any of these per-recipe. */
    production: {
      /** Mash efficiency — % of theoretical sugars extracted from grain.
       * Distillery-typical range 72–80%. */
      mashEfficiency: { type: Number, default: 75 },
      /** Yeast attenuation — % of fermentable sugars converted to alcohol.
       * Distiller's yeast typically 78–85%. */
      fermentationAttenuation: { type: Number, default: 80 },
      /** Distillation yield — % of wash proof gallons recovered post-distillation.
       * Pot still 70–85%, reflux/column 85–92%. */
      distillationYield: { type: Number, default: 80 },
    },
    /** Append-only list of one-time migrations already applied. Used by
     * server/utils/migrationGuard.ts to gate migration routes. */
    migrationsRun: { type: [String], default: [] },
  },
  options: { timestamps: true },
});

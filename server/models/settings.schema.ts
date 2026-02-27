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
  },
  options: { timestamps: true },
});

import { defineMongooseModel } from "#nuxt/mongoose";

export const Settings = defineMongooseModel({
  name: "Settings",
  schema: {
    itemCategories: {
      type: [String],
      default: ["Bottling", "Base Ingredient", "Botanical", "Bar Supplies", "Other"],
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

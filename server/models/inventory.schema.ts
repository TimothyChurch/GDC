import { defineMongooseModel } from "#nuxt/mongoose";

export const Inventory = defineMongooseModel({
  name: "Inventory",
  schema: {
    year: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    items: {
      type: Object,
    },
  },
});

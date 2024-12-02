import { defineMongooseModel } from "#nuxt/mongoose";

export const Inventory = defineMongooseModel({
  name: "Inventory",
  schema: {
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
    },
  },
});

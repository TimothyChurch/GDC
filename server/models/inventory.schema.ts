import { defineMongooseModel } from "#nuxt/mongoose";

export const Inventory = defineMongooseModel({
  name: "Inventory",
  schema: {
    date: {
      type: Date,
      required: true,
    },
    items: {
      type: Object,
      required: true,
    },
  },
});

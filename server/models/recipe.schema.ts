import { defineMongooseModel } from "#nuxt/mongoose";

export const Recipe = defineMongooseModel({
  name: "Recipe",
  schema: {
    name: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
    volume: {
      type: Number,
      required: true,
    },
    volumeUnit: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
  },
});

import { defineMongooseModel } from "#nuxt/mongoose";

export const Bottle = defineMongooseModel({
  name: "Bottle",
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
    abv: {
      type: Number,
      required: false,
    },
    recipe: {
      type: String,
      required: false,
    },
  },
});

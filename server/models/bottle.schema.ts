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
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    abv: {
      type: Number,
      required: false,
    },
    price: {
      type: Number,
      required: false,
    },
    img: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    recipe: {
      type: String,
      required: false,
    },
    inStock: {
      type: Boolean,
      required: false,
    },
  },
});

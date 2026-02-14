import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

const { Schema } = mongoose;

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
    volume: {
      type: Number,
      required: false,
    },
    volumeUnit: {
      type: String,
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
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: false,
    },
    inStock: {
      type: Boolean,
      required: false,
    },
  },
  options: { timestamps: true },
});

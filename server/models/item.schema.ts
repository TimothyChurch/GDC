import { defineMongooseModel } from "#nuxt/mongoose";
import type { ObjectId } from "mongoose";

export const Item = defineMongooseModel({
  name: "Item",
  schema: {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    vendor: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: false,
    },
  },
});

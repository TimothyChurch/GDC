import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

const { Schema } = mongoose;

export const Inventory = defineMongooseModel({
  name: "Inventory",
  schema: {
    date: {
      type: Date,
      required: true,
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Vessel",
      required: false,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  options: { timestamps: true },
});

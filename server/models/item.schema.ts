import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

const { Schema } = mongoose;

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
      type: Schema.Types.ObjectId,
      ref: "Contact",
    },
    brand: {
      type: String,
    },
    inventoryUnit: {
      type: String,
    },
    purchaseHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "PurchaseOrder",
      },
    ],
    inventoryHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Inventory",
      },
    ],
    pricePerUnit: {
      type: Number,
    },
  },
});

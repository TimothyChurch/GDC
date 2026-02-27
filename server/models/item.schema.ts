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
      index: true,
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
    category: {
      type: String,
      default: 'Other',
      index: true,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
    unitSize: {
      type: Number,
    },
    unitLabel: {
      type: String,
      trim: true,
    },
    minStock: {
      type: Number,
      default: 0,
    },
    reorderPoint: {
      type: Number,
      default: 0,
    },
    usePerMonth: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  options: { timestamps: true },
});

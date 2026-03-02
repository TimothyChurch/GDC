import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

const { Schema } = mongoose;

export const PurchaseOrder = defineMongooseModel({
  name: "PurchaseOrder",
  schema: {
    status: {
      type: String,
      required: true,
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true,
    },
    items: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        sizeUnit: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        taxable: {
          type: Boolean,
          default: false,
        },
        brand: {
          type: String,
          default: "",
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    taxRate: {
      type: Number,
      default: 0.0825,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  options: { timestamps: true },
});

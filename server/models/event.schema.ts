import { defineMongooseModel } from "#nuxt/mongoose";
import { Schema } from "mongoose";

export const Event = defineMongooseModel({
  name: "Event",
  schema: {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    groupSize: {
      type: Number,
      required: false,
      default: 0,
    },
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: false,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Cocktail Class", "Private Class", "Private Event", "Tasting"],
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      index: true,
    },
    notes: {
      type: String,
      required: false,
    },
    capacity: {
      type: Number,
      required: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    price: {
      type: Number,
      required: false,
      min: 0,
    },
    addOns: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      description: { type: String },
    }],
    bookings: [{
      contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      amount: { type: Number, required: true, min: 0 },
      orderId: { type: String, required: true },
      bookedAt: { type: Date, default: Date.now },
    }],
    processedOrders: [{
      type: String,
    }],
  },
  options: { timestamps: true },
});

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
      required: true,
    },
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Private Class", "Private Event", "Tasting"],
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
  },
  options: { timestamps: true },
});

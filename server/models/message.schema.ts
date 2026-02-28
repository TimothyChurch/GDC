import { defineMongooseModel } from "#nuxt/mongoose";
import { Schema } from "mongoose";

export const Message = defineMongooseModel({
  name: "Message",
  schema: {
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: false,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  options: { timestamps: true },
});

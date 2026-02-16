import { defineMongooseModel } from "#nuxt/mongoose";

export const Contact = defineMongooseModel({
  name: "Contact",
  schema: {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    businessName: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
      index: true,
    },
    website: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    newsletter: {
      type: Boolean,
      default: false,
      index: true,
    },
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    zip: {
      type: String,
      required: false,
    },
  },
  options: { timestamps: true },
});

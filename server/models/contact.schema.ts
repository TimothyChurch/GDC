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
  },
});

import { defineMongooseModel } from "#nuxt/mongoose";

export const PurchaseOrder = defineMongooseModel({
  name: "PurchaseOrder",
  schema: {
    status: {
      type: String,
      required: true,
    },
    vendor: {
      type: String,
      required: true,
    },

    items: {
      type: Array,
      required: true,
      items: {
        type: Object,
        required: true,
        schema: {
          item: {
            type: String,
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
        },
      },
    },
    total: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
});

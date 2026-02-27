import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

const { Schema } = mongoose;

export const Recipe = defineMongooseModel({
  name: "Recipe",
  schema: {
    name: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
    volume: {
      type: Number,
      required: true,
    },
    volumeUnit: {
      type: String,
      required: true,
    },
    items: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
      },
    ],
    directions: {
      type: String,
    },
    notes: {
      type: String,
    },
    targetAbv: {
      type: Number,
    },
    macerationDays: {
      type: Number,
    },
    pipeline: {
      type: [String],
      required: true,
      default: [
        "Mashing",
        "Fermenting",
        "Distilling",
        "Storage",
        "Proofing",
        "Bottled",
      ],
    },
    pipelineTemplate: {
      type: String,
    },
  },
  options: { timestamps: true },
});

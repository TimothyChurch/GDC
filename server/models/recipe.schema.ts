import { defineMongooseModel } from "#nuxt/mongoose";
import mongoose from "mongoose";

const { Schema } = mongoose;

export const Recipe = defineMongooseModel({
  name: "Recipe",
  schema: {
    name: {
      type: String,
      required: true,
      index: true,
    },
    class: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: false,
      index: true,
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
    bulkSpirits: [
      {
        bulkSpirit: {
          type: Schema.Types.ObjectId,
          ref: 'BulkSpirit',
          required: true,
        },
        volume: {
          type: Number,
          required: true,
        },
        volumeUnit: {
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
    // ─── Projection overrides ─────────────────────────────────
    // When set, override the matching settings.production default for this
    // recipe only. Leave undefined to inherit the global default.
    mashEfficiency: { type: Number },
    attenuation: { type: Number },
    distillationYield: { type: Number },
    /** Whether the grain remains in the wash through fermentation (grain-in,
     * typical for bourbon/whiskey/rye/moonshine) versus lautered/sparged
     * before fermenting (grain-out — typical for vodka, gin, rum, liqueur).
     *
     * When true, projection math subtracts grain displacement from the wash
     * volume to get the *effective liquid* volume used for PG calculations.
     *
     * Default false at the DB level (safer — won't silently change PG on
     * existing recipes). New recipes should be prefilled from the recipe's
     * `class` (Whisky/Bourbon/Rye → true; Vodka/Gin/Rum/Liqueur → false). */
    grainIn: { type: Boolean, default: false },
    // ─── Projection snapshot ──────────────────────────────────
    // Recomputed on every recipe save by utils/grainBill.ts so that the
    // recipe card and reports can render projections without re-resolving
    // grain items at query time.
    projectedOG: { type: Number },
    projectedFG: { type: Number },
    projectedWashAbv: { type: Number },
    projectedProofGallons: { type: Number },
    projectedFermentableLb: { type: Number },
  },
  options: { timestamps: true },
});

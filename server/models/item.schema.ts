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
    baseCostPrice: {
      type: Number,
    },
    baseCostSize: {
      type: Number,
    },
    baseCostUnit: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    /** PPG = Points Per Pound Per Gallon. 1 lb of a 36 PPG grain in 1 gal of
     * water yields 0.036 specific-gravity points at 100% extraction.
     * See utils/grainBill.ts for the full projection math. */
    ppg: {
      type: Number,
    },
    /** Categorizes how this item contributes fermentables. Drives the
     * efficiency multiplier in projectGravity (mash eff. for grains,
     * 100% for sugars/DME, 95% for LME, 0 for adjuncts). */
    extractType: {
      type: String,
      enum: [
        'malted_grain',
        'raw_grain',
        'flaked_grain',
        'specialty_grain',
        'sugar',
        'extract_dry',
        'extract_liquid',
        'adjunct',
      ],
    },
    /** Shortcut filter for grain-bill aggregation. Auto-set when ppg > 0
     * and extractType is set; can be overridden manually. */
    fermentable: {
      type: Boolean,
      default: false,
    },
    /** Volume (in gallons) displaced by 1 lb of this item when fully wetted in
     * the mash. Used to derive "effective liquid volume" for grain-in batches
     * so PG calculations don't overstate proof gallons by treating the bulk
     * volume (water + suspended grain) as if it were all liquid.
     *
     * Smart defaults by extractType (applied at calculation time, not stored):
     *   malted_grain / raw_grain / specialty_grain → 0.10 gal/lb
     *   flaked_grain                                 → 0.08 gal/lb
     *   sugar / extract_dry / extract_liquid         → 0
     *   adjunct                                      → 0
     *
     * See utils/grainBill.ts → DEFAULT_DISPLACEMENT_BY_EXTRACT_TYPE. */
    displacement: {
      type: Number,
    },
  },
  options: { timestamps: true },
});

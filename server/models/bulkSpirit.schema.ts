import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const depositSchema = {
  batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  date: { type: Date, required: true },
  volume: { type: Number, required: true },
  volumeUnit: { type: String, required: true },
  abv: { type: Number, required: true },
  proofGallons: { type: Number, required: true },
  value: { type: Number, required: true },
  costPerProofGallon: { type: Number, required: true },
};

const withdrawalSchema = {
  batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
  date: { type: Date, required: true },
  volume: { type: Number, required: true },
  volumeUnit: { type: String, required: true },
  abv: { type: Number, required: true },
  proofGallons: { type: Number, required: true },
  value: { type: Number, required: true },
  costPerProofGallon: { type: Number, required: true },
};

export const BulkSpirit = defineMongooseModel({
  name: 'BulkSpirit',
  schema: {
    name: { type: String, required: true, index: true },
    spiritClass: { type: String, required: true, index: true },
    vessel: { type: Schema.Types.ObjectId, ref: 'Vessel', index: true },
    volume: { type: Number, required: false },
    volumeUnit: { type: String, required: false },
    abv: { type: Number, required: false },
    proofGallons: { type: Number, required: false },
    costPerProofGallon: { type: Number, required: false },
    totalValue: { type: Number, required: false },
    deposits: [depositSchema],
    withdrawals: [withdrawalSchema],
    status: { type: String, required: false, index: true },
    notes: { type: String },
  },
  options: { timestamps: true },
});

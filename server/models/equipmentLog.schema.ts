import { defineMongooseModel } from '#nuxt/mongoose';
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const EquipmentLog = defineMongooseModel({
  name: 'EquipmentLog',
  schema: {
    equipment: { type: String, required: true },
    action: { type: String, required: true },
    value: { type: Number },
    timestamp: { type: Date, default: Date.now, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
  },
  options: {
    timestamps: true,
  },
});

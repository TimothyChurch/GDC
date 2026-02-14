import { defineMongooseModel } from '#nuxt/mongoose';

export const EquipmentLog = defineMongooseModel({
  name: 'EquipmentLog',
  schema: {
    equipment: { type: 'string', required: true },
    action: { type: 'string', required: true },
    value: { type: 'number' },
    timestamp: { type: 'date', default: Date.now, index: true },
    batch: { type: 'ObjectId', ref: 'Batch' },
  },
  options: {
    timestamps: true,
  },
});

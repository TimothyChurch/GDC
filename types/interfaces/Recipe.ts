export interface RecipeBulkSpirit {
  bulkSpirit: string;
  volume: number;
  volumeUnit: string;
}

export interface Recipe {
  _id: string;
  name: string;
  class: string;
  type?: string;
  volume: number;
  volumeUnit: string;
  items: { _id: string; amount: number; unit: string }[];
  bulkSpirits?: RecipeBulkSpirit[];
  directions?: string;
  notes?: string;
  targetAbv?: number;
  macerationDays?: number;
  pipeline: string[];
  pipelineTemplate?: string;
  createdAt?: string;
  updatedAt?: string;
}

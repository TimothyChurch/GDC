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
  /** Target *finished, proofed* ABV (e.g. 40%/80 proof). Distinct from
   * projectedWashAbv, which is the fermented wash ABV pre-distillation. */
  targetAbv?: number;
  macerationDays?: number;
  pipeline: string[];
  pipelineTemplate?: string;
  /** Optional per-recipe overrides (whole-number percentages). When set,
   * supersede the matching settings.production default for this recipe. */
  mashEfficiency?: number;
  attenuation?: number;
  distillationYield?: number;
  /** Whether grain remains in the wash through fermentation (true for
   * bourbon/whiskey/rye, false for vodka/gin/rum/liqueur). When true,
   * grain displacement is subtracted from washVolume for PG calculations. */
  grainIn?: boolean;
  /** Projection snapshot — recomputed on every recipe save. */
  projectedOG?: number;
  projectedFG?: number;
  projectedWashAbv?: number;
  projectedProofGallons?: number;
  projectedFermentableLb?: number;
  createdAt?: string;
  updatedAt?: string;
}

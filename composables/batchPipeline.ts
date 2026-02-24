// All possible batch stages in the system
export const ALL_STAGES = [
  "Upcoming",
  "Mashing",
  "Fermenting",
  "Distilling",
  "Maceration",
  "Filtering",
  "Barrel Aging",
  "Storage",
  "Blending",
  "Proofing",
  "Bottled",
] as const;

export type StageName = (typeof ALL_STAGES)[number];

// Pre-defined pipeline templates for recipe creation
export const PIPELINE_TEMPLATES: Record<string, StageName[]> = {
  "Grain Spirit (Barreled)": [
    "Mashing",
    "Fermenting",
    "Distilling",
    "Barrel Aging",
    "Storage",
    "Proofing",
    "Bottled",
  ],
  "Grain Spirit (Unbarreled)": [
    "Mashing",
    "Fermenting",
    "Distilling",
    "Storage",
    "Proofing",
    "Bottled",
  ],
  "Redistilled Gin": [
    "Maceration",
    "Distilling",
    "Storage",
    "Proofing",
    "Bottled",
  ],
  "Compounded Gin": [
    "Maceration",
    "Filtering",
    "Storage",
    "Proofing",
    "Bottled",
  ],
  "Liqueur/Cordial": [
    "Maceration",
    "Filtering",
    "Blending",
    "Storage",
    "Proofing",
    "Bottled",
  ],
  Custom: [],
};

// Map stage display name → batch.stages key
export const STAGE_KEY_MAP: Record<string, string> = {
  Mashing: "mashing",
  Fermenting: "fermenting",
  Distilling: "distilling",
  Maceration: "maceration",
  Filtering: "filtering",
  "Barrel Aging": "barrelAging",
  Storage: "storage",
  Blending: "blending",
  Proofing: "proofing",
  Bottled: "bottled",
};

// Stage display metadata (icon + color)
export const STAGE_DISPLAY: Record<string, { icon: string; color: string }> = {
  Upcoming: { icon: "i-lucide-calendar-clock", color: "blue" },
  Mashing: { icon: "i-lucide-flame", color: "orange" },
  Fermenting: { icon: "i-lucide-beaker", color: "yellow" },
  Distilling: { icon: "i-lucide-flask-conical", color: "copper" },
  Maceration: { icon: "i-lucide-leaf", color: "emerald" },
  Filtering: { icon: "i-lucide-filter", color: "sky" },
  "Barrel Aging": { icon: "i-lucide-cylinder", color: "amber" },
  Storage: { icon: "i-lucide-warehouse", color: "purple" },
  Blending: { icon: "i-lucide-git-merge", color: "pink" },
  Proofing: { icon: "i-lucide-droplets", color: "cyan" },
  Bottled: { icon: "i-lucide-wine", color: "green" },
};

// Stages that require a vessel selection, mapped to vessel type filter
export const STAGE_VESSEL_TYPE: Record<string, string> = {
  Mashing: "Mash Tun",
  Fermenting: "Fermenter",
  Distilling: "Still",
  Maceration: "Tank",
  Filtering: "Tank",
  "Barrel Aging": "Barrel",
  Storage: "Tank",
  Blending: "Tank",
  Proofing: "Tank",
};

// --- Helper functions ---

/** Get the index of a stage within a pipeline */
export function getStageIndex(pipeline: string[], stage: string): number {
  return pipeline.indexOf(stage);
}

/** Get the next stage in a pipeline from the current stage */
export function getNextStage(
  pipeline: string[],
  currentStage: string,
): string | null {
  const idx = pipeline.indexOf(currentStage);
  if (idx < 0 || idx >= pipeline.length - 1) return null;
  return pipeline[idx + 1];
}

/** Get the previous stage in a pipeline from the current stage */
export function getPreviousStage(
  pipeline: string[],
  currentStage: string,
): string | null {
  const idx = pipeline.indexOf(currentStage);
  if (idx <= 0) return null;
  return pipeline[idx - 1];
}

/** Check if a batch has reached (or passed) a given stage */
export function hasReachedStage(
  pipeline: string[],
  currentStage: string,
  targetStage: string,
): boolean {
  const currentIdx = pipeline.indexOf(currentStage);
  const targetIdx = pipeline.indexOf(targetStage);
  if (currentIdx < 0 || targetIdx < 0) return false;
  return currentIdx >= targetIdx;
}

/** Check if a stage is the current active stage */
export function isCurrentStage(
  currentStage: string,
  targetStage: string,
): boolean {
  return currentStage === targetStage;
}

/** Get available stages that can be added to a pipeline (not already in it) */
export function getAvailableStages(pipeline: string[]): StageName[] {
  return ALL_STAGES.filter(
    (s) => s !== "Upcoming" && s !== "Bottled" && !pipeline?.includes(s),
  ) as StageName[];
}

/** Validate that a pipeline contains only valid stage names */
export function isValidPipeline(pipeline: string[]): boolean {
  return pipeline.every((stage) => ALL_STAGES.includes(stage as StageName));
}

// --- Volume-based partial transfer helpers ---

import type { Batch, Vessel } from "~/types";
import { convertUnitRatio } from "~/utils/conversions";

/** Get the volume in a specific stage (fallback: full batchSize if no stageVolumes) */
export function getStageVolume(batch: Batch, stage: string): number {
  if (!batch.stageVolumes || Object.keys(batch.stageVolumes).length === 0) {
    // Legacy batch — all volume is in currentStage
    return batch.currentStage === stage ? batch.batchSize || 0 : 0;
  }
  return batch.stageVolumes[stage] || 0;
}

/** Get total volume across all stages */
export function getTotalVolume(batch: Batch): number {
  if (!batch.stageVolumes || Object.keys(batch.stageVolumes).length === 0) {
    return batch.batchSize || 0;
  }
  return Object.values(batch.stageVolumes).reduce((sum, v) => sum + v, 0);
}

/** Check if a stage has volume > 0 */
export function isStageActive(batch: Batch, stage: string): boolean {
  return getStageVolume(batch, stage) > 0;
}

/** Get all stages with volume > 0 */
export function getActiveStages(batch: Batch): string[] {
  if (!batch.stageVolumes || Object.keys(batch.stageVolumes).length === 0) {
    return [batch.currentStage];
  }
  return Object.entries(batch.stageVolumes)
    .filter(([, vol]) => vol > 0)
    .map(([stage]) => stage);
}

/** Check if a batch has stageVolumes tracking initialized */
export function hasStageVolumes(batch: Batch): boolean {
  return !!batch.stageVolumes && Object.keys(batch.stageVolumes).length > 0;
}

/** Format a label like "200 of 600 gal" for a stage's volume */
export function formatStageVolumeLabel(batch: Batch, stage: string): string {
  const stageVol = getStageVolume(batch, stage);
  const total = batch.batchSize || 0;
  const unit = batch.batchSizeUnit || "gal";
  const shortUnit = unit.replace(/gallon/i, "gal").replace(/liter/i, "L");
  if (stageVol === total) return `${stageVol} ${shortUnit}`;
  return `${stageVol} of ${total} ${shortUnit}`;
}

/** Get remaining capacity of a vessel (capacity - current volume), converting units if needed */
export function getVesselRemainingCapacity(vessel: Vessel): number {
  const capacity = vessel.stats?.volume || 0;
  const capUnit = vessel.stats?.volumeUnit || "";
  const currentVolume = vessel.current?.volume || 0;
  const curUnit = vessel.current?.volumeUnit || "";
  const currentInCapUnit = currentVolume * convertUnitRatio(curUnit, capUnit);
  return Math.max(0, capacity - currentInCapUnit);
}

// --- CSS class helpers for stage display ---

const TEXT_COLOR_MAP: Record<string, string> = {
  blue: "text-blue-400",
  orange: "text-orange-400",
  yellow: "text-yellow-400",
  copper: "text-copper",
  emerald: "text-emerald-400",
  sky: "text-sky-400",
  amber: "text-amber-400",
  purple: "text-purple-400",
  pink: "text-pink-400",
  cyan: "text-cyan-400",
  green: "text-green-400",
};

const BG_COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-500/30",
  orange: "bg-orange-500/10 border-orange-500/30",
  yellow: "bg-yellow-500/10 border-yellow-500/30",
  copper: "bg-copper/10 border-copper/30",
  emerald: "bg-emerald-500/10 border-emerald-500/30",
  sky: "bg-sky-500/10 border-sky-500/30",
  amber: "bg-amber-500/10 border-amber-500/30",
  purple: "bg-purple-500/10 border-purple-500/30",
  pink: "bg-pink-500/10 border-pink-500/30",
  cyan: "bg-cyan-500/10 border-cyan-500/30",
  green: "bg-green-500/10 border-green-500/30",
};

/** Get text color class for a stage color key */
export function stageTextColor(color: string): string {
  return TEXT_COLOR_MAP[color] || "text-parchment/60";
}

/** Get background + border class for a stage color key */
export function stageBgColor(color: string): string {
  return BG_COLOR_MAP[color] || "bg-brown/10 border-brown/30";
}

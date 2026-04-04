import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';

const ALL_STAGES = [
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
  "Bottled"
];
const PIPELINE_TEMPLATES = {
  "Grain Spirit (Barreled)": [
    "Mashing",
    "Fermenting",
    "Distilling",
    "Barrel Aging",
    "Storage",
    "Proofing",
    "Bottled"
  ],
  "Grain Spirit (Unbarreled)": [
    "Mashing",
    "Fermenting",
    "Distilling",
    "Storage",
    "Proofing",
    "Bottled"
  ],
  "Redistilled Gin": [
    "Maceration",
    "Distilling",
    "Storage",
    "Proofing",
    "Bottled"
  ],
  "Compounded Gin": [
    "Maceration",
    "Filtering",
    "Storage",
    "Proofing",
    "Bottled"
  ],
  "Liqueur/Cordial": [
    "Maceration",
    "Filtering",
    "Blending",
    "Storage",
    "Proofing",
    "Bottled"
  ],
  "Neutral Spirit": [
    "Mashing",
    "Fermenting",
    "Distilling",
    "Storage"
  ],
  Custom: []
};
const STAGE_KEY_MAP = {
  Mashing: "mashing",
  Fermenting: "fermenting",
  Distilling: "distilling",
  Maceration: "maceration",
  Filtering: "filtering",
  "Barrel Aging": "barrelAging",
  Storage: "storage",
  Blending: "blending",
  Proofing: "proofing",
  Bottled: "bottled"
};
const STAGE_DISPLAY = {
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
  Bottled: { icon: "i-lucide-wine", color: "green" }
};
const STAGE_VESSEL_TYPE = {
  Mashing: "Mash Tun",
  Fermenting: "Fermenter",
  Distilling: "Still",
  Maceration: "Tank",
  Filtering: "Tank",
  "Barrel Aging": "Barrel",
  Storage: "Tank",
  Blending: "Tank",
  Proofing: "Tank"
};
function getStageIndex(pipeline, stage) {
  return pipeline.indexOf(stage);
}
function getNextStage(pipeline, currentStage) {
  const idx = pipeline.indexOf(currentStage);
  if (idx < 0 || idx >= pipeline.length - 1) return null;
  return pipeline[idx + 1];
}
function getPreviousStage(pipeline, currentStage) {
  const idx = pipeline.indexOf(currentStage);
  if (idx <= 0) return null;
  return pipeline[idx - 1];
}
function hasReachedStage(pipeline, currentStage, targetStage) {
  const currentIdx = pipeline.indexOf(currentStage);
  const targetIdx = pipeline.indexOf(targetStage);
  if (currentIdx < 0 || targetIdx < 0) return false;
  return currentIdx >= targetIdx;
}
function getAvailableStages(pipeline) {
  return ALL_STAGES.filter(
    (s) => s !== "Upcoming" && !pipeline?.includes(s)
  );
}
function getStageVolume(batch, stage) {
  if (!batch.stageVolumes || Object.keys(batch.stageVolumes).length === 0) {
    return batch.currentStage === stage ? batch.batchSize || 0 : 0;
  }
  return batch.stageVolumes[stage] || 0;
}
function isStageActive(batch, stage) {
  return getStageVolume(batch, stage) > 0;
}
function getActiveStages(batch) {
  if (!batch.stageVolumes || Object.keys(batch.stageVolumes).length === 0) {
    return [batch.currentStage];
  }
  return Object.entries(batch.stageVolumes).filter(([, vol]) => vol > 0).map(([stage]) => stage);
}
function hasStageVolumes(batch) {
  return !!batch.stageVolumes && Object.keys(batch.stageVolumes).length > 0;
}
function getVesselRemainingCapacity(vessel) {
  const capacity = vessel.stats?.volume || 0;
  const capUnit = vessel.stats?.volumeUnit || "";
  const currentVolume = vessel.current?.volume || 0;
  const curUnit = vessel.current?.volumeUnit || "";
  const currentInCapUnit = currentVolume * convertUnitRatio(curUnit, capUnit);
  return Math.max(0, capacity - currentInCapUnit);
}
const TEXT_COLOR_MAP = {
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
  green: "text-green-400"
};
const BG_COLOR_MAP = {
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
  green: "bg-green-500/10 border-green-500/30"
};
function stageTextColor(color) {
  return TEXT_COLOR_MAP[color] || "text-parchment/60";
}
function stageBgColor(color) {
  return BG_COLOR_MAP[color] || "bg-brown/10 border-brown/30";
}

export { ALL_STAGES as A, PIPELINE_TEMPLATES as P, STAGE_KEY_MAP as S, getPreviousStage as a, getStageIndex as b, STAGE_DISPLAY as c, getStageVolume as d, stageTextColor as e, getNextStage as f, getActiveStages as g, hasStageVolumes as h, isStageActive as i, hasReachedStage as j, getAvailableStages as k, getVesselRemainingCapacity as l, STAGE_VESSEL_TYPE as m, stageBgColor as s };
//# sourceMappingURL=batchPipeline-br9pdPdU.mjs.map

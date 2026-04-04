import { h as hasStageVolumes, i as isStageActive, g as getActiveStages, a as getPreviousStage, b as getStageIndex, S as STAGE_KEY_MAP } from './batchPipeline-br9pdPdU.mjs';
import { computed, toRaw } from 'vue';
import { m as useToast } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useAuth } from './useAuth-DX6ojG3V.mjs';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { u as useBulkSpiritStore } from './useBulkSpiritStore-Bx2u4RsR.mjs';
import { u as useItemStore, a as useUnitConversion } from './useItemStore-Cpj9s1UF.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';

const useVesselStore = defineStore("vessels", () => {
  const toast = useToast();
  const defaultVessel = () => ({
    _id: "",
    name: "",
    type: "",
    stats: {
      weight: void 0,
      weightUnit: "",
      volume: void 0,
      volumeUnit: ""
    },
    barrel: {
      size: "",
      char: "",
      cost: void 0
    },
    contents: [],
    current: {
      volume: 0,
      volumeUnit: "",
      abv: 0,
      value: 0
    },
    cost: void 0,
    isUsed: false,
    previousContents: "",
    targetAge: void 0
  });
  const crud = useCrudStore({
    name: "Vessel",
    apiPath: "/api/vessel",
    defaultItem: defaultVessel
  });
  const fermenters = computed(() => crud.items.value.filter((v) => v.type === "Fermenter"));
  const mashTuns = computed(() => crud.items.value.filter((v) => v.type === "Mash Tun"));
  const stills = computed(() => crud.items.value.filter((v) => v.type === "Still"));
  const tanks = computed(() => crud.items.value.filter((v) => v.type === "Tank"));
  const barrels = computed(() => crud.items.value.filter((v) => v.type === "Barrel"));
  const emptyBarrels = computed(
    () => barrels.value.filter(
      (v) => v.status !== "Disposed" && (!v.contents || v.contents.length === 0 || (v.current?.volume ?? 0) === 0)
    )
  );
  const setVessel = (id) => {
    crud.resetItem();
    const found = crud.items.value.find((v) => v._id === id);
    if (found) crud.item.value = structuredClone(toRaw(found));
  };
  const updateVessel = async () => {
    if (crud.item.value.contents && crud.item.value.contents.length > 0) {
      const targetUnit = crud.item.value.stats?.volumeUnit || crud.item.value.contents[0].volumeUnit;
      const totalVolume = crud.item.value.contents.reduce(
        (acc, c) => acc + c.volume * convertUnitRatio(c.volumeUnit, targetUnit),
        0
      );
      const weightedAbv = totalVolume > 0 ? crud.item.value.contents.reduce(
        (acc, c) => acc + c.abv * (c.volume * convertUnitRatio(c.volumeUnit, targetUnit)),
        0
      ) / totalVolume : 0;
      crud.item.value.current = {
        volume: totalVolume,
        volumeUnit: targetUnit,
        abv: weightedAbv,
        value: crud.item.value.contents.reduce((acc, c) => acc + c.value, 0)
      };
    } else {
      crud.item.value.current = {
        volume: 0,
        volumeUnit: crud.item.value.current?.volumeUnit || "",
        abv: 0,
        value: 0
      };
    }
    try {
      await crud.saveItem();
    } catch {
    }
  };
  const emptyVessel = async (id) => {
    setVessel(id);
    if (crud.item.value.type === "Barrel" && crud.item.value.contents?.length) {
      crud.item.value.isUsed = true;
      const batchStore = useBatchStore();
      const recipeStore = useRecipeStore();
      const firstBatchId = crud.item.value.contents[0]?.batch;
      if (firstBatchId) {
        const batch = batchStore.getBatchById(firstBatchId);
        if (batch?.recipe) {
          const recipe = recipeStore.getRecipeById(batch.recipe);
          if (recipe) {
            crud.item.value.previousContents = recipe.type || recipe.name;
          }
        }
      }
    }
    crud.item.value.contents = [];
    crud.item.value.current = {
      volume: 0,
      volumeUnit: "",
      abv: 0,
      value: 0
    };
    await updateVessel();
  };
  const fullTransfer = async (sourceId, destId) => {
    const source = crud.items.value.find((v) => v._id === sourceId);
    const dest = crud.items.value.find((v) => v._id === destId);
    if (!source || !dest) return;
    const sourceContents = source.contents || [];
    const destContents = dest.contents || [];
    dest.contents = [...destContents, ...sourceContents];
    source.contents = [];
    source.current = { volume: 0, volumeUnit: "", abv: 0, value: 0 };
    crud.item.value = dest;
    await updateVessel();
    crud.item.value = source;
    await updateVessel();
    toast.add({ title: "Transfer complete", color: "success", icon: "i-lucide-check-circle" });
  };
  const transferBatch = async (sourceId, destId, transfer) => {
    const source = crud.items.value.find((v) => v._id === sourceId);
    const dest = crud.items.value.find((v) => v._id === destId);
    if (!source || !dest) return;
    const sourceContents = source.contents || [];
    const normalUnit = sourceContents[0]?.volumeUnit || transfer.volumeUnit;
    const totalSourceVolume = sourceContents.reduce(
      (acc, c) => acc + c.volume * convertUnitRatio(c.volumeUnit, normalUnit),
      0
    );
    if (totalSourceVolume <= 0) return;
    const transferInNormalUnit = transfer.volume * convertUnitRatio(transfer.volumeUnit, normalUnit);
    const ratio = transferInNormalUnit / totalSourceVolume;
    const newDestContents = [];
    sourceContents.forEach((content) => {
      const transferVolume = content.volume * ratio;
      content.volume -= transferVolume;
      content.value -= content.value * ratio;
      newDestContents.push({
        batch: content.batch,
        volume: transferVolume,
        volumeUnit: content.volumeUnit,
        abv: content.abv,
        value: content.value > 0 ? content.value / (1 - ratio) * ratio : 0
      });
    });
    source.contents = sourceContents.filter((c) => c.volume > 0);
    dest.contents = [...dest.contents || [], ...newDestContents];
    crud.item.value = dest;
    await updateVessel();
    crud.item.value = source;
    await updateVessel();
    toast.add({ title: "Partial transfer complete", color: "success", icon: "i-lucide-check-circle" });
  };
  const transferBatchContents = async (sourceId, destId, batchId, volume, volumeUnit) => {
    const source = crud.items.value.find((v) => v._id === sourceId);
    const dest = crud.items.value.find((v) => v._id === destId);
    if (!source || !dest) return;
    const sourceContents = source.contents || [];
    const entry = sourceContents.find((c) => c.batch === batchId);
    if (!entry || entry.volume <= 0) return;
    const volumeInEntryUnit = volume * convertUnitRatio(volumeUnit, entry.volumeUnit);
    const actualVolume = Math.min(volumeInEntryUnit, entry.volume);
    const ratio = actualVolume / entry.volume;
    const transferValue = entry.value * ratio;
    const transferAbv = entry.abv;
    entry.volume -= actualVolume;
    entry.value -= transferValue;
    if (entry.volume < 1e-3) {
      source.contents = sourceContents.filter((c) => c !== entry);
    }
    const destUnit = dest.stats?.volumeUnit || entry.volumeUnit;
    const actualVolumeInDestUnit = actualVolume * convertUnitRatio(entry.volumeUnit, destUnit);
    const destContents = dest.contents || [];
    const existingDest = destContents.find((c) => c.batch === batchId);
    if (existingDest) {
      const existingInDestUnit = existingDest.volume * convertUnitRatio(existingDest.volumeUnit, destUnit);
      const totalVol = existingInDestUnit + actualVolumeInDestUnit;
      existingDest.abv = totalVol > 0 ? (existingDest.abv * existingInDestUnit + transferAbv * actualVolumeInDestUnit) / totalVol : 0;
      existingDest.volume = totalVol;
      existingDest.volumeUnit = destUnit;
      existingDest.value += transferValue;
    } else {
      destContents.push({
        batch: batchId,
        volume: actualVolumeInDestUnit,
        volumeUnit: destUnit,
        abv: transferAbv,
        value: transferValue
      });
      dest.contents = destContents;
    }
    const sourceIsBarrel = source.type === "Barrel";
    const sourceNowEmpty = !source.contents || source.contents.length === 0 || source.contents.every((c) => c.volume < 1e-3);
    if (sourceIsBarrel && sourceNowEmpty) {
      source.isUsed = true;
      const batchStore = useBatchStore();
      const recipeStore = useRecipeStore();
      const batch = batchStore.getBatchById(batchId);
      if (batch?.recipe) {
        const recipe = recipeStore.getRecipeById(batch.recipe);
        if (recipe) {
          source.previousContents = recipe.type || recipe.name;
        }
      }
    }
    crud.item.value = source;
    await updateVessel();
    crud.item.value = dest;
    await updateVessel();
  };
  const disposeBarrel = async (id) => {
    setVessel(id);
    if (crud.item.value.contents?.length) {
      crud.item.value.isUsed = true;
      const batchStore = useBatchStore();
      const recipeStore = useRecipeStore();
      const firstBatchId = crud.item.value.contents[0]?.batch;
      if (firstBatchId) {
        const batch = batchStore.getBatchById(firstBatchId);
        if (batch?.recipe) {
          const recipe = recipeStore.getRecipeById(batch.recipe);
          if (recipe) {
            crud.item.value.previousContents = recipe.type || recipe.name;
          }
        }
      }
    }
    const barrelName = crud.item.value.name;
    crud.item.value.contents = [];
    crud.item.value.current = { volume: 0, volumeUnit: "", abv: 0, value: 0 };
    crud.item.value.isUsed = true;
    crud.item.value.status = "Disposed";
    await updateVessel();
    toast.add({ title: "Barrel disposed", description: barrelName, color: "warning", icon: "i-lucide-trash-2" });
  };
  const addContents = async (vesselId, contents) => {
    const target = crud.items.value.find((v) => v._id === vesselId);
    if (!target) return;
    const destUnit = target.stats?.volumeUnit || contents.volumeUnit;
    const existing = (target.contents || []).find((c) => c.batch === contents.batch);
    if (existing) {
      const existingVol = existing.volume * convertUnitRatio(existing.volumeUnit, destUnit);
      const newVol = contents.volume * convertUnitRatio(contents.volumeUnit, destUnit);
      const totalVol = existingVol + newVol;
      existing.abv = totalVol > 0 ? (existing.abv * existingVol + contents.abv * newVol) / totalVol : 0;
      existing.volume = totalVol;
      existing.volumeUnit = destUnit;
      existing.value += contents.value;
    } else {
      target.contents = [...target.contents || [], contents];
    }
    crud.item.value = target;
    await updateVessel();
  };
  const getVesselByType = (type) => {
    return crud.items.value.filter((v) => v.type === type);
  };
  return {
    ...crud,
    // Domain aliases for backward compatibility
    vessels: crud.items,
    vessel: crud.item,
    getVessels: crud.getAll,
    deleteVessel: crud.deleteItem,
    resetVessel: crud.resetItem,
    getVesselById: crud.getById,
    // Override setVessel (resets first)
    setVessel,
    // Override updateVessel (recalculates current from contents)
    updateVessel,
    // Computed filters
    fermenters,
    mashTuns,
    stills,
    tanks,
    barrels,
    emptyBarrels,
    // Domain-specific
    emptyVessel,
    disposeBarrel,
    getVesselByType,
    fullTransfer,
    transferBatch,
    transferBatchContents,
    addContents
  };
});
const emptyStages = () => ({});
const defaultBatch = () => ({
  _id: "",
  recipe: "",
  pipeline: ["Mashing", "Fermenting", "Distilling", "Storage", "Proofing", "Bottled"],
  currentStage: "Upcoming",
  status: "active",
  recipeCost: void 0,
  batchSize: void 0,
  batchSizeUnit: "gallon",
  batchCost: void 0,
  barrelCost: void 0,
  stages: emptyStages(),
  stageVolumes: {},
  transferLog: []
});
const useBatchStore = defineStore("batches", () => {
  const toast = useToast();
  const crud = useCrudStore({
    name: "Batch",
    apiPath: "/api/batch",
    defaultItem: defaultBatch
  });
  const activeBatches = computed(
    () => crud.items.value.filter((b) => b.status === "active")
  );
  const completedBatches = computed(
    () => crud.items.value.filter((b) => b.status === "completed")
  );
  const upcomingBatches = computed(() => getBatchesInStage("Upcoming"));
  const mashingBatches = computed(() => getBatchesInStage("Mashing"));
  const fermentingBatches = computed(() => getBatchesInStage("Fermenting"));
  const distillingBatches = computed(() => getBatchesInStage("Distilling"));
  const storedBatches = computed(() => getBatchesInStage("Storage"));
  const barrelAgingBatches = computed(() => getBatchesInStage("Barrel Aging"));
  const macerationBatches = computed(() => getBatchesInStage("Maceration"));
  const updateBatch = async () => {
    const isNew = !crud.item.value._id;
    if (isNew) {
      const recipeStore = useRecipeStore();
      const recipeName = recipeStore.getRecipeById(crud.item.value.recipe)?.name;
      addLogEntry(crud.item.value, "Batch created", recipeName ? `From recipe: ${recipeName}` : void 0);
      if (!crud.item.value.stageVolumes || Object.keys(crud.item.value.stageVolumes).length === 0) {
        crud.item.value.stageVolumes = { "Upcoming": crud.item.value.batchSize || 0 };
      }
    }
    await crud.saveItem();
  };
  const ensureStageVolumes = (target) => {
    if (!target.stageVolumes || Object.keys(target.stageVolumes).length === 0) {
      target.stageVolumes = { [target.currentStage]: target.batchSize || 0 };
    }
    if (!target.transferLog) {
      target.transferLog = [];
    }
  };
  const getCurrentUserName = () => {
    const { user } = useAuth();
    return user.value ? `${user.value.firstName || ""} ${user.value.lastName || ""}`.trim() || user.value.email : void 0;
  };
  const addTransferLogEntry = (target, entry) => {
    if (!target.transferLog) target.transferLog = [];
    target.transferLog.push({
      ...entry,
      date: /* @__PURE__ */ new Date(),
      user: getCurrentUserName()
    });
  };
  const startFirstStage = async (batchId, vesselId, transferVolume) => {
    const vesselStore = useVesselStore();
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target) return;
    ensureStageVolumes(target);
    const firstStage = target.pipeline[0];
    const upcomingVolume = target.stageVolumes["Upcoming"] || target.batchSize || 0;
    const actualVolume = transferVolume != null ? Math.min(transferVolume, upcomingVolume) : upcomingVolume;
    const remainingUpcoming = upcomingVolume - actualVolume;
    if (remainingUpcoming > 1e-3) {
      target.stageVolumes["Upcoming"] = remainingUpcoming;
    } else {
      delete target.stageVolumes["Upcoming"];
    }
    target.stageVolumes[firstStage] = (target.stageVolumes[firstStage] || 0) + actualVolume;
    const firstStageIdx = getStageIndex(target.pipeline, firstStage);
    const currentIdx = target.currentStage === "Upcoming" ? -1 : getStageIndex(target.pipeline, target.currentStage);
    if (firstStageIdx > currentIdx) {
      target.currentStage = firstStage;
    }
    const stageKey = STAGE_KEY_MAP[firstStage];
    if (stageKey) {
      if (!target.stages[stageKey]) {
        target.stages[stageKey] = {};
      }
      const stage = target.stages[stageKey];
      if (!stage.startedAt) {
        stage.startedAt = /* @__PURE__ */ new Date();
      }
      if (vesselId && !stage.vessel) {
        stage.vessel = vesselId;
      }
    }
    addTransferLogEntry(target, {
      from: "Upcoming",
      to: firstStage,
      volume: actualVolume,
      volumeUnit: target.batchSizeUnit || "gallon",
      vessel: vesselId || void 0
    });
    addLogEntry(target, `Transferred ${actualVolume} ${target.batchSizeUnit || "gal"} to ${firstStage}`);
    crud.item.value = target;
    await updateBatch();
    if (vesselId) {
      await vesselStore.addContents(vesselId, {
        batch: batchId,
        volume: actualVolume,
        volumeUnit: target.batchSizeUnit || "gallon",
        abv: 0,
        value: (target.batchCost || 0) * (actualVolume / (target.batchSize || actualVolume))
      });
    }
    if (firstStage === "Mashing") {
      await withdrawMashIngredients(batchId);
    }
    await withdrawBulkSpirits(batchId);
  };
  const advanceToStage = async (batchId, targetStage, stageData, transferVolume, sourceStage, destinationVolume) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target) return;
    ensureStageVolumes(target);
    const targetIdx = getStageIndex(target.pipeline, targetStage);
    let fromStage = sourceStage;
    if (!fromStage) {
      if (targetIdx === 0) {
        fromStage = "Upcoming";
      } else if (targetIdx > 0) {
        fromStage = target.pipeline[targetIdx - 1];
      } else {
        fromStage = target.currentStage;
      }
    }
    const sourceVolume = target.stageVolumes[fromStage] || 0;
    const actualVolume = transferVolume != null ? Math.min(transferVolume, sourceVolume) : sourceVolume;
    if (actualVolume <= 0) return;
    const remainingSource = sourceVolume - actualVolume;
    if (remainingSource > 1e-3) {
      target.stageVolumes[fromStage] = remainingSource;
    } else {
      delete target.stageVolumes[fromStage];
      const sourceKey = STAGE_KEY_MAP[fromStage];
      if (sourceKey && target.stages[sourceKey]) {
        target.stages[sourceKey].completedAt = /* @__PURE__ */ new Date();
      }
    }
    const destVol = destinationVolume != null ? destinationVolume : actualVolume;
    target.stageVolumes[targetStage] = (target.stageVolumes[targetStage] || 0) + destVol;
    const currentIdx = target.currentStage === "Upcoming" ? -1 : getStageIndex(target.pipeline, target.currentStage);
    if (targetIdx > currentIdx) {
      target.currentStage = targetStage;
    }
    const newStageKey = STAGE_KEY_MAP[targetStage];
    if (newStageKey) {
      if (!target.stages[newStageKey]) {
        target.stages[newStageKey] = {};
      }
      const stage = target.stages[newStageKey];
      if (!stage.startedAt) {
        stage.startedAt = /* @__PURE__ */ new Date();
      }
      if (stageData?.vessel && !stage.vessel) {
        stage.vessel = stageData.vessel;
      }
    }
    if (targetStage === "Bottled") {
      const activeNonBottled = Object.entries(target.stageVolumes).filter(([stage, vol]) => stage !== "Bottled" && vol > 0);
      if (activeNonBottled.length === 0) {
        target.status = "completed";
      }
    }
    addTransferLogEntry(target, {
      from: fromStage,
      to: targetStage,
      volume: destVol,
      volumeUnit: target.batchSizeUnit || "gallon",
      vessel: stageData?.vessel || void 0
    });
    if (destinationVolume != null && destinationVolume !== actualVolume) {
      addLogEntry(target, `Distilled ${actualVolume} ${target.batchSizeUnit || "gal"} from ${fromStage}, collected ${destVol} ${target.batchSizeUnit || "gal"} to ${targetStage}`);
    } else {
      addLogEntry(target, `Transferred ${actualVolume} ${target.batchSizeUnit || "gal"} from ${fromStage} to ${targetStage}`);
    }
    crud.item.value = target;
    await updateBatch();
    if (targetStage === "Mashing") {
      await withdrawMashIngredients(batchId);
    }
  };
  const updateStageData = async (batchId, stageName, data, logMessage) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target) return;
    const stageKey = STAGE_KEY_MAP[stageName];
    if (!stageKey) return;
    if (!target.stages[stageKey]) {
      target.stages[stageKey] = {};
    }
    Object.assign(target.stages[stageKey], data);
    addLogEntry(target, logMessage || `Updated ${stageName} data`);
    crud.item.value = target;
    await updateBatch();
  };
  const revertToPreviousStage = async (batchId, fromStage) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target) return;
    ensureStageVolumes(target);
    const prevStage = getPreviousStage(target.pipeline, fromStage);
    if (!prevStage) return;
    const volumeToRevert = target.stageVolumes[fromStage] || 0;
    if (volumeToRevert <= 0) return;
    delete target.stageVolumes[fromStage];
    target.stageVolumes[prevStage] = (target.stageVolumes[prevStage] || 0) + volumeToRevert;
    const prevKey = STAGE_KEY_MAP[prevStage];
    if (prevKey && target.stages[prevKey]) {
      delete target.stages[prevKey].completedAt;
    }
    if (target.status === "completed") {
      target.status = "active";
    }
    const activeStages2 = Object.entries(target.stageVolumes).filter(([, vol]) => vol > 0).map(([stage]) => stage);
    let furthestIdx = -1;
    for (const stage of activeStages2) {
      if (stage === "Upcoming") continue;
      const idx = getStageIndex(target.pipeline, stage);
      if (idx > furthestIdx) furthestIdx = idx;
    }
    target.currentStage = furthestIdx >= 0 ? target.pipeline[furthestIdx] : activeStages2.includes("Upcoming") ? "Upcoming" : target.pipeline[0];
    addTransferLogEntry(target, {
      from: fromStage,
      to: prevStage,
      volume: volumeToRevert,
      volumeUnit: target.batchSizeUnit || "gallon"
    });
    addLogEntry(target, `Reverted ${volumeToRevert} ${target.batchSizeUnit || "gal"} from ${fromStage} back to ${prevStage}`);
    crud.item.value = target;
    await updateBatch();
  };
  const addDistillingRun = async (batchId, run) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target) return;
    if (!target.stages.distilling) {
      target.stages.distilling = {};
    }
    if (!target.stages.distilling.runs) target.stages.distilling.runs = [];
    run.runNumber = target.stages.distilling.runs.length + 1;
    target.stages.distilling.runs.push(run);
    addLogEntry(target, `Added distilling run #${run.runNumber}`, `${run.runType} run`);
    crud.item.value = target;
    await updateBatch();
  };
  const updateDistillingRun = async (batchId, runIndex, data) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target?.stages?.distilling?.runs?.[runIndex]) return;
    Object.assign(target.stages.distilling.runs[runIndex], data);
    addLogEntry(target, `Updated distilling run #${target.stages.distilling.runs[runIndex].runNumber}`);
    crud.item.value = target;
    await updateBatch();
  };
  const deleteDistillingRun = async (batchId, runIndex) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target?.stages?.distilling?.runs?.[runIndex]) return;
    const removedNumber = target.stages.distilling.runs[runIndex].runNumber;
    target.stages.distilling.runs.splice(runIndex, 1);
    target.stages.distilling.runs.forEach((r, i) => {
      r.runNumber = i + 1;
    });
    addLogEntry(target, `Deleted distilling run #${removedNumber}`);
    crud.item.value = target;
    await updateBatch();
  };
  const addLogEntry = (target, action, details) => {
    if (!target.log) target.log = [];
    const userName = getCurrentUserName();
    target.log.push({
      date: /* @__PURE__ */ new Date(),
      action,
      details,
      user: userName || void 0
    });
  };
  const addNote = async (batchId, note) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target) return;
    addLogEntry(target, "Note added", note);
    crud.item.value = target;
    await updateBatch();
  };
  const addTastingNote = async (batchId, note) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target) return;
    if (!target.tastingNotes) target.tastingNotes = [];
    target.tastingNotes.push({
      ...note,
      addedBy: getCurrentUserName()
    });
    addLogEntry(target, "Tasting note added", note.abv ? `ABV: ${note.abv}%` : void 0);
    crud.item.value = target;
    await updateBatch();
  };
  const deleteTastingNote = async (batchId, noteIndex) => {
    const target = crud.items.value.find((b) => b._id === batchId);
    if (!target || !target.tastingNotes?.[noteIndex]) return;
    target.tastingNotes.splice(noteIndex, 1);
    addLogEntry(target, "Tasting note removed");
    crud.item.value = target;
    await updateBatch();
  };
  const getBatchesInStage = (stage) => {
    return crud.items.value.filter((b) => {
      if (b.status !== "active") return false;
      if (hasStageVolumes(b)) {
        return isStageActive(b, stage);
      }
      return b.currentStage === stage;
    });
  };
  const getBatchesByCurrentStage = (stage) => {
    return crud.items.value.filter((b) => b.currentStage === stage && b.status === "active");
  };
  const getBatchByStatus = (status) => {
    return crud.items.value.filter((b) => b.status === status);
  };
  const activeStages = computed(() => {
    const stages = /* @__PURE__ */ new Set();
    for (const b of activeBatches.value) {
      if (hasStageVolumes(b)) {
        for (const stage of getActiveStages(b)) {
          stages.add(stage);
        }
      } else {
        stages.add(b.currentStage);
      }
    }
    return [...stages];
  });
  const getRecipeNameByBatchId = (id) => {
    const recipeStore = useRecipeStore();
    const b = crud.getById(id);
    if (b?.recipe) {
      const recipe = recipeStore.getRecipeById(b.recipe);
      return recipe?.name;
    }
  };
  const withdrawBulkSpirits = async (batchId) => {
    const recipeStore = useRecipeStore();
    const bulkSpiritStore = useBulkSpiritStore();
    const batch = crud.items.value.find((b) => b._id === batchId);
    if (!batch) return;
    const recipe = recipeStore.getRecipeById(batch.recipe);
    if (!recipe?.bulkSpirits?.length) return;
    let scaleFactor = 1;
    if (recipe.volume) {
      const { convertQuantity } = useUnitConversion();
      const batchInRecipeUnits = convertQuantity(
        batch.batchSize,
        batch.batchSizeUnit,
        recipe.volumeUnit
      );
      scaleFactor = batchInRecipeUnits / recipe.volume;
    }
    let totalWithdrawnValue = 0;
    const summary = [];
    for (const bsIngredient of recipe.bulkSpirits) {
      const spirit = bulkSpiritStore.getBulkSpiritById(bsIngredient.bulkSpirit);
      if (!spirit) continue;
      const scaledVolume = bsIngredient.volume * scaleFactor;
      try {
        const result = await bulkSpiritStore.withdraw(bsIngredient.bulkSpirit, {
          batchId,
          volume: scaledVolume,
          volumeUnit: bsIngredient.volumeUnit
        });
        totalWithdrawnValue += result.value;
        summary.push(`${scaledVolume.toFixed(1)} ${bsIngredient.volumeUnit} ${spirit.name}`);
      } catch {
      }
    }
    if (totalWithdrawnValue > 0) {
      batch.batchCost = (batch.batchCost || 0) + totalWithdrawnValue;
      addLogEntry(batch, "Bulk spirits withdrawn", summary.join(", "));
      crud.item.value = batch;
      await updateBatch();
    }
  };
  const withdrawMashIngredients = async (batchId) => {
    const recipeStore = useRecipeStore();
    const itemStore = useItemStore();
    const inventoryStore = useInventoryStore();
    const { convertQuantity } = useUnitConversion();
    const batch = crud.items.value.find((b) => b._id === batchId);
    if (!batch) return;
    const mashStage = batch.stages?.mashing;
    if (mashStage?.ingredientsWithdrawn) return;
    const recipe = recipeStore.getRecipeById(batch.recipe);
    if (!recipe || !recipe.items || recipe.items.length === 0) return;
    let scaleFactor = 1;
    if (recipe.volume) {
      const batchInRecipeUnits = convertQuantity(
        batch.batchSize,
        batch.batchSizeUnit,
        recipe.volumeUnit
      );
      scaleFactor = batchInRecipeUnits / recipe.volume;
    }
    const inventoryRecords = [];
    const summary = [];
    for (const recipeItem of recipe.items) {
      const item = itemStore.getItemById(recipeItem._id);
      if (!item) continue;
      if (item.trackInventory === false) continue;
      const scaledAmount = recipeItem.amount * scaleFactor;
      const inventoryUnit = item.inventoryUnit || recipeItem.unit;
      const deductionInInventoryUnits = recipeItem.unit !== inventoryUnit ? convertQuantity(scaledAmount, recipeItem.unit, inventoryUnit) : scaledAmount;
      const currentStock = inventoryStore.getCurrentStock(recipeItem._id);
      const newStock = Math.max(0, currentStock - deductionInInventoryUnits);
      inventoryRecords.push({
        item: recipeItem._id,
        quantity: Math.round(newStock * 100) / 100,
        date: /* @__PURE__ */ new Date()
      });
      summary.push({
        name: item.name,
        amount: Math.round(deductionInInventoryUnits * 100) / 100,
        unit: inventoryUnit
      });
    }
    if (inventoryRecords.length === 0) return;
    try {
      await inventoryStore.createBulk(inventoryRecords);
    } catch {
      return;
    }
    if (!batch.stages.mashing) {
      batch.stages.mashing = {};
    }
    batch.stages.mashing.ingredientsWithdrawn = true;
    addLogEntry(batch, "Mash ingredients withdrawn from inventory", summary.map((s) => `-${s.amount} ${s.unit} ${s.name}`).join(", "));
    crud.item.value = batch;
    await updateBatch();
    const recipeName = recipe.name || "recipe";
    const lines = summary.map((s) => `-${s.amount} ${s.unit} ${s.name}`);
    toast.add({
      title: `Ingredients withdrawn for ${recipeName}`,
      description: lines.join(", "),
      color: "success",
      icon: "i-lucide-archive",
      duration: 8e3
    });
  };
  return {
    ...crud,
    // Domain aliases for backward compatibility
    batches: crud.items,
    batch: crud.item,
    getBatches: crud.getAll,
    deleteBatch: crud.deleteItem,
    resetBatch: crud.resetItem,
    setBatch: crud.setItem,
    getBatchById: crud.getById,
    // Custom updateBatch (adds log entry for new batches)
    updateBatch,
    // Computed filters
    activeBatches,
    completedBatches,
    upcomingBatches,
    mashingBatches,
    fermentingBatches,
    distillingBatches,
    storedBatches,
    barrelAgingBatches,
    macerationBatches,
    activeStages,
    // Pipeline advancement
    advanceToStage,
    startFirstStage,
    updateStageData,
    revertToPreviousStage,
    // Distilling run management
    addDistillingRun,
    updateDistillingRun,
    deleteDistillingRun,
    // Activity log
    addNote,
    // Tasting notes
    addTastingNote,
    deleteTastingNote,
    // Inventory
    withdrawMashIngredients,
    withdrawBulkSpirits,
    // Getters
    getBatchesInStage,
    getBatchesByCurrentStage,
    getBatchByStatus,
    getRecipeNameByBatchId
  };
});

export { useBatchStore as a, useVesselStore as u };
//# sourceMappingURL=useBatchStore-C5x8JeHz.mjs.map

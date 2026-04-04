import { c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
import { computed } from 'vue';
import { l as latestPrice } from './helpers-pfHQ8kqT.mjs';

const TTB_CBMA_TIER1_RATE = 2.7;
const TABC_TAX_RATE = 2.4;
function bottleToWineGallons(bottle) {
  const vol = bottle.volume || 750;
  const unit = (bottle.volumeUnit || "mL").toLowerCase();
  if (unit === "ml" || unit.includes("milli")) return vol * 264172e-9;
  if (unit === "l" || unit.includes("liter")) return vol * 0.264172;
  if (unit.includes("oz")) return vol * 78125e-7;
  if (unit.includes("gal")) return vol;
  return vol * 264172e-9;
}
function useProductionCosts({ localData, vesselStore, bottleStore, batchStore, recipeStore, linkedBatchId }) {
  const linkedBatch = computed(() => {
    const id = linkedBatchId?.value;
    if (!id) return null;
    return batchStore.getBatchById(id) || null;
  });
  const calculatedBatchCost = computed(() => {
    let total = 0;
    if (localData.value.vessel?.length > 0) {
      localData.value.vessel.forEach((vid) => {
        const v = vesselStore.getVesselById(vid);
        v?.contents?.forEach(
          (c) => total += c.value || 0
        );
      });
    }
    if (total === 0 && linkedBatch.value) {
      total = linkedBatch.value.recipeCost || linkedBatch.value.batchCost || 0;
    }
    return total;
  });
  const calculatedBarrelCost = computed(() => {
    let total = 0;
    if (localData.value.vessel?.length > 0) {
      localData.value.vessel.forEach((vid) => {
        const v = vesselStore.getVesselById(vid);
        total += v?.barrel?.cost || 0;
      });
    }
    if (total === 0 && linkedBatch.value) {
      total = linkedBatch.value.barrelCost || 0;
    }
    return total;
  });
  const calculatedBottlingCost = computed(() => {
    const glassCost = localData.value.bottling?.glassware ? latestPrice(localData.value.bottling.glassware) || 0 : 0;
    const capCost = localData.value.bottling?.cap ? latestPrice(localData.value.bottling.cap) || 0 : 0;
    const labelCost = localData.value.bottling?.label ? latestPrice(localData.value.bottling.label) || 0 : 0;
    return (glassCost + capCost + labelCost) * (localData.value.quantity || 0);
  });
  const calculatedTtbTax = computed(() => {
    const bottle = localData.value.bottle ? bottleStore.getBottleById(localData.value.bottle) : null;
    if (!bottle || !localData.value.quantity) return 0;
    const wgPerBottle = bottleToWineGallons(bottle);
    const totalWG = wgPerBottle * localData.value.quantity;
    const proofGallons = calculateProofGallons(totalWG, "gallon", bottle.abv || 0);
    return +(proofGallons * TTB_CBMA_TIER1_RATE).toFixed(2);
  });
  const calculatedTabcTax = computed(() => {
    const bottle = localData.value.bottle ? bottleStore.getBottleById(localData.value.bottle) : null;
    if (!bottle || !localData.value.quantity) return 0;
    const wgPerBottle = bottleToWineGallons(bottle);
    const totalWG = wgPerBottle * localData.value.quantity;
    return +(totalWG * TABC_TAX_RATE).toFixed(2);
  });
  const totalProductionCost = computed(() => {
    return calculatedBatchCost.value + calculatedBarrelCost.value + calculatedBottlingCost.value + (localData.value.costs?.labor || 0) + calculatedTtbTax.value + calculatedTabcTax.value + (localData.value.costs?.other || 0);
  });
  const perBottleCost = computed(() => {
    return localData.value.quantity > 0 ? totalProductionCost.value / localData.value.quantity : 0;
  });
  const costBreakdownLines = computed(() => [
    { label: "Batch / Spirit", value: calculatedBatchCost.value, auto: true },
    { label: "Barrel", value: calculatedBarrelCost.value, auto: true },
    { label: "Bottling Materials", value: calculatedBottlingCost.value, auto: true },
    { label: "Labor", value: localData.value.costs?.labor || 0, auto: false },
    { label: "TTB Federal Excise Tax", value: calculatedTtbTax.value, auto: true },
    { label: "TABC Texas Excise Tax", value: calculatedTabcTax.value, auto: true },
    { label: "Other", value: localData.value.costs?.other || 0, auto: false }
  ]);
  const vesselLabels = computed(() => {
    const vessels = vesselStore.vessels.filter(
      (v) => v.type.toLowerCase() === "barrel" || v.type.toLowerCase() === "tank"
    );
    return vessels.map((vessel) => {
      if (!vessel.contents || vessel.contents.length === 0) {
        return { _id: vessel._id, name: vessel.name + " - empty" };
      }
      const recipeNames = vessel.contents.map((content) => {
        const batch = batchStore.getBatchById(content.batch);
        const recipe = recipeStore.getRecipeById(batch?.recipe?.toString());
        return recipe?.name || "empty";
      });
      return {
        _id: vessel._id,
        name: vessel.name + " - " + recipeNames.join(", ")
      };
    });
  });
  const selectedVesselDetails = computed(() => {
    if (!localData.value.vessel?.length)
      return [];
    return localData.value.vessel.reduce(
      (acc, vid) => {
        const v = vesselStore.getVesselById(vid);
        if (!v) return acc;
        const contentsNames = v.contents?.map((c) => {
          const batch = batchStore.getBatchById(c.batch);
          return batch?.recipe ? recipeStore.getRecipeById(batch.recipe)?.name || "Unknown" : "Unknown";
        }) || [];
        acc.push({
          name: v.name,
          contents: contentsNames,
          volume: v.current?.volume,
          volumeUnit: v.current?.volumeUnit
        });
        return acc;
      },
      []
    );
  });
  return {
    calculatedBatchCost,
    calculatedBarrelCost,
    calculatedBottlingCost,
    calculatedTtbTax,
    calculatedTabcTax,
    totalProductionCost,
    perBottleCost,
    costBreakdownLines,
    vesselLabels,
    selectedVesselDetails
  };
}

export { bottleToWineGallons as b, useProductionCosts as u };
//# sourceMappingURL=useProductionCosts-BgHwywl6.mjs.map

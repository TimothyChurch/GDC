import { c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
import { computed } from 'vue';
import { m as useToast } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';

const useBulkSpiritStore = defineStore("bulkSpirits", () => {
  const toast = useToast();
  const crud = useCrudStore({
    name: "Bulk Spirit",
    apiPath: "/api/bulkSpirit",
    defaultItem: () => ({
      _id: "",
      name: "",
      spiritClass: "",
      vessel: void 0,
      volume: 0,
      volumeUnit: "gallon",
      abv: 0,
      proofGallons: 0,
      costPerProofGallon: 0,
      totalValue: 0,
      deposits: [],
      withdrawals: [],
      status: "active",
      notes: ""
    })
  });
  const activeBulkSpirits = computed(
    () => crud.items.value.filter((bs) => bs.status === "active")
  );
  const depletedBulkSpirits = computed(
    () => crud.items.value.filter((bs) => bs.status === "depleted")
  );
  const deposit = async (bulkSpiritId, params) => {
    const target = crud.items.value.find((bs) => bs._id === bulkSpiritId);
    if (!target) return;
    const depositPG = calculateProofGallons(params.volume, params.volumeUnit, params.abv);
    const depositCostPerPG = depositPG > 0 ? params.value / depositPG : 0;
    const depositEntry = {
      batch: params.batchId,
      date: /* @__PURE__ */ new Date(),
      volume: params.volume,
      volumeUnit: params.volumeUnit,
      abv: params.abv,
      proofGallons: depositPG,
      value: params.value,
      costPerProofGallon: depositCostPerPG
    };
    const existingPG = target.proofGallons || 0;
    const existingValue = target.totalValue || 0;
    const newTotalPG = existingPG + depositPG;
    const newTotalValue = existingValue + params.value;
    const newCostPerPG = newTotalPG > 0 ? newTotalValue / newTotalPG : 0;
    const existingVolume = target.volume || 0;
    const newTotalVolume = existingVolume + params.volume;
    const newAbv = newTotalVolume > 0 ? (existingVolume * (target.abv || 0) + params.volume * params.abv) / newTotalVolume : 0;
    target.deposits = [...target.deposits || [], depositEntry];
    target.volume = newTotalVolume;
    target.abv = Math.round(newAbv * 100) / 100;
    target.proofGallons = Math.round(newTotalPG * 1e4) / 1e4;
    target.costPerProofGallon = Math.round(newCostPerPG * 100) / 100;
    target.totalValue = Math.round(newTotalValue * 100) / 100;
    target.status = "active";
    crud.item.value = target;
    await crud.saveItem();
    toast.add({
      title: "Deposited to bulk spirit",
      description: `${params.volume} ${params.volumeUnit} at ${params.abv}% ABV (${depositPG.toFixed(2)} PG)`,
      color: "success",
      icon: "i-lucide-archive"
    });
  };
  const withdraw = async (bulkSpiritId, params) => {
    const target = crud.items.value.find((bs) => bs._id === bulkSpiritId);
    if (!target) throw new Error("Bulk spirit not found");
    if (params.volume > target.volume) {
      throw new Error(`Insufficient volume: requested ${params.volume}, available ${target.volume}`);
    }
    const withdrawAbv = target.abv;
    const withdrawPG = calculateProofGallons(params.volume, params.volumeUnit, withdrawAbv);
    const withdrawValue = withdrawPG * target.costPerProofGallon;
    const withdrawalEntry = {
      batch: params.batchId,
      date: /* @__PURE__ */ new Date(),
      volume: params.volume,
      volumeUnit: params.volumeUnit,
      abv: withdrawAbv,
      proofGallons: withdrawPG,
      value: Math.round(withdrawValue * 100) / 100,
      costPerProofGallon: target.costPerProofGallon
    };
    target.withdrawals = [...target.withdrawals || [], withdrawalEntry];
    target.volume = Math.max(0, target.volume - params.volume);
    target.proofGallons = Math.max(0, target.proofGallons - withdrawPG);
    target.totalValue = Math.max(0, target.totalValue - withdrawValue);
    if (target.volume < 1e-3) {
      target.status = "depleted";
      target.volume = 0;
      target.proofGallons = 0;
      target.totalValue = 0;
    }
    crud.item.value = target;
    await crud.saveItem();
    toast.add({
      title: "Withdrawn from bulk spirit",
      description: `${params.volume} ${params.volumeUnit} ($${withdrawValue.toFixed(2)})`,
      color: "success",
      icon: "i-lucide-arrow-right-from-line"
    });
    return {
      value: Math.round(withdrawValue * 100) / 100,
      proofGallons: withdrawPG,
      abv: withdrawAbv
    };
  };
  return {
    ...crud,
    bulkSpirits: crud.items,
    bulkSpirit: crud.item,
    getBulkSpirits: crud.getAll,
    deleteBulkSpirit: crud.deleteItem,
    resetBulkSpirit: crud.resetItem,
    setBulkSpirit: crud.setItem,
    getBulkSpiritById: crud.getById,
    activeBulkSpirits,
    depletedBulkSpirits,
    deposit,
    withdraw
  };
});

export { useBulkSpiritStore as u };
//# sourceMappingURL=useBulkSpiritStore-Bx2u4RsR.mjs.map

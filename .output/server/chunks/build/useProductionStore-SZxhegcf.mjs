import { m as useToast } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';

const useProductionStore = defineStore("productions", () => {
  const toast = useToast();
  const crud = useCrudStore({
    name: "Production",
    apiPath: "/api/production",
    defaultItem: () => ({
      _id: "",
      date: /* @__PURE__ */ new Date(),
      vessel: [],
      bottle: "",
      bottling: {
        glassware: "",
        cap: "",
        label: ""
      },
      quantity: 0,
      costs: {
        batch: 0,
        barrel: 0,
        bottling: 0,
        labor: 0,
        ttbTax: 0,
        tabcTax: 0,
        other: 0
      },
      productionCost: 0,
      bottleCost: 0
    })
  });
  const getProductionById = async (id) => {
    crud.item.value = await $fetch(`/api/production/${id}`);
  };
  const createAndReturnId = async (data) => {
    crud.saving.value = true;
    try {
      const created = await $fetch("/api/production/create", {
        method: "POST",
        body: data
      });
      crud.items.value.push(created);
      toast.add({ title: "Production created", color: "success", icon: "i-lucide-check-circle" });
      return created._id;
    } catch (error) {
      toast.add({ title: "Failed to create production", description: getErrorMessage(error), color: "error", icon: "i-lucide-alert-circle" });
      return null;
    } finally {
      crud.saving.value = false;
    }
  };
  const adjustInventoryForProduction = async (prod) => {
    const inventoryStore = useInventoryStore();
    const itemStore = useItemStore();
    const bottleStore = useBottleStore();
    if (!prod.quantity || prod.quantity <= 0) return [];
    const summary = [];
    const inventoryRecords = [];
    if (prod.bottle) {
      const bottle = bottleStore.getBottleById(prod.bottle);
      if (bottle) {
        const currentBottleStock = inventoryStore.getCurrentStock(prod.bottle);
        const newBottleStock = currentBottleStock + prod.quantity;
        inventoryRecords.push({
          item: prod.bottle,
          quantity: newBottleStock,
          date: /* @__PURE__ */ new Date()
        });
        summary.push({
          itemName: bottle.name,
          change: prod.quantity,
          newStock: newBottleStock
        });
      }
    }
    const materialIds = [
      prod.bottling?.glassware,
      prod.bottling?.cap,
      prod.bottling?.label
    ].filter(Boolean);
    for (const materialId of materialIds) {
      const item = itemStore.getItemById(materialId);
      if (!item) continue;
      if (item.trackInventory === false) continue;
      const currentStock = inventoryStore.getCurrentStock(materialId);
      const newStock = Math.max(0, currentStock - prod.quantity);
      inventoryRecords.push({
        item: materialId,
        quantity: Math.round(newStock * 100) / 100,
        date: /* @__PURE__ */ new Date()
      });
      summary.push({
        itemName: item.name,
        change: -prod.quantity,
        newStock: Math.round(newStock * 100) / 100
      });
    }
    if (inventoryRecords.length > 0) {
      try {
        await inventoryStore.createBulk(inventoryRecords);
      } catch {
        return [];
      }
    }
    if (prod.bottle) {
      const bottle = bottleStore.getBottleById(prod.bottle);
      if (bottle) {
        const finalBottleStock = inventoryStore.getCurrentStock(prod.bottle);
        const shouldBeInStock = finalBottleStock > 0;
        if (bottle.inStock !== shouldBeInStock) {
          bottleStore.bottle = { ...bottle, inStock: shouldBeInStock };
          await bottleStore.updateBottle();
        }
      }
    }
    if (summary.length > 0) {
      const lines = summary.map(
        (s) => s.change > 0 ? `+${s.change} ${s.itemName}` : `${s.change} ${s.itemName}`
      );
      toast.add({
        title: "Inventory adjusted for production",
        description: lines.join(", "),
        color: "success",
        icon: "i-lucide-archive",
        duration: 8e3
      });
    }
    return summary;
  };
  const getProductionsByDate = (date) => {
    return crud.items.value.filter(
      (p) => new Date(p.date).toDateString() === date.toDateString()
    );
  };
  const getProductionsByBottle = (bottleId) => {
    return [...crud.items.value].filter((p) => p.bottle === bottleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  return {
    ...crud,
    // Domain aliases for backward compatibility
    productions: crud.items,
    production: crud.item,
    getProductions: crud.getAll,
    updateProduction: crud.saveItem,
    deleteProduction: crud.deleteItem,
    resetProduction: crud.resetItem,
    // Domain-specific
    getProductionById,
    createAndReturnId,
    adjustInventoryForProduction,
    getProductionsByDate,
    getProductionsByBottle
  };
});

export { useProductionStore as u };
//# sourceMappingURL=useProductionStore-SZxhegcf.mjs.map

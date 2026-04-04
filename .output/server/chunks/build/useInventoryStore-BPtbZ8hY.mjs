import { m as useToast } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';

const useInventoryStore = defineStore("inventories", () => {
  const toast = useToast();
  const crud = useCrudStore({
    name: "Inventory",
    apiPath: "/api/inventory",
    defaultItem: () => ({
      _id: void 0,
      date: /* @__PURE__ */ new Date(),
      item: "",
      location: "",
      quantity: 0,
      unitSize: void 0,
      unitSizeUnit: void 0
    }),
    beforeCreate: (data) => {
      const cleaned = { ...data };
      if (!cleaned.location) delete cleaned.location;
      if (!cleaned.unitSize) {
        delete cleaned.unitSize;
        delete cleaned.unitSizeUnit;
      }
      return cleaned;
    },
    beforeUpdate: (data) => {
      const cleaned = { ...data };
      if (!cleaned.location) cleaned.location = void 0;
      if (!cleaned.unitSize) {
        cleaned.unitSize = void 0;
        cleaned.unitSizeUnit = void 0;
      }
      return cleaned;
    }
  });
  const getInventories = async (params = {}) => {
    crud.loading.value = true;
    try {
      const query = new URLSearchParams();
      if (params.all) query.set("all", "true");
      else if (params.since) query.set("since", params.since);
      else if (params.days) query.set("days", String(params.days));
      if (params.item) query.set("item", params.item);
      const qs = query.toString();
      const url = qs ? `/api/inventory?${qs}` : "/api/inventory";
      const response = await $fetch(url);
      crud.items.value = response;
    } finally {
      crud.loading.value = false;
    }
  };
  const ensureLoaded = async () => {
    if (!crud.loaded.value) {
      try {
        await getInventories();
        crud.loaded.value = true;
      } catch {
      }
    }
  };
  const loadAllHistory = async () => {
    await getInventories({ all: true });
  };
  const loadItemHistory = async (itemId) => {
    crud.loading.value = true;
    try {
      const records = await $fetch(`/api/inventory?item=${itemId}&all=true`);
      const otherItems = crud.items.value.filter((inv) => inv.item !== itemId);
      crud.items.value = [...otherItems, ...records];
      return records;
    } finally {
      crud.loading.value = false;
    }
  };
  const getInventoriesByItem = (itemId) => {
    return crud.items.value.filter((inv) => inv.item === itemId);
  };
  const getTotalQuantity = (record) => {
    if (record.unitSize && record.unitSize > 0) {
      return record.quantity * record.unitSize;
    }
    return record.quantity;
  };
  const getCurrentStock = (itemId) => {
    const itemRecords = getInventoriesByItem(itemId);
    if (itemRecords.length === 0) return 0;
    const sorted = [...itemRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0] ? getTotalQuantity(sorted[0]) : 0;
  };
  const createBulk = async (records) => {
    if (records.length === 0) return [];
    crud.saving.value = true;
    try {
      const payload = records.map((r) => ({
        item: r.item,
        quantity: r.quantity,
        date: r.date || /* @__PURE__ */ new Date(),
        ...r.location ? { location: r.location } : {}
      }));
      const created = await $fetch("/api/inventory/bulk", {
        method: "POST",
        body: payload
      });
      crud.items.value.push(...created);
      return created;
    } catch (error) {
      toast.add({
        title: "Failed to create inventory records",
        description: getErrorMessage(error),
        color: "error",
        icon: "i-lucide-alert-circle"
      });
      throw error;
    } finally {
      crud.saving.value = false;
    }
  };
  return {
    ...crud,
    // Domain aliases for backward compatibility
    inventories: crud.items,
    inventory: crud.item,
    updateInventory: crud.saveItem,
    deleteInventory: crud.deleteItem,
    resetInventory: crud.resetItem,
    // Override base ensureLoaded/getAll with custom versions
    ensureLoaded,
    getInventories,
    // Domain-specific
    loadAllHistory,
    loadItemHistory,
    getInventoriesByItem,
    getTotalQuantity,
    getCurrentStock,
    createBulk
  };
});

export { useInventoryStore as u };
//# sourceMappingURL=useInventoryStore-BPtbZ8hY.mjs.map

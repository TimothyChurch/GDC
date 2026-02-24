import type { Inventory } from "~/types";

export const useInventoryStore = defineStore("inventories", () => {
  const toast = useToast();

  // State
  const inventories = ref<Inventory[]>([]);
  const loaded = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const inventory = ref<Inventory>({
    _id: undefined as unknown as string,
    date: new Date(),
    item: "",
    location: "",
    quantity: 0,
  });
  // CRUD actions
  const getInventories = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/inventory");
      inventories.value = response as Inventory[];
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await getInventories();
        loaded.value = true;
      } catch {
        // loaded stays false — will retry on next call
      }
    }
  };

  const getInventoriesByItem = (itemId: string) => {
    return inventories.value.filter((inv) => inv.item === itemId);
  };

  /** Get the current stock level for an item (most recent inventory record's quantity) */
  const getCurrentStock = (itemId: string): number => {
    const itemRecords = getInventoriesByItem(itemId);
    if (itemRecords.length === 0) return 0;
    const sorted = [...itemRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return sorted[0].quantity;
  };

  /**
   * Create multiple inventory records at once.
   * Used by PO receive and production completion flows.
   * Returns the created records.
   */
  const createBulk = async (
    records: Array<{ item: string; quantity: number; date?: Date; location?: string }>,
  ): Promise<Inventory[]> => {
    if (records.length === 0) return [];
    saving.value = true;
    try {
      const payload = records.map((r) => ({
        item: r.item,
        quantity: r.quantity,
        date: r.date || new Date(),
        ...(r.location ? { location: r.location } : {}),
      }));
      const response = await $fetch("/api/inventory/bulk", {
        method: "POST",
        body: payload,
      });
      const created = response as Inventory[];
      inventories.value.push(...created);
      return created;
    } catch (error: any) {
      toast.add({
        title: "Failed to create inventory records",
        description: error?.data?.statusMessage || error?.data?.message,
        color: "error",
        icon: "i-lucide-alert-circle",
      });
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const updateInventory = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !inventory.value._id;
      if (isNew) {
        const { _id, ...createData } = inventory.value;
        if (!createData.location) delete createData.location;
        const response = await $fetch("/api/inventory/create", {
          method: "POST",
          body: createData,
        });
        inventories.value.push(response as Inventory);
      } else {
        const updateData = { ...inventory.value };
        if (!updateData.location) updateData.location = undefined;
        const response = await $fetch(`/api/inventory/${inventory.value._id}`, {
          method: "PUT",
          body: updateData,
        });
        const index = inventories.value.findIndex(
          (i) => i._id === inventory.value._id,
        );
        if (index !== -1) {
          inventories.value[index] = response as Inventory;
        }
      }
      toast.add({
        title: `Inventory ${isNew ? "created" : "updated"}`,
        color: "success",
        icon: "i-lucide-check-circle",
      });
      resetInventory();
    } catch (error: any) {
      toast.add({
        title: "Failed to save inventory",
        description: error?.data?.statusMessage || error?.data?.message,
        color: "error",
        icon: "i-lucide-alert-circle",
      });
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const resetInventory = () => {
    inventory.value = {
      _id: undefined as unknown as string,
      date: new Date(),
      item: "",
      location: "",
      quantity: 0,
    };
  };

  const deleteInventory = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      await $fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      });
      inventories.value = inventories.value.filter((i) => i._id !== id);
      toast.add({
        title: "Inventory record deleted",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } catch (error: any) {
      toast.add({
        title: "Failed to delete inventory record",
        description: error?.data?.statusMessage || error?.data?.message,
        color: "error",
        icon: "i-lucide-alert-circle",
      });
    } finally {
      saving.value = false;
    }
  };

  return {
    inventories,
    inventory,
    loaded,
    loading,
    saving,
    ensureLoaded,
    getInventories,
    getInventoriesByItem,
    getCurrentStock,
    createBulk,
    updateInventory,
    resetInventory,
    deleteInventory,
  };
});

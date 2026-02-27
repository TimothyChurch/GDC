import type { Inventory } from "~/types";

export const useInventoryStore = defineStore("inventories", () => {
  const toast = useToast();

  const crud = useCrudStore<Inventory>({
    name: "Inventory",
    apiPath: "/api/inventory",
    defaultItem: () => ({
      _id: undefined as unknown as string,
      date: new Date(),
      item: "",
      location: "",
      quantity: 0,
    }),
    beforeCreate: (data) => {
      const cleaned = { ...data };
      if (!cleaned.location) delete cleaned.location;
      return cleaned;
    },
    beforeUpdate: (data) => {
      const cleaned = { ...data };
      if (!cleaned.location) cleaned.location = undefined;
      return cleaned;
    },
  });

  // Override getAll to support query params (days, since, item, all)
  const getInventories = async (
    params: { days?: number; since?: string; item?: string; all?: boolean } = {},
  ): Promise<void> => {
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
      crud.items.value = response as Inventory[];
    } finally {
      crud.loading.value = false;
    }
  };

  // Override ensureLoaded to use our custom getInventories
  const ensureLoaded = async (): Promise<void> => {
    if (!crud.loaded.value) {
      try {
        await getInventories();
        crud.loaded.value = true;
      } catch {
        // loaded stays false -- will retry on next call
      }
    }
  };

  /** Load all inventory history (no date filter). Use for reports/charts needing full timeline. */
  const loadAllHistory = async (): Promise<void> => {
    await getInventories({ all: true });
  };

  /** Load all records for a specific item, merging into the existing array. */
  const loadItemHistory = async (itemId: string): Promise<Inventory[]> => {
    crud.loading.value = true;
    try {
      const response = await $fetch(`/api/inventory?item=${itemId}&all=true`);
      const records = response as Inventory[];
      const otherItems = crud.items.value.filter((inv) => inv.item !== itemId);
      crud.items.value = [...otherItems, ...records];
      return records;
    } finally {
      crud.loading.value = false;
    }
  };

  const getInventoriesByItem = (itemId: string) => {
    return crud.items.value.filter((inv) => inv.item === itemId);
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
   */
  const createBulk = async (
    records: Array<{ item: string; quantity: number; date?: Date; location?: string }>,
  ): Promise<Inventory[]> => {
    if (records.length === 0) return [];
    crud.saving.value = true;
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
      crud.items.value.push(...created);
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
    getCurrentStock,
    createBulk,
  };
});

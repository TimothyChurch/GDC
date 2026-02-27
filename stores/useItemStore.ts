import type { Item, ItemCategory } from "~/types";
import { getStockStatus } from "~/composables/useInventoryCategories";

export interface ShoppingListItem {
  item: Item;
  currentStock: number;
  reorderPoint: number;
  usePerMonth: number;
  suggestedOrderQty: number;
  status: "Out of Stock" | "Low Stock";
}

export const useItemStore = defineStore("items", () => {
  const toast = useToast();

  // State
  const items = ref<Item[]>([]);
  const loaded = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const item = ref<Item>({
    _id: '',
    name: "",
    type: "",
    inventoryUnit: "",
    purchaseHistory: [],
    inventoryHistory: [],
    category: 'Other',
    trackInventory: true,
    unitSize: 0,
    unitLabel: "",
    minStock: 0,
    reorderPoint: 0,
    usePerMonth: 0,
  });

  // CRUD actions
  const getItems = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/item");
      items.value = response as Item[];
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await getItems();
        loaded.value = true;
      } catch {
        // loaded stays false — will retry on next call
      }
    }
  };

  const setItem = (id: string) => {
    const found = items.value.find((i) => i._id === id);
    if (found) item.value = JSON.parse(JSON.stringify(found));
  };

  const updateItem = async (): Promise<Item> => {
    saving.value = true;
    try {
      let response;
      const isNew = !item.value._id;
      if (isNew) {
        const { _id, ...createData } = item.value;
        response = await $fetch("/api/item/create", {
          method: "POST",
          body: JSON.stringify(createData),
        });
        items.value.push(response as Item);
      } else {
        response = await $fetch(`/api/item/${item.value._id}`, {
          method: "PUT",
          body: JSON.stringify(item.value),
        });
        const index = items.value.findIndex((i) => i._id === item.value._id);
        if (index !== -1) {
          items.value[index] = response as Item;
        }
      }
      toast.add({ title: `Item ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
      resetItem();
      return response as Item;
    } catch (error: any) {
      toast.add({ title: 'Failed to save item', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const resetItem = (): void => {
    item.value = {
      _id: '',
      name: "",
      type: "",
      inventoryUnit: "",
      purchaseHistory: [],
      inventoryHistory: [],
      category: 'Other',
      trackInventory: true,
      unitSize: 0,
      unitLabel: "",
      minStock: 0,
      reorderPoint: 0,
      usePerMonth: 0,
    };
  };

  const deleteItem = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      await $fetch(`/api/item/${id}`, {
        method: "DELETE",
      });
      items.value = items.value.filter((i) => i._id !== id);
      toast.add({ title: 'Item deleted', color: 'success', icon: 'i-lucide-check-circle' });
    } catch (error: any) {
      toast.add({ title: 'Failed to delete item', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const getItemById = (id: string): Item | undefined => {
    return items.value.find((ing) => ing._id === id);
  };

  const nameById = (id: string) => {
    return items.value.find((ing) => ing._id === id)?.name;
  };

  const search = (searchTerm: string): Item[] => {
    return items.value.filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const latestPrice = (item: Item | string): number => {
    const purchaseOrderStore = usePurchaseOrderStore();
    const { computePricePerUnit } = useUnitConversion();

    const selectedItem = typeof item === "string" ? getItemById(item) : item;
    if (!selectedItem) return 0;

    // Sort Purchase orders by date (spread to avoid mutating the PO store's array)
    const sortedPurchaseOrders = [...purchaseOrderStore.purchaseOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Find the most recent purchase containing this item
    for (const po of sortedPurchaseOrders) {
      const lineItem = po.items.find((i) => i.item === selectedItem._id);
      if (lineItem) {
        return computePricePerUnit(
          lineItem.price,
          lineItem.size,
          lineItem.sizeUnit,
          selectedItem.inventoryUnit || lineItem.sizeUnit
        );
      }
    }
    return 0;
  };

  const itemNameId = computed(() => {
    return items.value.map((i) => ({ id: i._id, label: i.name }));
  });

  const getItemsByCategory = (category: ItemCategory): Item[] => {
    return items.value.filter((i) => (i.category || 'Other') === category && i.trackInventory !== false);
  };

  const getVendorName = (itemId: string): string | null => {
    const purchaseOrderStore = usePurchaseOrderStore();
    const contactStore = useContactStore();
    const sorted = [...purchaseOrderStore.purchaseOrders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const po of sorted) {
      if (po.items.some((i) => i.item === itemId)) {
        return contactStore.getContactById(po.vendor)?.businessName || null;
      }
    }
    return null;
  };

  const getVendorId = (itemId: string): string | null => {
    const purchaseOrderStore = usePurchaseOrderStore();
    const sorted = [...purchaseOrderStore.purchaseOrders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const po of sorted) {
      if (po.items.some((i) => i.item === itemId)) {
        return po.vendor;
      }
    }
    return null;
  };

  /**
   * Items that need purchasing: tracked items with inventory history
   * whose current stock is at or below the reorder point (or out of stock).
   * Sorted by priority: out of stock first, then low stock, then alphabetically.
   */
  const shoppingListItems = computed<ShoppingListItem[]>(() => {
    const inventoryStore = useInventoryStore();
    const result: ShoppingListItem[] = [];

    for (const itm of items.value) {
      // Skip items not being tracked
      if (itm.trackInventory === false) continue;

      // Exclude items with no inventory history
      const records = inventoryStore.getInventoriesByItem(itm._id);
      if (records.length === 0) continue;

      const currentStock = inventoryStore.getCurrentStock(itm._id);
      const reorderPt = itm.reorderPoint || 0;
      const stockStatus = getStockStatus(currentStock, reorderPt);

      // Only include items that are low or out of stock
      if (stockStatus === "In Stock") continue;

      const perMonth = itm.usePerMonth || 0;
      const minStk = itm.minStock || 0;

      // Suggested order: 2 months of supply minus current stock, at least minStock
      let suggestedQty = perMonth > 0
        ? Math.ceil(perMonth * 2 - currentStock)
        : Math.ceil(reorderPt * 2 - currentStock);
      if (suggestedQty < minStk) suggestedQty = minStk;
      if (suggestedQty < 1) suggestedQty = 1;

      result.push({
        item: itm,
        currentStock,
        reorderPoint: reorderPt,
        usePerMonth: perMonth,
        suggestedOrderQty: suggestedQty,
        status: stockStatus as "Out of Stock" | "Low Stock",
      });
    }

    // Sort: out of stock first, then low stock, then alphabetically
    return result.sort((a, b) => {
      if (a.status === "Out of Stock" && b.status !== "Out of Stock") return -1;
      if (a.status !== "Out of Stock" && b.status === "Out of Stock") return 1;
      return a.item.name.localeCompare(b.item.name);
    });
  });

  return {
    items,
    item,
    loaded,
    loading,
    saving,
    ensureLoaded,
    getItems,
    setItem,
    updateItem,
    deleteItem,
    resetItem,
    getItemById,
    nameById,
    search,
    latestPrice,
    itemNameId,
    getItemsByCategory,
    getVendorName,
    getVendorId,
    shoppingListItems,
  };
});

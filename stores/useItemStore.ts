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
  const crud = useCrudStore<Item>({
    name: "Item",
    apiPath: "/api/item",
    defaultItem: () => ({
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
    }),
  });

  // Domain-specific getters
  const nameById = (id: string) => crud.getById(id)?.name;

  const search = (searchTerm: string): Item[] => {
    return crud.items.value.filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.type?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const latestPrice = (item: Item | string): number => {
    const purchaseOrderStore = usePurchaseOrderStore();
    const { computePricePerUnit } = useUnitConversion();

    const selectedItem = typeof item === "string" ? crud.getById(item) : item;
    if (!selectedItem) return 0;

    const sortedPurchaseOrders = [...purchaseOrderStore.purchaseOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    for (const po of sortedPurchaseOrders) {
      const lineItem = po.items.find((i) => i.item === selectedItem._id);
      if (lineItem) {
        return computePricePerUnit(
          lineItem.price,
          lineItem.size,
          lineItem.sizeUnit,
          selectedItem.inventoryUnit || lineItem.sizeUnit,
        );
      }
    }
    return 0;
  };

  const itemNameId = computed(() => {
    return crud.items.value.map((i) => ({ id: i._id, label: i.name }));
  });

  const getItemsByCategory = (category: ItemCategory): Item[] => {
    return crud.items.value.filter((i) => (i.category || 'Other') === category && i.trackInventory !== false);
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
   */
  const shoppingListItems = computed<ShoppingListItem[]>(() => {
    const inventoryStore = useInventoryStore();
    const result: ShoppingListItem[] = [];

    for (const itm of crud.items.value) {
      if (itm.trackInventory === false) continue;

      const records = inventoryStore.getInventoriesByItem(itm._id);
      if (records.length === 0) continue;

      const currentStock = inventoryStore.getCurrentStock(itm._id);
      const reorderPt = itm.reorderPoint || 0;
      const stockStatus = getStockStatus(currentStock, reorderPt);

      if (stockStatus === "In Stock") continue;

      const perMonth = itm.usePerMonth || 0;
      const minStk = itm.minStock || 0;

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

    return result.sort((a, b) => {
      if (a.status === "Out of Stock" && b.status !== "Out of Stock") return -1;
      if (a.status !== "Out of Stock" && b.status === "Out of Stock") return 1;
      return a.item.name.localeCompare(b.item.name);
    });
  });

  return {
    ...crud,
    // Domain aliases for backward compatibility
    items: crud.items,
    item: crud.item,
    getItems: crud.getAll,
    updateItem: crud.saveItem,
    deleteItem: crud.deleteItem,
    resetItem: crud.resetItem,
    setItem: crud.setItem,
    getItemById: crud.getById,
    // Domain-specific
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

import { u as useSettingsStore } from './useSettingsStore-CJPFEN69.mjs';
import { computed } from 'vue';
import { m as useToast } from './server.mjs';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';
import { D as DEFAULT_TAX_RATE } from './definitions-C7fnFA_u.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';

const useUnitConversion = () => {
  const convertQuantity = (amount, fromUnit, toUnit) => {
    return amount * convertUnitRatio(fromUnit, toUnit);
  };
  const computePricePerUnit = (purchasePrice, purchaseSize, purchaseSizeUnit, inventoryUnit) => {
    if (!purchasePrice || !purchaseSize) return 0;
    const totalInventoryUnits = convertQuantity(purchaseSize, purchaseSizeUnit, inventoryUnit);
    if (totalInventoryUnits === 0) return 0;
    return purchasePrice / totalInventoryUnits;
  };
  const ingredientCost = (pricePerInventoryUnit, amount, ingredientUnit, inventoryUnit) => {
    const converted = convertQuantity(amount, ingredientUnit, inventoryUnit);
    return pricePerInventoryUnit * converted;
  };
  return {
    convertQuantity,
    computePricePerUnit,
    ingredientCost
  };
};
const DEFAULT_INVENTORY_CATEGORIES = [
  {
    key: "bottling",
    label: "Bottling Supplies",
    category: "Bottling",
    icon: "i-lucide-wine",
    description: "Bottles, caps, labels, shrink wraps, and packaging materials"
  },
  {
    key: "ingredients",
    label: "Base Ingredients",
    category: "Base Ingredient",
    icon: "i-lucide-wheat",
    description: "Grains, sugars, yeast, and primary fermentation ingredients"
  },
  {
    key: "botanicals",
    label: "Botanicals",
    category: "Botanical",
    icon: "i-lucide-leaf",
    description: "Herbs, spices, citrus peels, and botanical flavorings"
  },
  {
    key: "bar-supplies",
    label: "Bar Supplies",
    category: "Bar Supplies",
    icon: "i-lucide-cup-soda",
    description: "Mixers, garnishes, glassware, and bar tools"
  },
  {
    key: "other",
    label: "Other",
    category: "Other",
    icon: "i-lucide-box",
    description: "Cleaning supplies, lab supplies, and miscellaneous items"
  }
];
function useInventoryCategories() {
  try {
    const settingsStore = useSettingsStore();
    return computed(() => {
      if (settingsStore.loaded && settingsStore.itemCategories.length > 0) {
        return settingsStore.itemCategories;
      }
      return DEFAULT_INVENTORY_CATEGORIES;
    });
  } catch {
    return computed(() => DEFAULT_INVENTORY_CATEGORIES);
  }
}
function getStockStatus(quantity, reorderPoint) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderPoint) return "Low Stock";
  return "In Stock";
}
function getStockStatusColor(status) {
  if (status === "Out of Stock") return "error";
  if (status === "Low Stock") return "warning";
  return "success";
}
const usePurchaseOrderStore = defineStore("purchaseOrders", () => {
  const toast = useToast();
  const crud = useCrudStore({
    name: "Purchase order",
    apiPath: "/api/purchaseOrder",
    defaultItem: () => ({
      _id: "",
      vendor: "",
      status: "",
      items: [],
      total: 0,
      taxRate: DEFAULT_TAX_RATE,
      shipping: 0,
      date: /* @__PURE__ */ new Date()
    })
  });
  const receivePurchaseOrder = async (poId) => {
    const inventoryStore = useInventoryStore();
    const itemStore = useItemStore();
    const { convertQuantity } = useUnitConversion();
    const po = poId ? crud.items.value.find((p) => p._id === poId) : crud.item.value;
    if (!po || po.items.length === 0) return [];
    const summary = [];
    const inventoryRecords = [];
    for (const lineItem of po.items) {
      const item = itemStore.getItemById(lineItem.item);
      if (!item) continue;
      if (item.trackInventory === false) continue;
      const inventoryUnit = item.inventoryUnit || lineItem.sizeUnit;
      const totalPurchased = lineItem.quantity * lineItem.size;
      const addedInInventoryUnits = lineItem.sizeUnit === inventoryUnit ? totalPurchased : convertQuantity(totalPurchased, lineItem.sizeUnit, inventoryUnit);
      const currentStock = inventoryStore.getCurrentStock(lineItem.item);
      const newStock = currentStock + addedInInventoryUnits;
      inventoryRecords.push({
        item: lineItem.item,
        quantity: Math.round(newStock * 100) / 100,
        date: /* @__PURE__ */ new Date()
      });
      summary.push({
        itemName: item.name,
        added: Math.round(addedInInventoryUnits * 100) / 100,
        newStock: Math.round(newStock * 100) / 100,
        unit: inventoryUnit
      });
    }
    if (inventoryRecords.length > 0) {
      try {
        await inventoryStore.createBulk(inventoryRecords);
      } catch {
        return [];
      }
    }
    if (summary.length > 0) {
      const summaryLines = summary.map(
        (s) => `+${s.added} ${s.unit} ${s.itemName}`
      );
      toast.add({
        title: "Inventory updated from PO",
        description: summaryLines.join(", "),
        color: "success",
        icon: "i-lucide-package-check",
        duration: 8e3
      });
    }
    return summary;
  };
  const getPurchaseOrderByVendor = (vendorId) => {
    return crud.items.value.filter((po) => po.vendor === vendorId);
  };
  const getPurchaseOrdersByItemId = (id) => {
    return crud.items.value.filter((po) => {
      return po.items.some((item) => item.item === id);
    });
  };
  return {
    ...crud,
    // Domain aliases for backward compatibility
    purchaseOrders: crud.items,
    purchaseOrder: crud.item,
    getPurchaseOrders: crud.getAll,
    updatePurchaseOrder: crud.saveItem,
    deletePurchaseOrder: crud.deleteItem,
    resetCurrentPurchaseOrder: crud.resetItem,
    getPurchaseOrderById: crud.getById,
    // Domain-specific
    receivePurchaseOrder,
    getPurchaseOrderByVendor,
    getPurchaseOrdersByItemId
  };
});
const useItemStore = defineStore("items", () => {
  const crud = useCrudStore({
    name: "Item",
    apiPath: "/api/item",
    defaultItem: () => ({
      _id: "",
      name: "",
      type: "",
      inventoryUnit: "",
      purchaseHistory: [],
      inventoryHistory: [],
      category: "Other",
      trackInventory: true,
      unitSize: 0,
      unitLabel: "",
      minStock: 0,
      reorderPoint: 0,
      usePerMonth: 0
    })
  });
  const nameById = (id) => crud.getById(id)?.name;
  const search = (searchTerm) => {
    return crud.items.value.filter(
      (i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  const _latestPOLineItems = computed(() => {
    const purchaseOrderStore = usePurchaseOrderStore();
    const sorted = [...purchaseOrderStore.purchaseOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const map = /* @__PURE__ */ new Map();
    for (const po of sorted) {
      for (const lineItem of po.items) {
        if (!map.has(lineItem.item)) {
          map.set(lineItem.item, {
            price: lineItem.price,
            size: lineItem.size,
            sizeUnit: lineItem.sizeUnit
          });
        }
      }
    }
    return map;
  });
  const latestPrice = (item) => {
    const { computePricePerUnit } = useUnitConversion();
    const selectedItem = typeof item === "string" ? crud.getById(item) : item;
    if (!selectedItem) return 0;
    const lineData = _latestPOLineItems.value.get(selectedItem._id);
    if (lineData) {
      return computePricePerUnit(
        lineData.price,
        lineData.size,
        lineData.sizeUnit,
        selectedItem.inventoryUnit || lineData.sizeUnit
      );
    }
    if (selectedItem.baseCostPrice && selectedItem.baseCostSize && selectedItem.baseCostUnit) {
      return computePricePerUnit(
        selectedItem.baseCostPrice,
        selectedItem.baseCostSize,
        selectedItem.baseCostUnit,
        selectedItem.inventoryUnit || selectedItem.baseCostUnit
      );
    }
    return 0;
  };
  const itemNameId = computed(() => {
    return crud.items.value.map((i) => ({ id: i._id, label: i.name }));
  });
  const getItemsByCategory = (category) => {
    return crud.items.value.filter((i) => (i.category || "Other") === category && i.trackInventory !== false);
  };
  const getVendorName = (itemId) => {
    const purchaseOrderStore = usePurchaseOrderStore();
    const contactStore = useContactStore();
    const sorted = [...purchaseOrderStore.purchaseOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const po of sorted) {
      if (po.items.some((i) => i.item === itemId)) {
        return contactStore.getContactById(po.vendor)?.businessName || null;
      }
    }
    return null;
  };
  const getVendorId = (itemId) => {
    const purchaseOrderStore = usePurchaseOrderStore();
    const sorted = [...purchaseOrderStore.purchaseOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const po of sorted) {
      if (po.items.some((i) => i.item === itemId)) {
        return po.vendor;
      }
    }
    return null;
  };
  const shoppingListItems = computed(() => {
    const inventoryStore = useInventoryStore();
    const result = [];
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
      let suggestedQty = perMonth > 0 ? Math.ceil(perMonth * 2 - currentStock) : Math.ceil(reorderPt * 2 - currentStock);
      if (suggestedQty < minStk) suggestedQty = minStk;
      if (suggestedQty < 1) suggestedQty = 1;
      result.push({
        item: itm,
        currentStock,
        reorderPoint: reorderPt,
        usePerMonth: perMonth,
        suggestedOrderQty: suggestedQty,
        status: stockStatus
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
    shoppingListItems
  };
});

export { useUnitConversion as a, usePurchaseOrderStore as b, getStockStatusColor as c, useInventoryCategories as d, getStockStatus as g, useItemStore as u };
//# sourceMappingURL=useItemStore-Cpj9s1UF.mjs.map

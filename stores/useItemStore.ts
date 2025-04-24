import type { ObjectId } from "mongoose";
import type { Item } from "~/types";

export const useItemStore = defineStore("items", () => {
  // State
  const items = ref<Item[]>([]);
  const item = ref<Item>({
    _id: undefined as unknown as ObjectId,
    name: "",
    type: "",
    vendor: undefined as unknown as ObjectId,
    inventoryUnit: "",
    purchaseHistory: [],
    inventoryHistory: [],
    brand: "",
    pricePerUnit: 0,
  });

  // CRUD actions
  const getItems = async (): Promise<void> => {
    try {
      const response = await $fetch("/api/item");
      items.value = response as Item[];
    } catch (e) {
      console.error("Error fetching items:", e);
    }
  };
  getItems();

  const setItem = (id: string) => {
    const foundItem = items.value.find((i) => i._id.toString() === id);
    if (foundItem) {
      item.value = foundItem;
    } else {
      console.error(`Item with ID ${id} not found.`);
    }
  };

  const updateItem = async (): Promise<Item> => {
    let response;
    if (!item.value._id) {
      response = await $fetch("/api/item/create", {
        method: "POST",
        body: JSON.stringify(item.value),
      });
    } else {
      response = await $fetch(`/api/item/${item.value._id}`, {
        method: "PUT",
        body: JSON.stringify(item.value),
      });
    }
    getItems();
    resetItem();
    return response as Item;
  };

  const resetItem = (): void => {
    item.value = {
      _id: undefined as unknown as ObjectId,
      name: "",
      type: "",
      vendor: undefined as unknown as ObjectId,
      inventoryUnit: "",
      purchaseHistory: [],
      inventoryHistory: [],
      brand: "",
      pricePerUnit: 0,
    };
  };

  const deleteItem = async (id: string): Promise<void> => {
    await $fetch(`/api/item/${id}`, {
      method: "DELETE",
    });
    await getItems();
  };

  const getItemById = (id: string): Item | undefined => {
    return items.value.find((ing) => ing._id.toString() === id);
  };

  const nameById = (id: string) => {
    return items.value.find((ing) => ing._id.toString() == id)?.name;
  };

  const search = (searchTerm: string): Item[] => {
    return items.value.filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.vendor.toString().includes(searchTerm.toLowerCase())
    );
  };

  const latestPrice = (item: Item | string): number => {
    // Initialize stores and set up ref
    const purchaseOrderStore = usePurchaseOrderStore();
    const selectedItem = ref();
    // Ensure that it is the full item object vs string
    if (typeof item == "string") {
      selectedItem.value = getItemById(item);
    } else {
      selectedItem.value = item;
    }
    // Sort Purchase orders by date
    const sortedPurchaseOrders = purchaseOrderStore.purchaseOrders.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // Find the last purchase where the item was purchased and return the price per size unit. Return undefined if not found.
    for (let i in sortedPurchaseOrders) {
      const flag = sortedPurchaseOrders[i].items.some(
        (i) => i.item == selectedItem.value._id
      );
      if (flag) {
        const lastPurchase = sortedPurchaseOrders[i].items.filter(
          (i) => i.item == selectedItem.value._id
        )[0];
        // Price per unit
        const pricePerUnit = ref(lastPurchase.price / lastPurchase.size);
        if (lastPurchase.sizeUnit != selectedItem.value.inventoryUnit) {
          pricePerUnit.value =
            pricePerUnit.value /
            convertUnitRatio(
              lastPurchase.sizeUnit as
                | "fl oz"
                | "cup"
                | "gallon"
                | "oz"
                | "lb"
                | "g"
                | "kg"
                | "mL"
                | "L"
                | "bottle"
                | "each"
                | "count",
              selectedItem.value.inventoryUnit
            );
        }
        return pricePerUnit.value;
      }
    }
    return 0;
  };

  const itemNameId = computed(() => {
    return items.value.map((i) => ({ id: i._id.toString(), label: i.name }));
  });

  return {
    items,
    item,
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
  };
});

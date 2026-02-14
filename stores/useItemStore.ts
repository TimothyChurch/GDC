import type { Item } from "~/types";

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
    vendor: '',
    inventoryUnit: "",
    purchaseHistory: [],
    inventoryHistory: [],
    brand: "",
    pricePerUnit: 0,
  });

  // CRUD actions
  const getItems = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/item");
      items.value = response as Item[];
    } catch (e) {
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (!loaded.value) {
      await getItems();
      loaded.value = true;
    }
  };

  const setItem = (id: string) => {
    const foundItem = items.value.find((i) => i._id === id);
    if (foundItem) {
      item.value = foundItem;
    }
  };

  const updateItem = async (): Promise<Item> => {
    saving.value = true;
    try {
      let response;
      const isNew = !item.value._id;
      if (isNew) {
        response = await $fetch("/api/item/create", {
          method: "POST",
          body: JSON.stringify(item.value),
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
      vendor: '',
      inventoryUnit: "",
      purchaseHistory: [],
      inventoryHistory: [],
      brand: "",
      pricePerUnit: 0,
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
        i.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
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
    return items.value.map((i) => ({ id: i._id, label: i.name }));
  });

  const getPriceById = (id: string) => {
    return items.value.find((i) => i._id === id)?.pricePerUnit;
  };

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
    getPriceById,
  };
});

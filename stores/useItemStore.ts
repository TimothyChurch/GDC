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
    purchaseSize: 0,
    purchaseSizeUnit: "",
    purchasePrice: 0,
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
      vendor: '',
      inventoryUnit: "",
      purchaseSize: 0,
      purchaseSizeUnit: "",
      purchasePrice: 0,
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

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
    quantity: 0,
  });
  // CRUD actions
  const getInventories = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/inventory");
      inventories.value = response as Inventory[];
    } catch (e) {
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async () => {
    if (!loaded.value) {
      await getInventories();
      loaded.value = true;
    }
  };

  const getInventoriesByItem = (itemId: string) => {
    return inventories.value.filter((inv) => inv.item === itemId);
  };

  const updateInventory = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !inventory.value._id;
      if (isNew) {
        const response = await $fetch("/api/inventory/create", {
          method: "POST",
          body: JSON.stringify(inventory.value),
        });
        inventories.value.push(response as Inventory);
      } else {
        const response = await $fetch(`/api/inventory/${inventory.value._id}`, {
          method: "PUT",
          body: JSON.stringify(inventory.value),
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
        description: error?.data?.message,
        color: "error",
        icon: "i-lucide-alert-circle",
      });
    } finally {
      saving.value = false;
    }
  };

  const resetInventory = () => {
    inventory.value = {
      _id: undefined as unknown as string,
      date: new Date(),
      item: "",
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
        description: error?.data?.message,
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
    updateInventory,
    resetInventory,
    deleteInventory,
  };
});

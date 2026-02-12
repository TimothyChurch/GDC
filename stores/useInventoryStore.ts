import type { Inventory } from "~/types";

export const useInventoryStore = defineStore("inventories", () => {
  const toast = useToast();

  // State
  const inventories = ref<Inventory[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const inventory = ref<Inventory>({
    _id: '',
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
      console.error("Error fetching inventories:", e);
    } finally {
      loading.value = false;
    }
  };
  getInventories();

  const getInventoriesByItem = (itemId: string) => {
    return inventories.value.filter((inv) => inv.item === itemId);
  };

  const updateInventory = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !inventory.value._id;
      if (isNew) {
        await $fetch("/api/inventory/create", {
          method: "POST",
          body: JSON.stringify(inventory.value),
        });
      } else {
        await $fetch(`/api/inventory/${inventory.value._id}`, {
          method: "PUT",
          body: JSON.stringify(inventory.value),
        });
      }
      toast.add({ title: `Inventory ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
      getInventories();
      resetInventory();
    } catch (error: any) {
      toast.add({ title: 'Failed to save inventory', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const resetInventory = () => {
    inventory.value = {
      _id: '',
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
      toast.add({ title: 'Inventory record deleted', color: 'success', icon: 'i-lucide-check-circle' });
      getInventories();
    } catch (error: any) {
      toast.add({ title: 'Failed to delete inventory record', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  return {
    inventories,
    inventory,
    loading,
    saving,
    getInventories,
    getInventoriesByItem,
    updateInventory,
    resetInventory,
    deleteInventory,
  };
});

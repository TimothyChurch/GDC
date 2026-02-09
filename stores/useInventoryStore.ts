import type { Inventory } from "~/types";

export const useInventoryStore = defineStore("inventories", () => {
  // State
  const itemInventories = ref<Inventory[]>([]);
  const inventories = ref<Inventory[]>([]);
  const inventory = ref<Inventory>({
    _id: '',
    date: new Date(),
    item: "",
    quantity: 0,
  });
  // CRUD actions
  const getInventories = async (): Promise<void> => {
    const response = await $fetch("/api/inventory");
    inventories.value = response as Inventory[];
    return;
  };
  getInventories();

  const getInventoriesByItem = (itemId: string) => {
    return inventories.value.filter((inv) => inv.item === itemId);
  };

  const updateInventory = async (): Promise<void> => {
    if (!inventory.value._id) {
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
    getInventories();
    resetInventory();
    return;
  };

  const resetInventory = () => {
    inventory.value = {
      _id: '',
      date: new Date(),
      item: "",
      quantity: 0,
    };
    return;
  };

  const deleteInventory = async (id: string): Promise<void> => {
    await $fetch(`/api/inventory/${id}`, {
      method: "DELETE",
    });
    getInventories();
    return;
  };

  return {
    inventories,
    inventory,
    getInventories,
    getInventoriesByItem,
    updateInventory,
    resetInventory,
    deleteInventory,
  };
});

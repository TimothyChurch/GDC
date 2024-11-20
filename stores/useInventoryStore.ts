import type { Inventory } from "~/types";

export const useInventoryStore = defineStore("inventories", () => {
  // State
  const inventories = ref<Inventory[]>([]);
  const inventory = ref({});
  // CRUD actions
  const getInventories = async (): Promise<void> => {
    const response = await $fetch("/api/inventory");
    inventories.value = response as Inventory[];
    return;
  };

  const addInventory = async (newInventory: Inventory): Promise<void> => {
    await $fetch("/api/inventory/create", {
      method: "POST",
      body: JSON.stringify(newInventory),
    });
    getInventories();
    return;
  };

  // Setters
  const sortInventory = () => {
    const sortDays = inventories.value.sort((a, b) => {
      return parseInt(a.day) - parseInt(b.day);
    });
    const sortMonths = sortDays.sort((a, b) => {
      if (a.month < b.month) return -1;
      if (a.month > b.month) return 1;
      return 0;
    });
    const sortYears = sortMonths.sort((a, b) => {
      if (a.year < b.year) return -1;
      if (a.year > b.year) return 1;
      return 0;
    });
    inventories.value = sortYears;
  };
  // Getters
  const getItemInventory = (id: string) => {
    sortInventory();
    console.log(id);
    const item = inventories.value.map((inventory) => {
      return {
        _id: inventory._id,
        year: inventory.year,
        month: inventory.month,
        day: inventory.day,
        items: inventory.items[id],
      };
    });
    console.log(item);
    return item;
  };

  return {
    inventories,
    inventory,
    getInventories,
    addInventory,
    sortInventory,
    getItemInventory,
  };
});

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
  });

  // CRUD actions
  const getItems = async (): Promise<void> => {
    if (!items.value.length) {
      const response = await $fetch("/api/item");
      items.value = response as Item[];
    }
  };

  const updateItem = async (): Promise<void> => {
    if (!item.value._id) {
      await $fetch("/api/item/create", {
        method: "POST",
        body: JSON.stringify(item.value),
      });
    } else {
      await $fetch(`/api/item/${item.value._id}`, {
        method: "PUT",
        body: JSON.stringify(item.value),
      });
    }
    await getItems();
    resetItem();
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

  return {
    items,
    item,
    getItems,
    updateItem,
    deleteItem,
    getItemById,
    nameById,
  };
});

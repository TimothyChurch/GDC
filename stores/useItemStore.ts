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
  });

  // CRUD actions
  const getitems = async (): Promise<void> => {
    const response = await $fetch("/api/item");
    items.value = response as Item[];
  };

  const updateitem = async (): Promise<void> => {
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
    await getitems();
    resetitem();
  };

  const resetitem = (): void => {
    item.value = {
      _id: undefined as unknown as ObjectId,
      name: "",
      type: "",
      vendor: undefined as unknown as ObjectId,
    };
  };

  const deleteitem = async (id: string): Promise<void> => {
    await $fetch(`/api/item/${id}`, {
      method: "DELETE",
    });
    await getitems();
  };

  const getitemById = (id: string): Item | undefined => {
    return items.value.find((ing) => ing._id.toString() === id);
  };

  const nameById = (id: string) => {
    return items.value.find((ing) => ing._id.toString() == id)?.name;
  };

  return {
    items,
    item,
    getitems,
    updateitem,
    deleteitem,
    getitemById,
    nameById,
  };
});

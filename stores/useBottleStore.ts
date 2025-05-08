import type { Bottle } from "~/types";
import type { ObjectId } from "mongoose";

export const useBottleStore = defineStore("bottles", () => {
  const bottles = ref<Bottle[]>([]);
  const bottle = ref<Bottle>({
    _id: undefined as unknown as ObjectId,
    name: "",
    type: "bottle",
    abv: 0,
    recipe: "" as unknown as ObjectId,
    class: "",
    price: 0,
    img: "",
    description: "",
    inStock: true,
  });

  const getBottles = async (): Promise<void> => {
    const response = await $fetch("/api/bottle");
    bottles.value = response as Bottle[];
    sortBottles();
    return;
  };
  getBottles();

  const setBottle = (id: string | ObjectId) => {
    bottle.value = bottles.value.find(
      (b) => b._id.toString() === id
    ) as unknown as Bottle;
  };

  const resetBottle = () => {
    bottle.value = {
      _id: undefined as unknown as ObjectId,
      name: "",
      type: "bottle",
      abv: 0,
      recipe: "" as unknown as ObjectId,
      class: "",
      price: 0,
      img: "",
      description: "",
      inStock: true,
    };
    return;
  };

  const updateBottle = async (): Promise<void> => {
    if (!bottle.value._id) {
      await $fetch("/api/bottle/create", {
        method: "POST",
        body: JSON.stringify(bottle.value),
      });
    } else {
      await $fetch(`/api/bottle/${bottle.value?._id}`, {
        method: "PUT",
        body: JSON.stringify(bottle.value),
      });
    }
    getBottles();
    return;
  };

  const deleteBottle = async (id: any): Promise<void> => {
    await $fetch(`/api/bottle/${id}`, {
      method: "DELETE",
    });
    getBottles();
    return;
  };

  const sortBottles = () => {
    bottles.value.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  };

  const getName = (id: string) => {
    return getBottleById(id)?.name;
  };

  const getBottleById = (id: string): Bottle =>
    bottles.value.find((b) => b._id.toString() === id) as unknown as Bottle;

  const selectBottle = (id: string) => {
    bottle.value = bottles.value.find(
      (b) => b._id.toString() === id
    ) as unknown as Bottle;
  };

  return {
    bottles,
    bottle,
    getBottles,
    setBottle,
    resetBottle,
    updateBottle,
    deleteBottle,
    sortBottles,
    getName,
    getBottleById,
    selectBottle,
  };
});

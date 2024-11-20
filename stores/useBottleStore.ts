import type { Bottle } from "~/types";
import type { ObjectId } from "mongoose";

/**
 * A Vuex store for managing bottles.
 *
 * @returns {Object} An object containing the store's state, getters, mutations, and actions.
 */
export const useBottleStore = defineStore("bottles", () => {
  const bottles = ref<Bottle[]>([]);
  const bottle = ref<Bottle>({
    _id: "" as unknown as ObjectId,
    name: "",
    class: "",
    type: "",
    abv: 0,
    recipe: "" as unknown as ObjectId,
    batches: [],
  });

  /**
   * Fetches all bottles from the API and updates the 'bottles' state.
   *
   * @returns {void}
   */
  const getBottles = async (): Promise<void> => {
    const response = await $fetch("/api/bottle");
    bottles.value = response as Bottle[];
    return;
  };

  /**
   * Selects a bottle from the 'bottles' state based on the provided _id.
   *
   * @param {string} _id - The unique identifier of the bottle to select.
   * @returns {void}
   */
  const selectBottle = (_id: any): void => {
    const selectedBottle = bottles.value.find((bottle) => bottle._id == _id);
    bottle.value = selectedBottle as Bottle;
    return;
  };

  /**
   * Adds a new bottle to the API and updates the 'bottles' state.
   *
   * @param {Object} newBottle - The new bottle to add.
   * @returns {void}
   */
  const addBottle = async (newBottle: object): Promise<void> => {
    await $fetch("/api/bottle/create", {
      method: "POST",
      body: JSON.stringify(newBottle),
    });
    getBottles();
    return;
  };

  /**
   * Updates an existing bottle in the API and updates the 'bottles' state.
   *
   * @returns {void}
   */
  const updateBottle = async (): Promise<void> => {
    await $fetch(`/api/bottle/${bottle.value?._id}`, {
      method: "PUT",
      body: JSON.stringify(bottle.value),
    });
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

  return {
    bottles,
    bottle,
    getBottles,
    selectBottle,
    addBottle,
    updateBottle,
    deleteBottle,
  };
});

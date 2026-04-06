import { computed } from 'vue';
import { defineStore } from 'pinia';
import { u as useCrudStore } from './useCrudStore-CgiT9u6L.mjs';

const sortByName = (items) => {
  items.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
};
const useBottleStore = defineStore("bottles", () => {
  const crud = useCrudStore({
    name: "Bottle",
    apiPath: "/api/bottle",
    defaultItem: () => ({
      _id: "",
      name: "",
      type: "",
      abv: 0,
      recipe: "",
      class: "",
      price: 0,
      img: "",
      description: "",
      inStock: true,
      archived: false
    }),
    sort: sortByName,
    resetOnSave: false,
    beforeCreate: (data) => {
      const cleaned = { ...data };
      if (!cleaned.recipe) delete cleaned.recipe;
      return cleaned;
    },
    beforeUpdate: (data) => {
      const cleaned = { ...data };
      if (!cleaned.recipe) delete cleaned.recipe;
      return cleaned;
    }
  });
  const activeBottles = computed(
    () => crud.items.value.filter((b) => !b.archived)
  );
  const getName = (id) => crud.getById(id)?.name;
  const bottleNameId = computed(() => {
    return activeBottles.value.map((b) => ({ id: b._id, label: b.name }));
  });
  return {
    ...crud,
    // Domain aliases for backward compatibility
    bottles: crud.items,
    bottle: crud.item,
    getBottles: crud.getAll,
    updateBottle: crud.saveItem,
    deleteBottle: crud.deleteItem,
    resetBottle: crud.resetItem,
    setBottle: crud.setItem,
    getBottleById: crud.getById,
    sortBottles: () => sortByName(crud.items.value),
    // Domain-specific
    activeBottles,
    getName,
    bottleNameId
  };
});

export { useBottleStore as u };
//# sourceMappingURL=useBottleStore-NPRWrMTA.mjs.map

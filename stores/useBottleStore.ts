import type { Bottle } from "~/types";

const sortByName = (items: Bottle[]) => {
  items.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
};

export const useBottleStore = defineStore("bottles", () => {
  const crud = useCrudStore<Bottle>({
    name: "Bottle",
    apiPath: "/api/bottle",
    defaultItem: () => ({
      _id: '' as unknown as string,
      name: "",
      type: "",
      abv: 0,
      recipe: "",
      class: "",
      price: 0,
      img: "",
      description: "",
      inStock: true,
      archived: false,
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
    },
  });

  // Domain-specific getters
  const activeBottles = computed(() =>
    crud.items.value.filter((b) => !b.archived),
  );

  const getName = (id: string) => crud.getById(id)?.name;

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
    bottleNameId,
  };
});

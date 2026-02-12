import type { Bottle } from "~/types";

export const useBottleStore = defineStore("bottles", () => {
  const toast = useToast();

  const bottles = ref<Bottle[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const bottle = ref<Bottle>({
    _id: '',
    name: "",
    type: "bottle",
    abv: 0,
    recipe: '',
    class: "",
    price: 0,
    img: "",
    description: "",
    inStock: true,
  });

  const getBottles = async (): Promise<void> => {
    loading.value = true;
    try {
      const response = await $fetch("/api/bottle");
      bottles.value = response as Bottle[];
      sortBottles();
    } catch (e) {
      console.error("Error fetching bottles:", e);
    } finally {
      loading.value = false;
    }
  };
  getBottles();

  const setBottle = (id: string) => {
    bottle.value = bottles.value.find(
      (b) => b._id === id
    ) as Bottle;
  };

  const resetBottle = () => {
    bottle.value = {
      _id: '',
      name: "",
      type: "bottle",
      abv: 0,
      recipe: '',
      class: "",
      price: 0,
      img: "",
      description: "",
      inStock: true,
    };
  };

  const updateBottle = async (): Promise<void> => {
    saving.value = true;
    try {
      const isNew = !bottle.value._id;
      if (isNew) {
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
      toast.add({ title: `Bottle ${isNew ? 'created' : 'updated'}`, color: 'success', icon: 'i-lucide-check-circle' });
      getBottles();
    } catch (error: any) {
      toast.add({ title: 'Failed to save bottle', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
  };

  const deleteBottle = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      await $fetch(`/api/bottle/${id}`, {
        method: "DELETE",
      });
      toast.add({ title: 'Bottle deleted', color: 'success', icon: 'i-lucide-check-circle' });
      getBottles();
    } catch (error: any) {
      toast.add({ title: 'Failed to delete bottle', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
    } finally {
      saving.value = false;
    }
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
    bottles.value.find((b) => b._id === id) as Bottle;

  const selectBottle = (id: string) => {
    bottle.value = bottles.value.find(
      (b) => b._id === id
    ) as Bottle;
  };

  return {
    bottles,
    bottle,
    loading,
    saving,
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

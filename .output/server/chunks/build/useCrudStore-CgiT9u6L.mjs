import { m as useToast } from './server.mjs';
import { ref, toRaw } from 'vue';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';

function useCrudStore(options) {
  const { name, apiPath, defaultItem, sort, beforeCreate, beforeUpdate, resetOnSave = true } = options;
  const toast = useToast();
  const items = ref([]);
  const item = ref(defaultItem());
  const loading = ref(false);
  const saving = ref(false);
  const loaded = ref(false);
  const getAll = async (params) => {
    loading.value = true;
    try {
      let url = apiPath;
      if (params && Object.keys(params).length > 0) {
        const qs = new URLSearchParams(params).toString();
        url = `${apiPath}?${qs}`;
      }
      const response = await $fetch(url);
      items.value = response;
      if (sort) sort(items.value);
    } finally {
      loading.value = false;
    }
  };
  const ensureLoaded = async () => {
    if (!loaded.value) {
      try {
        await getAll();
        loaded.value = true;
      } catch {
      }
    }
  };
  const setItem = (id) => {
    const found = items.value.find((i) => i._id === id);
    if (found) item.value = structuredClone(toRaw(found));
  };
  const resetItem = () => {
    item.value = defaultItem();
  };
  const saveItem = async () => {
    saving.value = true;
    try {
      const isNew = !item.value._id;
      let response;
      if (isNew) {
        const { _id, ...rest } = item.value;
        const createData = beforeCreate ? beforeCreate(rest) : rest;
        response = await $fetch(`${apiPath}/create`, {
          method: "POST",
          body: createData
        });
        items.value.push(response);
      } else {
        const updateData = beforeUpdate ? beforeUpdate(item.value) : item.value;
        response = await $fetch(`${apiPath}/${item.value._id}`, {
          method: "PUT",
          body: updateData
        });
        const index = items.value.findIndex((i) => i._id === item.value._id);
        if (index !== -1) {
          items.value[index] = response;
        }
      }
      if (sort) sort(items.value);
      toast.add({
        title: `${name} ${isNew ? "created" : "updated"}`,
        color: "success",
        icon: "i-lucide-check-circle"
      });
      if (resetOnSave) resetItem();
      return response;
    } catch (error) {
      toast.add({
        title: `Failed to save ${name.toLowerCase()}`,
        description: getErrorMessage(error),
        color: "error",
        icon: "i-lucide-alert-circle"
      });
      throw error;
    } finally {
      saving.value = false;
    }
  };
  const deleteItem = async (id) => {
    saving.value = true;
    try {
      await $fetch(`${apiPath}/${id}`, {
        method: "DELETE"
      });
      items.value = items.value.filter((i) => i._id !== id);
      toast.add({
        title: `${name} deleted`,
        color: "success",
        icon: "i-lucide-check-circle"
      });
    } catch (error) {
      toast.add({
        title: `Failed to delete ${name.toLowerCase()}`,
        description: getErrorMessage(error),
        color: "error",
        icon: "i-lucide-alert-circle"
      });
    } finally {
      saving.value = false;
    }
  };
  const getById = (id) => {
    return items.value.find((i) => i._id === id);
  };
  return {
    items,
    item,
    loading,
    saving,
    loaded,
    getAll,
    ensureLoaded,
    setItem,
    resetItem,
    saveItem,
    deleteItem,
    getById
  };
}

export { useCrudStore as u };
//# sourceMappingURL=useCrudStore-CgiT9u6L.mjs.map

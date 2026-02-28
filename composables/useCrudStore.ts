import type { Ref } from "vue";

export interface CrudStoreOptions<T extends { _id: string }> {
  /** Display name for toast messages (e.g., "Bottle", "Purchase order") */
  name: string;
  /** API base path (e.g., "/api/bottle") */
  apiPath: string;
  /** Factory function returning a fresh default item */
  defaultItem: () => T;
  /** Optional: sort the items array after fetch/save */
  sort?: (items: T[]) => void;
  /** Optional: transform data before create (e.g., strip empty fields) */
  beforeCreate?: (data: Partial<T>) => Partial<T>;
  /** Optional: transform data before update (e.g., strip password) */
  beforeUpdate?: (data: T) => Partial<T>;
  /** Optional: whether to reset item after successful save. Default: true */
  resetOnSave?: boolean;
}

export interface CrudStoreReturn<T extends { _id: string }> {
  /** Reactive array of all items */
  items: Ref<T[]>;
  /** Reactive single item (for editing) */
  item: Ref<T>;
  /** Whether data is currently being loaded from the API */
  loading: Ref<boolean>;
  /** Whether a save/delete operation is in progress */
  saving: Ref<boolean>;
  /** Whether data has been loaded at least once */
  loaded: Ref<boolean>;
  /** Load all items from API (optional query params) */
  getAll: (params?: Record<string, string>) => Promise<void>;
  /** Load items if not yet loaded */
  ensureLoaded: () => Promise<void>;
  /** Deep-clone an item from the list into the singleton for editing */
  setItem: (id: string) => void;
  /** Reset the singleton to default values */
  resetItem: () => void;
  /** Create or update the current singleton item. Returns the saved item. */
  saveItem: () => Promise<T>;
  /** Delete an item by ID */
  deleteItem: (id: string) => Promise<void>;
  /** Find an item from the local list by ID */
  getById: (id: string) => T | undefined;
}

/**
 * Factory composable that generates standard CRUD state and actions for a Pinia store.
 *
 * Usage within defineStore:
 * ```ts
 * const crud = useCrudStore<Bottle>({
 *   name: 'Bottle',
 *   apiPath: '/api/bottle',
 *   defaultItem: () => ({ _id: '', name: '', ... }),
 * });
 * ```
 */
export function useCrudStore<T extends { _id: string }>(
  options: CrudStoreOptions<T>,
): CrudStoreReturn<T> {
  const { name, apiPath, defaultItem, sort, beforeCreate, beforeUpdate, resetOnSave = true } = options;
  const toast = useToast();

  // --- State ---
  const items = ref<T[]>([]) as Ref<T[]>;
  const item = ref<T>(defaultItem()) as Ref<T>;
  const loading = ref(false);
  const saving = ref(false);
  const loaded = ref(false);

  // --- Actions ---

  const getAll = async (params?: Record<string, string>): Promise<void> => {
    loading.value = true;
    try {
      let url = apiPath;
      if (params && Object.keys(params).length > 0) {
        const qs = new URLSearchParams(params).toString();
        url = `${apiPath}?${qs}`;
      }
      const response = await $fetch<T[]>(url);
      items.value = response;
      if (sort) sort(items.value);
    } finally {
      loading.value = false;
    }
  };

  const ensureLoaded = async (): Promise<void> => {
    if (!loaded.value) {
      try {
        await getAll();
        loaded.value = true;
      } catch {
        // loaded stays false -- will retry on next call
      }
    }
  };

  const setItem = (id: string): void => {
    const found = items.value.find((i) => i._id === id);
    if (found) item.value = structuredClone(toRaw(found));
  };

  const resetItem = (): void => {
    item.value = defaultItem();
  };

  const saveItem = async (): Promise<T> => {
    saving.value = true;
    try {
      const isNew = !item.value._id;
      let response: T;

      if (isNew) {
        const { _id, ...rest } = item.value;
        const createData = beforeCreate ? beforeCreate(rest as Partial<T>) : rest;
        response = await $fetch<T>(`${apiPath}/create`, {
          method: "POST",
          body: createData,
        });
        items.value.push(response);
      } else {
        const updateData = beforeUpdate ? beforeUpdate(item.value) : item.value;
        response = await $fetch<T>(`${apiPath}/${item.value._id}`, {
          method: "PUT",
          body: updateData,
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
        icon: "i-lucide-check-circle",
      });
      if (resetOnSave) resetItem();
      return response;
    } catch (error: unknown) {
      toast.add({
        title: `Failed to save ${name.toLowerCase()}`,
        description: getErrorMessage(error),
        color: "error",
        icon: "i-lucide-alert-circle",
      });
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      await $fetch(`${apiPath}/${id}`, {
        method: "DELETE",
      });
      items.value = items.value.filter((i) => i._id !== id);
      toast.add({
        title: `${name} deleted`,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } catch (error: unknown) {
      toast.add({
        title: `Failed to delete ${name.toLowerCase()}`,
        description: getErrorMessage(error),
        color: "error",
        icon: "i-lucide-alert-circle",
      });
    } finally {
      saving.value = false;
    }
  };

  const getById = (id: string): T | undefined => {
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
    getById,
  };
}

import type { Settings } from "~/types";

const DEFAULT_SETTINGS: Omit<Settings, "_id"> = {
  itemCategories: ["Bottling", "Base Ingredient", "Botanical", "Bar Supplies", "Other"],
  barrelAgeDefaults: {
    "5 Gallon": 12,
    "10 Gallon": 15,
    "15 Gallon": 18,
    "30 Gallon": 24,
    "53 Gallon": 36,
  },
  theme: { primaryColor: "amber" },
  distillery: {
    name: "Galveston Distilling Co",
    address: "",
    permitNumbers: { ttb: "", tabc: "" },
  },
};

export const useSettingsStore = defineStore("settings", () => {
  const toast = useToast();

  const settings = ref<Settings>({
    _id: "",
    ...structuredClone(DEFAULT_SETTINGS),
  });
  const loaded = ref(false);
  const loading = ref(false);
  const saving = ref(false);

  async function fetchSettings() {
    loading.value = true;
    try {
      const response = await $fetch("/api/settings");
      settings.value = response as Settings;
    } catch {
      toast.add({
        title: "Failed to load settings",
        color: "error",
        icon: "i-lucide-alert-circle",
      });
    } finally {
      loading.value = false;
    }
  }

  async function ensureLoaded() {
    if (!loaded.value) {
      try {
        await fetchSettings();
        loaded.value = true;
      } catch {
        // loaded stays false -- will retry on next call
      }
    }
  }

  async function updateSettings(data: Partial<Settings>) {
    saving.value = true;
    try {
      const response = await $fetch("/api/settings", {
        method: "PUT",
        body: data,
      });
      settings.value = response as Settings;
      toast.add({
        title: "Settings saved",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } catch (error: any) {
      toast.add({
        title: "Failed to save settings",
        description: error?.data?.statusMessage || error?.data?.message,
        color: "error",
        icon: "i-lucide-alert-circle",
      });
      throw error;
    } finally {
      saving.value = false;
    }
  }

  // Convenience getters
  const itemCategories = computed(() => settings.value.itemCategories);
  const barrelAgeDefaults = computed(() => settings.value.barrelAgeDefaults);
  const theme = computed(() => settings.value.theme);
  const distillery = computed(() => settings.value.distillery);

  return {
    settings,
    loaded,
    loading,
    saving,
    fetchSettings,
    ensureLoaded,
    updateSettings,
    itemCategories,
    barrelAgeDefaults,
    theme,
    distillery,
  };
});

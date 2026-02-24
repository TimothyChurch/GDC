<script setup lang="ts">
definePageMeta({ layout: "admin" });

const settingsStore = useSettingsStore();
const toast = useToast();

await settingsStore.ensureLoaded();

// ---- Tab state ----
const tabs = [
  { label: "Categories", icon: "i-lucide-tags", value: "categories" },
  { label: "Barrel Defaults", icon: "i-lucide-cylinder", value: "barrels" },
  { label: "Theme", icon: "i-lucide-palette", value: "theme" },
  { label: "Distillery Info", icon: "i-lucide-building-2", value: "distillery" },
];

// ---- Categories ----
const localCategories = ref<string[]>([]);
const newCategory = ref("");

function resetCategories() {
  localCategories.value = [...settingsStore.itemCategories];
}
resetCategories();

watch(() => settingsStore.itemCategories, resetCategories);

function addCategory() {
  const trimmed = newCategory.value.trim();
  if (!trimmed) return;
  if (localCategories.value.includes(trimmed)) {
    toast.add({ title: "Category already exists", color: "warning", icon: "i-lucide-alert-triangle" });
    return;
  }
  localCategories.value.push(trimmed);
  newCategory.value = "";
}

function removeCategory(index: number) {
  localCategories.value.splice(index, 1);
}

async function saveCategories() {
  if (localCategories.value.length === 0) {
    toast.add({ title: "At least one category is required", color: "warning", icon: "i-lucide-alert-triangle" });
    return;
  }
  await settingsStore.updateSettings({ itemCategories: localCategories.value });
}

// ---- Barrel Age Defaults ----
interface BarrelEntry {
  size: string;
  months: number;
}
const localBarrels = ref<BarrelEntry[]>([]);
const newBarrelSize = ref("");
const newBarrelMonths = ref(12);

function resetBarrels() {
  localBarrels.value = Object.entries(settingsStore.barrelAgeDefaults).map(
    ([size, months]) => ({ size, months })
  );
}
resetBarrels();

watch(() => settingsStore.barrelAgeDefaults, resetBarrels);

function addBarrelEntry() {
  const trimmed = newBarrelSize.value.trim();
  if (!trimmed) return;
  if (localBarrels.value.some((b) => b.size === trimmed)) {
    toast.add({ title: "Size already exists", color: "warning", icon: "i-lucide-alert-triangle" });
    return;
  }
  localBarrels.value.push({ size: trimmed, months: newBarrelMonths.value });
  newBarrelSize.value = "";
  newBarrelMonths.value = 12;
}

function removeBarrelEntry(index: number) {
  localBarrels.value.splice(index, 1);
}

async function saveBarrels() {
  const map: Record<string, number> = {};
  for (const entry of localBarrels.value) {
    map[entry.size] = entry.months;
  }
  await settingsStore.updateSettings({ barrelAgeDefaults: map });
}

// ---- Theme ----
const NUXT_UI_COLORS = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald",
  "teal", "cyan", "sky", "blue", "indigo", "violet", "purple",
  "fuchsia", "pink", "rose",
];
const localPrimaryColor = ref("");

function resetTheme() {
  localPrimaryColor.value = settingsStore.theme.primaryColor || "amber";
}
resetTheme();

watch(() => settingsStore.theme, resetTheme);

async function saveTheme() {
  await settingsStore.updateSettings({ theme: { primaryColor: localPrimaryColor.value } });
}

// ---- Distillery Info ----
const localDistillery = ref({
  name: "",
  address: "",
  permitNumbers: { ttb: "", tabc: "" },
});

function resetDistillery() {
  localDistillery.value = JSON.parse(JSON.stringify(settingsStore.distillery));
}
resetDistillery();

watch(() => settingsStore.distillery, resetDistillery);

async function saveDistillery() {
  await settingsStore.updateSettings({ distillery: localDistillery.value });
}
</script>

<template>
  <div>
    <AdminPageHeader
      title="Settings"
      subtitle="Application-wide configuration"
      icon="i-lucide-settings"
    />

    <!-- Loading skeleton -->
    <div v-if="settingsStore.loading" class="space-y-4">
      <div class="h-10 bg-charcoal rounded-lg animate-pulse" />
      <div class="h-64 bg-charcoal rounded-xl animate-pulse" />
    </div>

    <UTabs v-else :items="tabs" class="w-full">
      <template #categories>
        <div class="bg-charcoal rounded-xl border border-brown/30 p-6 mt-4">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Item Categories</h3>
            <p class="text-sm text-parchment/60 mt-1">
              Manage the categories available when creating or editing items.
            </p>
          </div>

          <!-- Existing categories -->
          <div class="space-y-2 mb-4">
            <div
              v-for="(cat, i) in localCategories"
              :key="i"
              class="flex items-center justify-between bg-espresso/50 rounded-lg px-4 py-2.5 border border-brown/20"
            >
              <span class="text-sm text-parchment">{{ cat }}</span>
              <UButton
                icon="i-lucide-x"
                color="error"
                variant="ghost"
                size="xs"
                :disabled="localCategories.length <= 1"
                @click="removeCategory(i)"
              />
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="localCategories.length === 0" class="text-center py-6">
            <UIcon name="i-lucide-tags" class="text-3xl text-parchment/30 mb-2" />
            <p class="text-sm text-parchment/50">No categories defined</p>
          </div>

          <!-- Add new category -->
          <div class="flex items-center gap-2 mt-4">
            <UInput
              v-model="newCategory"
              placeholder="New category name..."
              class="flex-1"
              @keydown.enter="addCategory"
            />
            <UButton
              icon="i-lucide-plus"
              label="Add"
              color="primary"
              :disabled="!newCategory.trim()"
              @click="addCategory"
            />
          </div>

          <!-- Save -->
          <div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
            <div class="flex items-center gap-2">
              <UButton
                label="Reset"
                variant="ghost"
                color="neutral"
                @click="resetCategories"
              />
              <UButton
                label="Save Categories"
                icon="i-lucide-save"
                color="primary"
                :loading="settingsStore.saving"
                @click="saveCategories"
              />
            </div>
          </div>
        </div>
      </template>

      <template #barrels>
        <div class="bg-charcoal rounded-xl border border-brown/30 p-6 mt-4">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Barrel Age Defaults</h3>
            <p class="text-sm text-parchment/60 mt-1">
              Default aging targets (in months) by barrel size. These are used as suggested aging goals when a barrel is filled.
            </p>
          </div>

          <!-- Existing entries -->
          <div class="space-y-2 mb-4">
            <div
              v-for="(entry, i) in localBarrels"
              :key="i"
              class="flex items-center gap-3 bg-espresso/50 rounded-lg px-4 py-2.5 border border-brown/20"
            >
              <span class="text-sm text-parchment flex-1">{{ entry.size }}</span>
              <div class="flex items-center gap-2">
                <UInput
                  v-model.number="entry.months"
                  type="number"
                  :min="1"
                  class="w-20"
                />
                <span class="text-xs text-parchment/50">months</span>
              </div>
              <UButton
                icon="i-lucide-x"
                color="error"
                variant="ghost"
                size="xs"
                @click="removeBarrelEntry(i)"
              />
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="localBarrels.length === 0" class="text-center py-6">
            <UIcon name="i-lucide-cylinder" class="text-3xl text-parchment/30 mb-2" />
            <p class="text-sm text-parchment/50">No barrel defaults defined</p>
          </div>

          <!-- Add new barrel entry -->
          <div class="flex items-center gap-2 mt-4">
            <UInput
              v-model="newBarrelSize"
              placeholder="Barrel size (e.g., 5 Gallon)"
              class="flex-1"
              @keydown.enter="addBarrelEntry"
            />
            <UInput
              v-model.number="newBarrelMonths"
              type="number"
              :min="1"
              placeholder="Months"
              class="w-24"
            />
            <UButton
              icon="i-lucide-plus"
              label="Add"
              color="primary"
              :disabled="!newBarrelSize.trim()"
              @click="addBarrelEntry"
            />
          </div>

          <!-- Save -->
          <div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
            <div class="flex items-center gap-2">
              <UButton
                label="Reset"
                variant="ghost"
                color="neutral"
                @click="resetBarrels"
              />
              <UButton
                label="Save Barrel Defaults"
                icon="i-lucide-save"
                color="primary"
                :loading="settingsStore.saving"
                @click="saveBarrels"
              />
            </div>
          </div>
        </div>
      </template>

      <template #theme>
        <div class="bg-charcoal rounded-xl border border-brown/30 p-6 mt-4">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Theme</h3>
            <p class="text-sm text-parchment/60 mt-1">
              Customize the application's accent color. This changes the primary color used across the admin interface.
            </p>
          </div>

          <!-- Color picker grid -->
          <div class="mb-2">
            <label class="text-sm font-medium text-parchment/70 mb-3 block">Primary Color</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in NUXT_UI_COLORS"
                :key="color"
                :class="[
                  'w-10 h-10 rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center justify-center',
                  localPrimaryColor === color
                    ? 'border-parchment scale-110 ring-2 ring-parchment/30'
                    : 'border-transparent hover:scale-105',
                ]"
                :style="{ backgroundColor: `var(--color-${color}-500, ${color})` }"
                :title="color"
                @click="localPrimaryColor = color"
              >
                <UIcon
                  v-if="localPrimaryColor === color"
                  name="i-lucide-check"
                  class="text-white text-lg drop-shadow-md"
                />
              </button>
            </div>
            <p class="text-xs text-parchment/50 mt-2">
              Selected: <span class="font-semibold text-parchment/70 capitalize">{{ localPrimaryColor }}</span>
            </p>
          </div>

          <!-- Save -->
          <div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
            <div class="flex items-center gap-2">
              <UButton
                label="Reset"
                variant="ghost"
                color="neutral"
                @click="resetTheme"
              />
              <UButton
                label="Save Theme"
                icon="i-lucide-save"
                color="primary"
                :loading="settingsStore.saving"
                @click="saveTheme"
              />
            </div>
          </div>
        </div>
      </template>

      <template #distillery>
        <div class="bg-charcoal rounded-xl border border-brown/30 p-6 mt-4">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Distillery Information</h3>
            <p class="text-sm text-parchment/60 mt-1">
              Business details used in reports and compliance documents.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Distillery Name" class="md:col-span-2">
              <UInput
                v-model="localDistillery.name"
                placeholder="Galveston Distilling Co"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Address" class="md:col-span-2">
              <UTextarea
                v-model="localDistillery.address"
                placeholder="123 Main St, Galveston, TX 77550"
                :rows="2"
                class="w-full"
              />
            </UFormField>

            <UFormField label="TTB Permit Number">
              <UInput
                v-model="localDistillery.permitNumbers.ttb"
                placeholder="DSP-TX-XXXXX"
                class="w-full"
              />
            </UFormField>

            <UFormField label="TABC Permit Number">
              <UInput
                v-model="localDistillery.permitNumbers.tabc"
                placeholder="MB-XXXXXX"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Save -->
          <div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
            <div class="flex items-center gap-2">
              <UButton
                label="Reset"
                variant="ghost"
                color="neutral"
                @click="resetDistillery"
              />
              <UButton
                label="Save Distillery Info"
                icon="i-lucide-save"
                color="primary"
                :loading="settingsStore.saving"
                @click="saveDistillery"
              />
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

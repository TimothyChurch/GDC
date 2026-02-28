<script setup lang="ts">
const settingsStore = useSettingsStore();
const toast = useToast();

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
</script>

<template>
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
          <UInput v-model.number="entry.months" type="number" :min="1" class="w-20" />
          <span class="text-xs text-parchment/50">months</span>
        </div>
        <UButton icon="i-lucide-x" color="error" variant="ghost" size="xs" @click="removeBarrelEntry(i)" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="localBarrels.length === 0" class="text-center py-6">
      <UIcon name="i-lucide-cylinder" class="text-3xl text-parchment/30 mb-2" />
      <p class="text-sm text-parchment/50">No barrel defaults defined</p>
    </div>

    <!-- Add new barrel entry -->
    <div class="flex items-center gap-2 mt-4">
      <UInput v-model="newBarrelSize" placeholder="Barrel size (e.g., 5 Gallon)" class="flex-1" @keydown.enter="addBarrelEntry" />
      <UInput v-model.number="newBarrelMonths" type="number" :min="1" placeholder="Months" class="w-24" />
      <UButton icon="i-lucide-plus" label="Add" color="primary" :disabled="!newBarrelSize.trim()" @click="addBarrelEntry" />
    </div>

    <!-- Save -->
    <div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
      <div class="flex items-center gap-2">
        <UButton label="Reset" variant="ghost" color="neutral" @click="resetBarrels" />
        <UButton label="Save Barrel Defaults" icon="i-lucide-save" color="primary" :loading="settingsStore.saving" @click="saveBarrels" />
      </div>
    </div>
  </div>
</template>

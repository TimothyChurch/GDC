<script setup lang="ts">
const settingsStore = useSettingsStore();

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
</script>

<template>
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
        <UButton label="Reset" variant="ghost" color="neutral" @click="resetTheme" />
        <UButton label="Save Theme" icon="i-lucide-save" color="primary" :loading="settingsStore.saving" @click="saveTheme" />
      </div>
    </div>
  </div>
</template>

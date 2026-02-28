<script setup lang="ts">
definePageMeta({ layout: "admin" });

const settingsStore = useSettingsStore();
await settingsStore.ensureLoaded();

const tabs = [
  { label: "Categories", icon: "i-lucide-tags", value: "categories", slot: "categories" },
  { label: "Barrel Defaults", icon: "i-lucide-cylinder", value: "barrels", slot: "barrels" },
  { label: "Theme", icon: "i-lucide-palette", value: "theme", slot: "theme" },
  { label: "Distillery Info", icon: "i-lucide-building-2", value: "distillery", slot: "distillery" },
];
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
        <SettingsCategories />
      </template>
      <template #barrels>
        <SettingsBarrelDefaults />
      </template>
      <template #theme>
        <SettingsTheme />
      </template>
      <template #distillery>
        <SettingsDistillery />
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
const batchStore = useBatchStore();
const vesselStore = useVesselStore();
const recipeStore = useRecipeStore();
</script>

<template>
  <div class="flex flex-col gap-6 p-4">
    <!-- Batch Pipeline -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <DashboardUpcoming />
      <DashboardBrewing />
      <DashboardFermenters />
      <DashboardDistilling />
    </div>

    <!-- Storage & Barrels -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h1 class="font-bold text-xl">Storage</h1>
        <div v-if="vesselStore.tanks.length === 0" class="text-sm text-neutral-500 py-4">
          No storage tanks configured
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <UCard v-for="tank in vesselStore.tanks" :key="tank._id">
            <template #header>{{ tank.name }}</template>
            <div v-if="!tank.contents || tank.contents.length === 0" class="text-sm text-neutral-500">
              Empty
            </div>
            <div v-else class="text-sm">
              <div v-for="content in tank.contents" :key="content.batch">
                <div>{{ recipeStore.getRecipeById(batchStore.getBatchById(content.batch)?.recipe)?.name }}</div>
                <div>{{ content.volume }} {{ content.volumeUnit }}</div>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div>
        <h1 class="font-bold text-xl">Barreled</h1>
        <div v-if="vesselStore.barrels.filter((b) => b.contents && b.contents.length > 0).length === 0" class="text-sm text-neutral-500 py-4">
          No barrels with contents
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <UCard v-for="barrel in vesselStore.barrels.filter((b) => b.contents && b.contents.length > 0)" :key="barrel._id">
            <template #header>{{ barrel.name }}</template>
            <div class="text-sm">
              <div v-for="content in barrel.contents" :key="content.batch">
                <div>{{ recipeStore.getRecipeById(batchStore.getBatchById(content.batch)?.recipe)?.name }}</div>
                <div>{{ content.volume }} {{ content.volumeUnit }}</div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Recent Production -->
    <DashboardProduction />
  </div>
</template>

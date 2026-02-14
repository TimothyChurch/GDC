<script setup lang="ts">
const vesselStore = useVesselStore();
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-lucide-flask-conical" class="text-copper" />
      <h3 class="text-sm font-bold text-parchment uppercase tracking-wider">Distilling</h3>
    </div>
    <div v-if="vesselStore.stills.length === 0" class="py-4 text-center">
      <p class="text-xs text-parchment/50">No stills configured</p>
    </div>
    <div v-else class="flex flex-col gap-2">
      <div v-for="still in vesselStore.stills" :key="still._id">
        <div class="rounded-lg border border-brown/20 bg-brown/10 p-3">
          <div class="text-xs font-semibold text-parchment/60 mb-2">{{ still.name }}</div>
          <div v-if="!still.contents || still.contents.length === 0" class="text-xs text-parchment/25">
            Empty
          </div>
          <div v-for="content in still.contents" :key="content.batch">
            <DashboardBatchCard :batchId="content.batch" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

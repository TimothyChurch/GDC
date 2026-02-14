<script setup lang="ts">
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const items = computed(() => {
  return [
    vesselStore.mashTuns.map((vessel) => {
      return {
        label: vessel.name,
        _id: vessel._id,
      };
    }),
  ];
});

const onStartBrewing = async (batchId: string, vesselId: string) => {
  await batchStore.startBrewing(batchId, vesselId);
};
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-lucide-calendar-clock" class="text-blue-400" />
      <h3 class="text-sm font-bold text-parchment uppercase tracking-wider">Upcoming</h3>
      <span v-if="batchStore.upcomingBatches.length > 0" class="text-xs text-parchment/50">
        ({{ batchStore.upcomingBatches.length }})
      </span>
    </div>
    <div v-if="batchStore.upcomingBatches.length === 0" class="py-4 text-center">
      <p class="text-xs text-parchment/50">No upcoming batches</p>
    </div>
    <div v-else class="flex flex-col gap-3">
      <div v-for="batch in batchStore.upcomingBatches" :key="batch._id">
        <div class="flex flex-col items-center gap-2">
          <DashboardBatchCard :batchId="batch._id" />
          <UDropdown :items="items">
            <UButton size="sm" class="bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 text-xs">
              Start Brewing
            </UButton>
            <template #item="{ item }">
              <div @click="onStartBrewing(batch._id, item._id)">
                {{ item.label }}
              </div>
            </template>
          </UDropdown>
        </div>
      </div>
    </div>
  </div>
</template>

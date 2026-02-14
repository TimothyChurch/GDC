<script setup lang="ts">
const batchStore = useBatchStore();
const vesselStore = useVesselStore();

const items = computed(() => {
  return [
    vesselStore.fermenters.map((fermenter) => {
      return {
        label: fermenter.name,
        value: fermenter._id,
      };
    }),
  ];
});

const moveToFermenter = async (mashTunId: string, fermenterId: string) => {
  const mashTun = vesselStore.getVesselById(mashTunId);
  const batchIds = mashTun?.contents?.map((c) => c.batch) || [];

  await vesselStore.fullTransfer(mashTunId, fermenterId);

  for (const batchId of batchIds) {
    await batchStore.advanceBatchStatus(batchId, 'Fermenting', {
      vessel: fermenterId,
      date: new Date(),
    });
  }
};
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-lucide-flame" class="text-orange-400" />
      <h3 class="text-sm font-bold text-parchment uppercase tracking-wider">Brewing</h3>
    </div>
    <div v-if="vesselStore.mashTuns.length === 0" class="py-4 text-center">
      <p class="text-xs text-parchment/50">No mash tuns configured</p>
    </div>
    <div v-else class="flex flex-col gap-3">
      <div v-for="mashTun in vesselStore.mashTuns" :key="mashTun._id">
        <div class="rounded-lg border border-brown/20 bg-brown/10 p-3">
          <div class="text-xs font-semibold text-parchment/60 mb-2">{{ mashTun.name }}</div>
          <div v-if="!mashTun.contents || mashTun.contents.length === 0" class="text-xs text-parchment/25">
            Empty
          </div>
          <div v-for="content in mashTun.contents" :key="content.batch">
            <div class="flex flex-col gap-2 items-center">
              <DashboardBatchCard :batchId="content.batch" />
              <UDropdown :items="items">
                <UButton size="sm" class="bg-orange-500/15 text-orange-400 border border-orange-500/25 hover:bg-orange-500/25 text-xs">
                  Move to Fermenter
                </UButton>
                <template #item="{ item }">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    class="w-full text-xs"
                    @click="moveToFermenter(mashTun._id, item.value)"
                  >{{ item.label }}</UButton>
                </template>
              </UDropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

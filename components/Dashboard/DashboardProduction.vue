<script setup lang="ts">
const productionStore = useProductionStore();
const bottleStore = useBottleStore();

const recentProductions = computed(() => {
  return [...productionStore.productions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-lucide-factory" class="text-copper" />
      <h3 class="text-sm font-bold text-parchment uppercase tracking-wider">Recent Productions</h3>
    </div>
    <div v-if="recentProductions.length === 0" class="py-4 text-center">
      <p class="text-xs text-parchment/30">No production records</p>
    </div>
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="prod in recentProductions"
        :key="prod._id"
        class="flex items-center justify-between rounded-lg border border-brown/20 bg-brown/10 px-3 py-2.5"
      >
        <div class="min-w-0">
          <div class="text-sm font-medium text-parchment truncate">{{ bottleStore.getName(prod.bottle) }}</div>
          <div class="text-xs text-parchment/30 mt-0.5">
            {{ new Date(prod.date).toLocaleDateString() }}
          </div>
        </div>
        <span class="text-xs font-medium text-copper shrink-0 ml-2">
          {{ prod.quantity }} bottles
        </span>
      </div>
    </div>
  </div>
</template>

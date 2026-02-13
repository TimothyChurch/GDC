<script setup lang="ts">
const productionStore = useProductionStore();
const bottleStore = useBottleStore();

const recentProductions = computed(() => {
  return [...productionStore.productions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);
});

const totalBottlesProduced = computed(() => {
  return productionStore.productions.reduce((sum, p) => sum + (p.quantity || 0), 0);
});

const formatDate = (date: Date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Recent Productions</h2>
        <p class="text-xs text-parchment/40 mt-0.5">
          {{ totalBottlesProduced.toLocaleString() }} total bottles produced
        </p>
      </div>
      <NuxtLink
        to="/admin/production"
        class="text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      >
        View All
        <UIcon name="i-lucide-arrow-right" class="text-sm" />
      </NuxtLink>
    </div>

    <div v-if="recentProductions.length === 0" class="py-8 text-center">
      <UIcon name="i-lucide-package-open" class="text-3xl text-parchment/20 mb-2" />
      <p class="text-sm text-parchment/30">No production records yet</p>
    </div>

    <div v-else class="flex flex-col divide-y divide-brown/20">
      <div
        v-for="prod in recentProductions"
        :key="prod._id"
        class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-wine" class="text-copper text-sm" />
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-parchment truncate">
              {{ bottleStore.getName(prod.bottle) || 'Unknown Bottle' }}
            </div>
            <div class="text-xs text-parchment/40">
              {{ formatDate(prod.date) }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-3">
          <span class="text-sm font-semibold text-parchment">
            {{ prod.quantity }}
          </span>
          <span class="text-xs text-parchment/40">bottles</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const bottleStore = useBottleStore();
const inventoryStore = useInventoryStore();

function getLatestQuantity(bottleId: string): number | null {
  const records = inventoryStore.getInventoriesByItem(bottleId);
  if (records.length === 0) return null;
  const sorted = [...records].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted[0].quantity;
}

const sortedBottles = computed(() =>
  [...bottleStore.bottles].sort((a, b) => a.name.localeCompare(b.name))
);
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-parchment/80 uppercase tracking-wider">
        Bottle Stock
      </h3>
      <NuxtLink
        to="/admin/bottles/inventory"
        class="text-xs text-copper hover:text-gold transition-colors"
      >
        View All
      </NuxtLink>
    </div>

    <div v-if="sortedBottles.length === 0" class="text-center py-6">
      <UIcon name="i-lucide-wine" class="text-2xl text-parchment/20 mb-2" />
      <p class="text-xs text-parchment/60">No bottles defined</p>
    </div>

    <div v-else class="max-h-80 overflow-y-auto space-y-1 -mx-1 px-1">
      <NuxtLink
        v-for="bottle in sortedBottles"
        :key="bottle._id"
        :to="`/admin/bottles/${bottle._id}`"
        class="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-brown/10 transition-colors cursor-pointer group"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-sm text-parchment/80 truncate group-hover:text-gold transition-colors duration-200">{{ bottle.name }}</span>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <!-- Quantity -->
          <span
            v-if="getLatestQuantity(bottle._id) !== null"
            :class="[
              'text-xs font-medium tabular-nums',
              (getLatestQuantity(bottle._id) ?? 0) <= 5
                ? 'text-red-400'
                : (getLatestQuantity(bottle._id) ?? 0) <= 10
                  ? 'text-amber-400'
                  : 'text-parchment/60',
            ]"
          >
            {{ getLatestQuantity(bottle._id) }}
          </span>
          <!-- Stock status -->
          <div class="flex items-center gap-1">
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                bottle.inStock !== false ? 'bg-green-400' : 'bg-red-400',
              ]"
            />
            <span
              :class="[
                'text-[10px]',
                bottle.inStock !== false ? 'text-green-400/70' : 'text-red-400/70',
              ]"
            >
              {{ bottle.inStock !== false ? 'In Stock' : 'Out' }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

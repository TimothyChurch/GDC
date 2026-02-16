<script setup lang="ts">
const itemStore = useItemStore();
const inventoryStore = useInventoryStore();
const bottleStore = useBottleStore();

// PLACEHOLDER: These thresholds should be configurable per-item in the future
const LOW_INVENTORY_THRESHOLD = 10;
const CRITICAL_INVENTORY_THRESHOLD = 3;

interface InventoryAlert {
  id: string;
  name: string;
  type: 'item' | 'bottle';
  quantity: number;
  unit: string;
  status: 'critical' | 'low' | 'ok';
}

// Get the latest inventory count for each item
const latestInventoryByItem = computed(() => {
  const map = new Map<string, number>();
  const sortedInventories = [...inventoryStore.inventories]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const inv of sortedInventories) {
    if (!map.has(inv.item)) {
      map.set(inv.item, inv.quantity);
    }
  }
  return map;
});

// Items that have inventory records with low quantities
const lowInventoryItems = computed<InventoryAlert[]>(() => {
  const alerts: InventoryAlert[] = [];

  for (const [itemId, quantity] of latestInventoryByItem.value) {
    if (quantity <= LOW_INVENTORY_THRESHOLD) {
      const item = itemStore.getItemById(itemId);
      if (item) {
        alerts.push({
          id: itemId,
          name: item.name,
          type: 'item',
          quantity,
          unit: item.inventoryUnit || 'units',
          status: quantity <= CRITICAL_INVENTORY_THRESHOLD ? 'critical' : 'low',
        });
      }
    }
  }

  return alerts.sort((a, b) => a.quantity - b.quantity);
});

// Bottles marked as out of stock
const outOfStockBottles = computed<InventoryAlert[]>(() => {
  return bottleStore.bottles
    .filter((b) => b.inStock === false)
    .map((b) => ({
      id: b._id,
      name: b.name,
      type: 'bottle' as const,
      quantity: 0,
      unit: 'bottles',
      status: 'critical' as const,
    }));
});

const allAlerts = computed(() => [
  ...outOfStockBottles.value,
  ...lowInventoryItems.value,
]);

const statusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-red-500';
    case 'low': return 'bg-amber';
    default: return 'bg-green-500';
  }
};

const statusBg = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-red-500/10 border-red-500/20';
    case 'low': return 'bg-amber/10 border-amber/20';
    default: return 'bg-green-500/10 border-green-500/20';
  }
};

const statusText = (status: string) => {
  switch (status) {
    case 'critical': return 'text-red-400';
    case 'low': return 'text-amber';
    default: return 'text-green-400';
  }
};
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Inventory Health</h2>
        <span
          v-if="allAlerts.length > 0"
          class="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold"
        >
          {{ allAlerts.length }}
        </span>
      </div>
      <NuxtLink
        to="/admin/items"
        class="text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      >
        Manage
        <UIcon name="i-lucide-arrow-right" class="text-sm" />
      </NuxtLink>
    </div>

    <!-- Health indicators -->
    <div class="flex gap-3 mb-4">
      <div class="flex items-center gap-1.5 text-xs">
        <div class="w-2 h-2 rounded-full bg-red-500" />
        <span class="text-parchment/50">
          {{ allAlerts.filter((a) => a.status === 'critical').length }} Critical
        </span>
      </div>
      <div class="flex items-center gap-1.5 text-xs">
        <div class="w-2 h-2 rounded-full bg-amber" />
        <span class="text-parchment/50">
          {{ allAlerts.filter((a) => a.status === 'low').length }} Low
        </span>
      </div>
      <div class="flex items-center gap-1.5 text-xs">
        <div class="w-2 h-2 rounded-full bg-green-500" />
        <span class="text-parchment/50">
          {{ itemStore.items.length - lowInventoryItems.length }} OK
        </span>
      </div>
    </div>

    <div v-if="allAlerts.length === 0" class="py-6 text-center">
      <UIcon name="i-lucide-check-circle" class="text-3xl text-green-400/40 mb-2" />
      <p class="text-sm text-parchment/50">All inventory levels healthy</p>
    </div>

    <div v-else class="flex flex-col gap-2 max-h-64 overflow-y-auto">
      <NuxtLink
        v-for="alert in allAlerts.slice(0, 10)"
        :key="alert.id"
        :to="alert.type === 'bottle' ? `/admin/bottles/${alert.id}` : `/admin/items/${alert.id}`"
        :class="[
          'flex items-center justify-between rounded-lg border px-3 py-2.5 hover:border-gold/30 transition-all duration-200 cursor-pointer group',
          statusBg(alert.status),
        ]"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div :class="['w-2 h-2 rounded-full shrink-0', statusColor(alert.status)]" />
          <div class="min-w-0">
            <div class="text-sm text-parchment truncate group-hover:text-gold transition-colors duration-200">{{ alert.name }}</div>
            <div class="text-[10px] uppercase tracking-wider text-parchment/50">
              {{ alert.type === 'bottle' ? 'Bottle Product' : 'Ingredient' }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 ml-3">
          <span :class="['text-sm font-bold', statusText(alert.status)]">
            {{ alert.quantity }}
          </span>
          <span class="text-[10px] text-parchment/50">{{ alert.unit }}</span>
        </div>
      </NuxtLink>
      <div
        v-if="allAlerts.length > 10"
        class="text-xs text-parchment/50 text-center py-1"
      >
        +{{ allAlerts.length - 10 }} more items
      </div>
    </div>

    <!-- PLACEHOLDER: Threshold info -->
    <div class="mt-3 pt-3 border-t border-brown/15 text-[10px] text-parchment/20">
      <!-- PLACEHOLDER: Replace thresholds with per-item configurable values -->
      Critical: &le;{{ CRITICAL_INVENTORY_THRESHOLD }} | Low: &le;{{ LOW_INVENTORY_THRESHOLD }} units
    </div>
  </div>
</template>

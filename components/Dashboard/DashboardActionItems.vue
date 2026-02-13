<script setup lang="ts">
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const inventoryStore = useInventoryStore();
const itemStore = useItemStore();

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  category: string;
  link?: string;
}

// Generate action items from real data where possible
const actionItems = computed<ActionItem[]>(() => {
  const items: ActionItem[] = [];

  // Batches in fermenting that might need gravity checks
  for (const batch of batchStore.fermentingBatches) {
    const recipeName = recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown';
    const lastReading = batch.fermenting?.readings?.length
      ? batch.fermenting.readings[batch.fermenting.readings.length - 1]
      : null;

    if (!lastReading) {
      items.push({
        id: `ferm-check-${batch._id}`,
        title: `Take gravity reading: ${recipeName}`,
        description: 'No fermentation readings recorded yet',
        priority: 'high',
        icon: 'i-lucide-thermometer',
        category: 'Fermentation',
        link: `/admin/batch/${batch._id}`,
      });
    } else {
      const daysSinceReading = Math.floor(
        (Date.now() - new Date(lastReading.date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceReading >= 2) {
        items.push({
          id: `ferm-overdue-${batch._id}`,
          title: `Gravity reading overdue: ${recipeName}`,
          description: `Last reading was ${daysSinceReading} days ago`,
          priority: daysSinceReading >= 5 ? 'high' : 'medium',
          icon: 'i-lucide-alert-triangle',
          category: 'Fermentation',
          link: `/admin/batch/${batch._id}`,
        });
      }
    }
  }

  // Upcoming batches that need to be started
  for (const batch of batchStore.upcomingBatches) {
    const recipeName = recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown';
    items.push({
      id: `start-${batch._id}`,
      title: `Start brewing: ${recipeName}`,
      description: `${batch.batchSize} ${batch.batchSizeUnit} batch ready to begin`,
      priority: 'medium',
      icon: 'i-lucide-play',
      category: 'Production',
      link: '/admin/dashboard',
    });
  }

  // Low inventory items that need reordering
  const latestInventoryByItem = new Map<string, number>();
  const sortedInventories = [...inventoryStore.inventories]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const inv of sortedInventories) {
    if (!latestInventoryByItem.has(inv.item)) {
      latestInventoryByItem.set(inv.item, inv.quantity);
    }
  }
  // PLACEHOLDER: Replace threshold with per-item configurable values
  const REORDER_THRESHOLD = 5;
  for (const [itemId, quantity] of latestInventoryByItem) {
    if (quantity <= REORDER_THRESHOLD) {
      const item = itemStore.getItemById(itemId);
      if (item) {
        items.push({
          id: `reorder-${itemId}`,
          title: `Reorder: ${item.name}`,
          description: `Only ${quantity} ${item.inventoryUnit || 'units'} remaining`,
          priority: quantity <= 1 ? 'high' : 'medium',
          icon: 'i-lucide-shopping-cart',
          category: 'Inventory',
          link: '/admin/items',
        });
      }
    }
  }

  // PLACEHOLDER: Replace with real event/deadline data
  items.push({
    id: 'placeholder-event-1',
    title: 'Review tasting room schedule',
    description: 'Ensure weekend staffing is confirmed',
    priority: 'low',
    icon: 'i-lucide-calendar',
    category: 'Events',
    // PLACEHOLDER: Replace with real events page link
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return items;
});

const priorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'border-l-red-500 bg-red-500/5';
    case 'medium': return 'border-l-amber bg-amber/5';
    case 'low': return 'border-l-blue-400 bg-blue-500/5';
    default: return 'border-l-parchment/20 bg-brown/5';
  }
};

const priorityBadge = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500/15 text-red-400 border-red-500/20';
    case 'medium': return 'bg-amber/15 text-amber border-amber/20';
    case 'low': return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
    default: return 'bg-brown/15 text-parchment/40 border-brown/20';
  }
};

const priorityIconColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-amber';
    case 'low': return 'text-blue-400';
    default: return 'text-parchment/40';
  }
};
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Action Items</h2>
        <span
          v-if="actionItems.filter((a) => a.priority === 'high').length > 0"
          class="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold"
        >
          {{ actionItems.filter((a) => a.priority === 'high').length }}
        </span>
      </div>
    </div>

    <!-- Priority summary -->
    <div class="flex gap-2 mb-4">
      <div class="flex items-center gap-1.5 text-xs bg-brown/15 rounded-lg px-2.5 py-1 border border-brown/20">
        <span class="text-parchment/40">Total:</span>
        <span class="font-medium text-parchment">{{ actionItems.length }}</span>
      </div>
      <div
        v-if="actionItems.filter((a) => a.priority === 'high').length > 0"
        class="flex items-center gap-1.5 text-xs bg-red-500/10 rounded-lg px-2.5 py-1 border border-red-500/20"
      >
        <div class="w-1.5 h-1.5 rounded-full bg-red-500" />
        <span class="text-red-400">{{ actionItems.filter((a) => a.priority === 'high').length }} urgent</span>
      </div>
    </div>

    <div v-if="actionItems.length === 0" class="py-8 text-center">
      <UIcon name="i-lucide-check-circle-2" class="text-3xl text-green-400/40 mb-2" />
      <p class="text-sm text-parchment/30">All caught up!</p>
    </div>

    <div v-else class="flex flex-col gap-2 max-h-80 overflow-y-auto">
      <NuxtLink
        v-for="item in actionItems.slice(0, 12)"
        :key="item.id"
        :to="item.link || '#'"
        :class="[
          'flex items-start gap-3 rounded-lg border-l-[3px] border border-brown/15 px-3 py-3 transition-all duration-200 hover:border-brown/30 group',
          priorityColor(item.priority),
        ]"
      >
        <UIcon
          :name="item.icon"
          :class="['text-lg shrink-0 mt-0.5', priorityIconColor(item.priority)]"
        />
        <div class="flex-grow min-w-0">
          <div class="flex items-start justify-between gap-2">
            <span class="text-sm text-parchment group-hover:text-gold transition-colors duration-200 leading-tight">
              {{ item.title }}
            </span>
            <span
              :class="[
                'text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border shrink-0',
                priorityBadge(item.priority),
              ]"
            >
              {{ item.priority }}
            </span>
          </div>
          <div class="text-xs text-parchment/40 mt-0.5">{{ item.description }}</div>
          <div class="text-[10px] uppercase tracking-wider text-parchment/20 mt-1">{{ item.category }}</div>
        </div>
      </NuxtLink>

      <div
        v-if="actionItems.length > 12"
        class="text-xs text-parchment/30 text-center py-1"
      >
        +{{ actionItems.length - 12 }} more items
      </div>
    </div>
  </div>
</template>

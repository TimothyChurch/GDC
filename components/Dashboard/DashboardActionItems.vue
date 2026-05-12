<script setup lang="ts">
const props = withDefaults(defineProps<{
  prominent?: boolean
  maxItems?: number
}>(), {
  prominent: false,
  maxItems: 12,
})

const { items: actionItems } = useAttentionFeed();

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
    default: return 'bg-brown/15 text-parchment/60 border-brown/20';
  }
};

const priorityIconColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-amber';
    case 'low': return 'text-blue-400';
    default: return 'text-parchment/60';
  }
};
</script>

<template>
  <div
    :class="[
      'bg-charcoal rounded-xl border border-brown/30',
      prominent ? 'p-6' : 'p-5',
    ]"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <UIcon
          v-if="prominent"
          name="i-lucide-bell-ring"
          class="text-xl text-gold"
        />
        <h2
          :class="[
            'font-bold text-parchment font-[Cormorant_Garamond]',
            prominent ? 'text-xl md:text-2xl' : 'text-lg',
          ]"
        >
          {{ prominent ? 'Needs your attention' : 'Action Items' }}
        </h2>
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
        <span class="text-parchment/60">Total:</span>
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
      <p class="text-sm text-parchment/50">All caught up!</p>
    </div>

    <div
      v-else
      :class="[
        'flex flex-col gap-2 overflow-y-auto',
        prominent ? 'max-h-[32rem]' : 'max-h-80',
      ]"
    >
      <NuxtLink
        v-for="item in actionItems.slice(0, maxItems)"
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
          <div class="text-xs text-parchment/60 mt-0.5">{{ item.description }}</div>
          <div class="text-[10px] uppercase tracking-wider text-parchment/20 mt-1">{{ item.category }}</div>
        </div>
      </NuxtLink>

      <div
        v-if="actionItems.length > maxItems"
        class="text-xs text-parchment/50 text-center py-1"
      >
        +{{ actionItems.length - maxItems }} more items
      </div>
    </div>
  </div>
</template>

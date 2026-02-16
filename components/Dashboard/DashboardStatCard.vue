<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  color?: 'gold' | 'copper' | 'amber' | 'green' | 'red';
  to?: string;
}>();

const colorClasses = {
  gold: 'bg-gold/10 text-gold border-gold/20',
  copper: 'bg-copper/10 text-copper border-copper/20',
  amber: 'bg-amber/10 text-amber border-amber/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const iconColorClasses = {
  gold: 'text-gold',
  copper: 'text-copper',
  amber: 'text-amber',
  green: 'text-green-400',
  red: 'text-red-400',
};
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="bg-charcoal rounded-xl border border-brown/30 p-5 flex items-start gap-4 hover:border-gold/50 transition-all duration-200 cursor-pointer group"
  >
    <div
      :class="[
        'shrink-0 w-11 h-11 rounded-lg flex items-center justify-center border transition-colors duration-200',
        colorClasses[color || 'gold'],
      ]"
    >
      <UIcon :name="icon" class="text-xl" />
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-xs font-medium uppercase tracking-wider text-parchment/60 group-hover:text-parchment/80 transition-colors duration-200">
        {{ title }}
      </span>
      <span class="text-2xl font-bold text-parchment mt-0.5 font-[Cormorant_Garamond]">
        {{ value }}
      </span>
      <div v-if="subtitle || trend" class="flex items-center gap-2 mt-1">
        <span v-if="trend" :class="[
          'text-xs font-medium flex items-center gap-0.5',
          trendUp ? 'text-green-400' : 'text-red-400',
        ]">
          <UIcon :name="trendUp ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="text-sm" />
          {{ trend }}
        </span>
        <span v-if="subtitle" class="text-xs text-parchment/60">
          {{ subtitle }}
        </span>
      </div>
    </div>
    <UIcon name="i-lucide-chevron-right" class="text-parchment/0 group-hover:text-parchment/40 transition-all duration-200 ml-auto shrink-0 self-center" />
  </NuxtLink>
  <div
    v-else
    class="bg-charcoal rounded-xl border border-brown/30 p-5 flex items-start gap-4 hover:border-brown/50 transition-all duration-200"
  >
    <div
      :class="[
        'shrink-0 w-11 h-11 rounded-lg flex items-center justify-center border',
        colorClasses[color || 'gold'],
      ]"
    >
      <UIcon :name="icon" class="text-xl" />
    </div>
    <div class="flex flex-col min-w-0">
      <span class="text-xs font-medium uppercase tracking-wider text-parchment/60">
        {{ title }}
      </span>
      <span class="text-2xl font-bold text-parchment mt-0.5 font-[Cormorant_Garamond]">
        {{ value }}
      </span>
      <div v-if="subtitle || trend" class="flex items-center gap-2 mt-1">
        <span v-if="trend" :class="[
          'text-xs font-medium flex items-center gap-0.5',
          trendUp ? 'text-green-400' : 'text-red-400',
        ]">
          <UIcon :name="trendUp ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="text-sm" />
          {{ trend }}
        </span>
        <span v-if="subtitle" class="text-xs text-parchment/60">
          {{ subtitle }}
        </span>
      </div>
    </div>
  </div>
</template>

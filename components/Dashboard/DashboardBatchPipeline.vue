<script setup lang="ts">
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

interface PipelineStage {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  batches: any[];
}

const stages = computed<PipelineStage[]>(() => [
  {
    name: 'Upcoming',
    icon: 'i-lucide-calendar-clock',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    dotColor: 'bg-blue-400',
    batches: batchStore.upcomingBatches,
  },
  {
    name: 'Brewing',
    icon: 'i-lucide-flame',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    dotColor: 'bg-orange-400',
    batches: batchStore.brewingBatches,
  },
  {
    name: 'Fermenting',
    icon: 'i-lucide-beaker',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    dotColor: 'bg-yellow-400',
    batches: batchStore.fermentingBatches,
  },
  {
    name: 'Distilling',
    icon: 'i-lucide-flask-conical',
    color: 'text-copper',
    bgColor: 'bg-copper/10',
    borderColor: 'border-copper/30',
    dotColor: 'bg-copper',
    batches: batchStore.distillingBatches,
  },
  {
    name: 'Storage',
    icon: 'i-lucide-warehouse',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    dotColor: 'bg-purple-400',
    batches: batchStore.storedBatches,
  },
  {
    name: 'Barreled',
    icon: 'i-lucide-cylinder',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
    borderColor: 'border-amber/30',
    dotColor: 'bg-amber',
    batches: batchStore.barreledBatches,
  },
]);

const totalActiveBatches = computed(() =>
  stages.value.reduce((sum, stage) => sum + stage.batches.length, 0)
);

const getRecipeName = (recipeId: string) => {
  return recipeStore.getRecipeById(recipeId)?.name || 'Unknown';
};
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Batch Pipeline</h2>
        <p class="text-xs text-parchment/40 mt-0.5">
          {{ totalActiveBatches }} active {{ totalActiveBatches === 1 ? 'batch' : 'batches' }} across all stages
        </p>
      </div>
      <NuxtLink
        to="/admin/batch"
        class="text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      >
        View All
        <UIcon name="i-lucide-arrow-right" class="text-sm" />
      </NuxtLink>
    </div>

    <!-- Pipeline stages -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      <div
        v-for="stage in stages"
        :key="stage.name"
        :class="[
          'rounded-lg border p-4 transition-all duration-200 hover:scale-[1.02]',
          stage.batches.length > 0
            ? `${stage.bgColor} ${stage.borderColor}`
            : 'bg-brown/10 border-brown/20',
        ]"
      >
        <!-- Stage header -->
        <div class="flex items-center gap-2 mb-3">
          <UIcon
            :name="stage.icon"
            :class="[
              'text-lg',
              stage.batches.length > 0 ? stage.color : 'text-parchment/30',
            ]"
          />
          <span class="text-xs font-semibold uppercase tracking-wider text-parchment/50">
            {{ stage.name }}
          </span>
        </div>

        <!-- Count -->
        <div
          :class="[
            'text-3xl font-bold font-[Cormorant_Garamond] mb-2',
            stage.batches.length > 0 ? 'text-parchment' : 'text-parchment/20',
          ]"
        >
          {{ stage.batches.length }}
        </div>

        <!-- Batch previews -->
        <div v-if="stage.batches.length > 0" class="flex flex-col gap-1.5">
          <div
            v-for="batch in stage.batches.slice(0, 3)"
            :key="batch._id"
            class="flex items-center gap-1.5"
          >
            <div :class="['w-1.5 h-1.5 rounded-full shrink-0', stage.dotColor]" />
            <span class="text-xs text-parchment/60 truncate">
              {{ getRecipeName(batch.recipe) }}
            </span>
          </div>
          <span
            v-if="stage.batches.length > 3"
            class="text-[10px] text-parchment/30 pl-3"
          >
            +{{ stage.batches.length - 3 }} more
          </span>
        </div>
        <div v-else class="text-xs text-parchment/20">
          No batches
        </div>
      </div>
    </div>
  </div>
</template>

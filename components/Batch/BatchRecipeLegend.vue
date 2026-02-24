<script setup lang="ts">
import { buildBatchLegend } from '~/composables/useRecipeColors'
import type { Batch } from '~/types'

const props = defineProps<{
  batches?: Batch[]
}>()

const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

const collapsed = ref(false)

const source = computed(() => props.batches ?? batchStore.activeBatches)

const legend = computed(() =>
  buildBatchLegend(source.value, (id) => recipeStore.getRecipeById(id)?.name || 'Unknown')
)

const show = computed(() => legend.value.length >= 2)
</script>

<template>
  <div v-if="show" class="mb-3">
    <button
      class="flex items-center gap-1 text-[10px] uppercase tracking-wider text-parchment/40 hover:text-parchment/60 transition-colors"
      @click="collapsed = !collapsed"
    >
      <UIcon :name="collapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'" class="text-xs" />
      Batch Colors
    </button>
    <div v-if="!collapsed" class="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
      <div
        v-for="entry in legend"
        :key="entry.batchId"
        class="flex items-center gap-1.5"
      >
        <div :class="['w-2.5 h-2.5 rounded-sm shrink-0', entry.color.dot]" />
        <span class="text-[11px] text-parchment/60">{{ entry.name }}</span>
      </div>
    </div>
  </div>
</template>

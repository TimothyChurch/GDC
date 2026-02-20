<script setup lang="ts">
import type { Bottle } from '~/types'

const props = defineProps<{ bottle: Bottle }>()
const router = useRouter()

const classIcon = computed(() => {
  const cls = props.bottle.class?.toLowerCase() || ''
  if (cls.includes('whisky') || cls.includes('whiskey') || cls.includes('bourbon')) return 'i-lucide-glass-water'
  if (cls.includes('gin')) return 'i-lucide-flower-2'
  if (cls.includes('rum')) return 'i-lucide-waves'
  if (cls.includes('vodka')) return 'i-lucide-droplets'
  if (cls.includes('brandy')) return 'i-lucide-grape'
  if (cls.includes('liqueur') || cls.includes('cordial')) return 'i-lucide-candy'
  return 'i-lucide-wine'
})
</script>

<template>
  <div
    class="bg-charcoal rounded-xl border border-brown/30 p-4 hover:border-brown/50 transition-colors cursor-pointer"
    @click="router.push(`/admin/bottles/${bottle._id}`)"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <UIcon :name="classIcon" class="text-lg text-copper" />
        <div>
          <div class="text-sm font-medium text-parchment">{{ bottle.name }}</div>
          <div class="text-xs text-parchment/60">{{ bottle.class }} {{ bottle.type ? `/ ${bottle.type}` : '' }}</div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 mb-2">
      <span
        v-if="bottle.abv"
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/15 text-blue-400 border-blue-500/25"
      >
        {{ bottle.abv }}% ABV
      </span>
      <span
        v-if="bottle.price"
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/20 text-parchment/60 border-brown/30"
      >
        {{ Dollar.format(bottle.price) }}
      </span>
    </div>

    <div class="flex items-center justify-end gap-1.5">
      <span
        v-if="bottle.archived"
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
      >
        Archived
      </span>
      <span
        class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
        :class="bottle.inStock !== false
          ? 'bg-green-500/15 text-green-400 border-green-500/25'
          : 'bg-red-500/15 text-red-400 border-red-500/25'"
      >
        {{ bottle.inStock !== false ? 'In Stock' : 'Out of Stock' }}
      </span>
    </div>
  </div>
</template>

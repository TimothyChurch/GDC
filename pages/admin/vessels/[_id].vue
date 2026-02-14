<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const vesselStore = useVesselStore()
const batchStore = useBatchStore()
const recipeStore = useRecipeStore()

const vessel = computed(() => vesselStore.getVesselById(route.params._id as string))

// Panel slide-over for editing
import { PanelVessel } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelVessel)

const editVessel = () => {
  if (!vessel.value) return
  vesselStore.vessel = { ...vessel.value }
  panel.open()
}

const typeIcon = computed(() => {
  switch (vessel.value?.type) {
    case 'Mash Tun': return 'i-lucide-flame'
    case 'Fermenter': return 'i-lucide-beaker'
    case 'Still': return 'i-lucide-flask-conical'
    case 'Tank': return 'i-lucide-cylinder'
    case 'Barrel': return 'i-lucide-cylinder'
    default: return 'i-lucide-container'
  }
})

const fillPercent = computed(() => {
  const max = vessel.value?.stats?.volume
  const current = vessel.value?.current?.volume
  if (!max || !current) return 0
  return Math.min(100, (current / max) * 100)
})

const fillColor = computed(() => {
  if (fillPercent.value === 0) return 'bg-brown/20'
  if (fillPercent.value < 30) return 'bg-blue-500/60'
  if (fillPercent.value < 70) return 'bg-copper/60'
  return 'bg-gold/60'
})

const resolvedContents = computed(() => {
  if (!vessel.value?.contents?.length) return []
  return vessel.value.contents.map(c => {
    const batch = batchStore.getBatchById(c.batch)
    const recipe = batch?.recipe ? recipeStore.getRecipeById(batch.recipe) : null
    return {
      batch: c.batch,
      batchName: recipe?.name || 'Unknown',
      batchStatus: batch?.status || 'Unknown',
      volume: c.volume,
      volumeUnit: c.volumeUnit,
      abv: c.abv,
      value: c.value,
    }
  })
})

const agingDuration = computed(() => {
  if (vessel.value?.type !== 'Barrel' || !vessel.value?.createdAt) return null
  const filled = new Date(vessel.value.createdAt)
  const now = new Date()
  const days = Math.floor((now.getTime() - filled.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 30) return `${days} days`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return `${years} year${years > 1 ? 's' : ''}${rem ? `, ${rem} mo` : ''}`
})

const handleEmpty = () => {
  if (!vessel.value) return
  vesselStore.emptyVessel(vessel.value._id)
}
</script>

<template>
  <div v-if="vessel" class="space-y-6">
    <AdminPageHeader
      :title="vessel.name"
      :subtitle="vessel.type"
      :icon="typeIcon"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/vessels')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editVessel"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Vessel Info -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Vessel Info</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Type</div>
          <div class="text-sm text-parchment">{{ vessel.type }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Capacity</div>
          <div class="text-sm text-parchment">
            {{ vessel.stats?.volume || 'N/A' }}{{ vessel.stats?.volumeUnit ? ` ${vessel.stats.volumeUnit}` : '' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Weight</div>
          <div class="text-sm text-parchment">
            {{ vessel.stats?.weight || 'N/A' }}{{ vessel.stats?.weightUnit ? ` ${vessel.stats.weightUnit}` : '' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Location</div>
          <div class="text-sm text-parchment">{{ vessel.location || 'N/A' }}</div>
        </div>
      </div>
    </div>

    <!-- Barrel Details (only for barrels) -->
    <div v-if="vessel.type === 'Barrel'" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Barrel Details</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Size</div>
          <div class="text-sm text-parchment">{{ vessel.barrel?.size || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Char Level</div>
          <div class="text-sm text-parchment">{{ vessel.barrel?.char || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Cost</div>
          <div class="text-sm text-parchment">{{ vessel.barrel?.cost ? Dollar.format(vessel.barrel.cost) : 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Aging Duration</div>
          <div class="text-sm text-parchment">{{ agingDuration || 'N/A' }}</div>
        </div>
      </div>
    </div>

    <!-- Fill Level -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Current Status</h3>
        <UButton
          v-if="vessel.current?.volume && vessel.current.volume > 0"
          icon="i-lucide-droplets"
          variant="outline"
          color="neutral"
          size="xs"
          @click="handleEmpty"
        >
          Empty
        </UButton>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Volume</div>
          <div class="text-sm text-parchment font-semibold">
            {{ vessel.current?.volume || 0 }}{{ vessel.current?.volumeUnit ? ` ${vessel.current.volumeUnit}` : '' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">ABV</div>
          <div class="text-sm text-parchment font-semibold">
            {{ vessel.current?.abv ? `${vessel.current.abv.toFixed(1)}%` : 'N/A' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Value</div>
          <div class="text-sm text-parchment font-semibold">
            {{ vessel.current?.value ? Dollar.format(vessel.current.value) : 'N/A' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Fill</div>
          <div class="text-sm text-parchment font-semibold">{{ fillPercent.toFixed(0) }}%</div>
        </div>
      </div>
      <!-- Fill bar -->
      <div class="w-full h-3 rounded-full bg-brown/20 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="fillColor"
          :style="{ width: `${fillPercent}%` }"
        />
      </div>
    </div>

    <!-- Contents -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Contents</h3>
      <div v-if="resolvedContents.length > 0" class="divide-y divide-brown/20">
        <div class="hidden sm:grid grid-cols-5 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider">
          <span>Batch / Recipe</span>
          <span>Status</span>
          <span>Volume</span>
          <span>ABV</span>
          <span class="text-right">Value</span>
        </div>
        <NuxtLink
          v-for="(content, i) in resolvedContents"
          :key="i"
          :to="`/admin/batch/${content.batch}`"
          class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 py-3 hover:bg-brown/10 -mx-2 px-2 rounded transition-colors"
        >
          <div>
            <span class="text-sm text-parchment">{{ content.batchName }}</span>
          </div>
          <div class="sm:block">
            <span class="text-sm text-parchment/60">{{ content.batchStatus }}</span>
          </div>
          <div>
            <span class="text-sm text-parchment/60">{{ content.volume }} {{ content.volumeUnit }}</span>
          </div>
          <div>
            <span class="text-sm text-parchment/60">{{ content.abv }}%</span>
          </div>
          <div class="text-right">
            <span class="text-sm text-parchment">{{ Dollar.format(content.value) }}</span>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-droplets" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">Vessel is empty</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Vessel not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/vessels')"
    >
      Back to Vessels
    </UButton>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const productionStore = useProductionStore()
const bottleStore = useBottleStore()
const vesselStore = useVesselStore()
const itemStore = useItemStore()

const production = computed(() =>
  productionStore.productions.find(p => p._id === route.params._id)
)

const bottleName = computed(() => {
  if (!production.value?.bottle) return 'Unknown'
  return bottleStore.getName(production.value.bottle) || 'Unknown'
})

const formattedDate = computed(() => {
  if (!production.value?.date) return ''
  return new Date(production.value.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

const resolvedVessels = computed(() => {
  if (!production.value?.vessel) return []
  return production.value.vessel
    .map(id => vesselStore.getVesselById(id))
    .filter(Boolean)
})

const totalCost = computed(() => {
  if (!production.value) return 0
  return (production.value.productionCost || 0) + (production.value.bottleCost || 0)
})

const costPerBottle = computed(() => {
  if (!production.value?.quantity || production.value.quantity === 0) return 0
  return totalCost.value / production.value.quantity
})

const resolveItemName = (id?: string) => {
  if (!id) return 'N/A'
  const item = itemStore.getItemById(id)
  return item?.name || id
}

// Panel slide-over for editing
import { PanelProduction } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelProduction)

const editProduction = () => {
  if (!production.value) return
  productionStore.production = production.value
  panel.open()
}
</script>

<template>
  <div v-if="production" class="space-y-6">
    <AdminPageHeader
      :title="bottleName"
      :subtitle="formattedDate"
      icon="i-lucide-factory"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/production')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editProduction"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Production Info -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Production Info</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div>
          <div class="text-sm text-parchment">{{ formattedDate }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle</div>
          <NuxtLink
            v-if="production.bottle"
            :to="`/admin/bottles/${production.bottle}`"
            class="text-sm text-gold hover:text-copper transition-colors"
          >
            {{ bottleName }}
          </NuxtLink>
          <div v-else class="text-sm text-parchment/60">N/A</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Quantity</div>
          <div class="text-sm text-parchment">{{ production.quantity }}</div>
        </div>
        <div v-if="production.bottling?.glassware">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Glassware</div>
          <NuxtLink
            :to="`/admin/items/${production.bottling.glassware}`"
            class="text-sm text-gold hover:text-copper transition-colors"
          >
            {{ resolveItemName(production.bottling.glassware) }}
          </NuxtLink>
        </div>
        <div v-if="production.bottling?.cap">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Cap</div>
          <NuxtLink
            :to="`/admin/items/${production.bottling.cap}`"
            class="text-sm text-gold hover:text-copper transition-colors"
          >
            {{ resolveItemName(production.bottling.cap) }}
          </NuxtLink>
        </div>
        <div v-if="production.bottling?.label">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Label</div>
          <NuxtLink
            :to="`/admin/items/${production.bottling.label}`"
            class="text-sm text-gold hover:text-copper transition-colors"
          >
            {{ resolveItemName(production.bottling.label) }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Source Vessels -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Source Vessels</h3>
      <div v-if="resolvedVessels.length > 0" class="divide-y divide-brown/20">
        <div
          v-for="vessel in resolvedVessels"
          :key="vessel!._id"
          class="flex items-center justify-between py-2 text-sm"
        >
          <NuxtLink
            :to="`/admin/vessels/${vessel!._id}`"
            class="text-gold hover:text-copper transition-colors"
          >
            {{ vessel!.name }}
          </NuxtLink>
          <span class="text-parchment/50 text-xs">{{ vessel!.type }}</span>
        </div>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-container" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No source vessels</p>
      </div>
    </div>

    <!-- Cost Breakdown -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Cost Breakdown</h3>
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-parchment/60">Production Cost</span>
          <span class="text-parchment">{{ Dollar.format(production.productionCost || 0) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-parchment/60">Bottle Cost</span>
          <span class="text-parchment">{{ Dollar.format(production.bottleCost || 0) }}</span>
        </div>
        <div class="border-t border-brown/30 pt-2 flex justify-between text-sm font-semibold">
          <span class="text-parchment">Total</span>
          <span class="text-parchment">{{ Dollar.format(totalCost) }}</span>
        </div>
        <div v-if="production.quantity" class="flex justify-between text-sm">
          <span class="text-parchment/60">Cost per Bottle</span>
          <span class="text-copper font-medium">{{ Dollar.format(costPerBottle) }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Production not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/production')"
    >
      Back to Production
    </UButton>
  </div>
</template>

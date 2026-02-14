<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()

const cocktailStore = useCocktailStore()
const itemStore = useItemStore()

const cocktail = computed(() => cocktailStore.getCocktailById(route.params._id as string))

// Panel slide-over for editing
import { PanelCocktail } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelCocktail)

const editCocktail = () => {
  if (!cocktail.value) return
  cocktailStore.setCocktail(cocktail.value._id)
  panel.open()
}

const cost = computed(() => {
  if (!cocktail.value) return 0
  return cocktailStore.cocktailCost(cocktail.value._id)
})

const approxPrice = computed(() => {
  return estimateCocktailPrice(cost.value)
})

const margin = computed(() => {
  if (!cocktail.value?.price || cost.value === 0) return 0
  return ((cocktail.value.price - cost.value) / cocktail.value.price * 100)
})

const ingredients = computed(() => {
  if (!cocktail.value?.ingredients?.length) return []
  return cocktail.value.ingredients.map((ing) => {
    const item = itemStore.getItemById(ing.item)
    const price = latestPrice(ing.item)
    const lineCost = price * ing.amount
    return {
      name: item?.name || 'Unknown',
      amount: ing.amount,
      unit: ing.unit,
      pricePerUnit: price,
      cost: lineCost,
    }
  })
})

const menuLabel = computed(() => {
  switch (cocktail.value?.menu) {
    case 'main': return 'Main Menu'
    case 'seasonal': return 'Seasonal'
    case 'shots': return 'Shots'
    default: return 'Off Menu'
  }
})
</script>

<template>
  <div v-if="cocktail" class="space-y-6">
    <AdminPageHeader
      :title="cocktail.name"
      :subtitle="menuLabel"
      icon="i-lucide-martini"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/cocktails')"
        >
          Back
        </UButton>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          @click="editCocktail"
        >
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Cocktail Info -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Cocktail Info</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Glassware</div>
          <div class="text-sm text-parchment">{{ cocktail.glassware || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Menu</div>
          <div class="text-sm text-parchment">{{ menuLabel }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Visible</div>
          <span
            class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border"
            :class="cocktail.visible ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25'"
          >
            {{ cocktail.visible ? 'Yes' : 'No' }}
          </span>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Price</div>
          <div class="text-sm text-parchment font-semibold">{{ Dollar.format(cocktail.price || 0) }}</div>
        </div>
      </div>
    </div>

    <!-- Cost Breakdown -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Cost Analysis</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Ingredient Cost</div>
          <div class="text-sm text-parchment font-semibold">{{ Dollar.format(cost) }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Suggested Price</div>
          <div class="text-sm text-parchment/60">{{ Dollar.format(approxPrice) }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Actual Price</div>
          <div class="text-sm text-parchment font-semibold">{{ Dollar.format(cocktail.price || 0) }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Margin</div>
          <div
            class="text-sm font-semibold"
            :class="margin > 50 ? 'text-green-400' : margin > 30 ? 'text-gold' : 'text-red-400'"
          >
            {{ margin.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Ingredients -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Ingredients</h3>
      <div v-if="ingredients.length > 0" class="divide-y divide-brown/20">
        <div class="hidden sm:grid grid-cols-4 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider">
          <span>Item</span>
          <span>Amount</span>
          <span>Price/Unit</span>
          <span class="text-right">Cost</span>
        </div>
        <div
          v-for="(ing, i) in ingredients"
          :key="i"
          class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 py-2 text-sm"
        >
          <span class="text-parchment">{{ ing.name }}</span>
          <span class="text-parchment/60">{{ ing.amount }} {{ ing.unit }}</span>
          <span class="text-parchment/60 hidden sm:block">{{ Dollar.format(ing.pricePerUnit) }}</span>
          <span class="text-parchment text-right">{{ Dollar.format(ing.cost) }}</span>
        </div>
      </div>
      <div v-else class="text-center py-6">
        <UIcon name="i-lucide-package-open" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No ingredients listed</p>
      </div>
    </div>

    <!-- Description -->
    <div v-if="cocktail.description" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Description</h3>
      <p class="text-sm text-parchment/60">{{ cocktail.description }}</p>
    </div>

    <!-- Directions -->
    <div v-if="cocktail.directions" class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Directions</h3>
      <p class="text-sm text-parchment/60 whitespace-pre-wrap">{{ cocktail.directions }}</p>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Cocktail not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/cocktails')"
    >
      Back to Cocktails
    </UButton>
  </div>
</template>

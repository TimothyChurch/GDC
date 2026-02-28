<script setup lang="ts">
definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();

const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();
const productionStore = useProductionStore();

const bottle = computed(() =>
  bottleStore.getBottleById(route.params._id as string),
);
const recipe = computed(() =>
  bottle.value?.recipe
    ? recipeStore.getRecipeById(bottle.value.recipe)
    : undefined,
);

// Most recent production's cost per bottle
const bottleProductions = computed(() =>
  productionStore.getProductionsByBottle(route.params._id as string),
);
const latestBottleCost = computed(() => {
  if (bottleProductions.value.length === 0) return null;
  return bottleProductions.value[0].bottleCost;
});

// Panel slide-overs
import { LazyPanelBottle } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelBottle);

const editBottle = () => {
  if (!bottle.value) return;
  bottleStore.setBottle(bottle.value._id);
  panel.open();
};
</script>

<template>
  <div v-if="!bottleStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/30" />
  </div>

  <div v-else-if="bottle" class="space-y-6">
    <AdminPageHeader
      :title="bottle.name"
      :subtitle="`${bottle.class || ''}${bottle.type ? ' - ' + bottle.type : ''}`"
      icon="i-lucide-wine"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/bottles')"
        >
          Back
        </UButton>
        <UButton icon="i-lucide-pencil" size="sm" @click="editBottle">
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Bottle Details -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">
        Bottle Details
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Recipe</div>
          <NuxtLink
            v-if="recipe"
            :to="`/admin/recipes/${recipe._id}`"
            class="text-sm text-copper hover:text-gold transition-colors"
          >
            {{ recipe.name }}
          </NuxtLink>
          <div v-else class="text-sm text-parchment/60">N/A</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">ABV</div>
          <div class="text-sm text-parchment">{{ bottle.abv || 0 }}%</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Price</div>
          <div class="text-sm text-parchment font-semibold">{{ Dollar.format(bottle.price || 0) }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Cost / Bottle</div>
          <div v-if="latestBottleCost !== null" class="text-sm text-parchment font-semibold">
            {{ Dollar.format(latestBottleCost) }}
            <span
              v-if="bottle.price && latestBottleCost > 0"
              class="text-xs font-normal text-parchment/50 ml-1"
            >
              ({{ ((1 - latestBottleCost / bottle.price) * 100).toFixed(0) }}% margin)
            </span>
          </div>
          <div v-else class="text-sm text-parchment/50">No production data</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Status</div>
          <div class="flex items-center gap-1.5">
            <span
              v-if="bottle.archived"
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
            >
              Archived
            </span>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                bottle.inStock
                  ? 'bg-green-500/15 text-green-400 border-green-500/25'
                  : 'bg-red-500/15 text-red-400 border-red-500/25',
              ]"
            >
              {{ bottle.inStock ? "In Stock" : "Out of Stock" }}
            </span>
          </div>
        </div>
        <div v-if="bottle.description" class="col-span-2 sm:col-span-3 lg:col-span-6">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Description</div>
          <div class="text-sm text-parchment/60">{{ bottle.description }}</div>
        </div>
      </div>
    </div>

    <!-- Inventory -->
    <BottleInventorySection :bottle-id="(route.params._id as string)" />

    <!-- Production History -->
    <BottleProductionHistory :bottle-id="(route.params._id as string)" />
  </div>

  <div v-else class="text-center py-12">
    <UIcon name="i-lucide-search-x" class="text-4xl text-parchment/20 mx-auto mb-3" />
    <p class="text-parchment/60">Bottle not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/bottles')"
    >
      Back to Bottles
    </UButton>
  </div>
</template>

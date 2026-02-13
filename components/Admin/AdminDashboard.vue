<script setup lang="ts">
const batchStore = useBatchStore();
const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();
const productionStore = useProductionStore();
const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const user = useCookie("user", {
  default: () => ({ email: "", authenticated: false, data: {} }),
});

const now = ref(new Date());
onMounted(() => {
  setInterval(() => {
    now.value = new Date();
  }, 60000);
});

const greeting = computed(() => {
  const hour = now.value.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
});

// Quick stats
const totalBatches = computed(() => batchStore.batches.length);
const activeBatches = computed(() =>
  batchStore.batches.filter((b) => b.status !== 'Bottled' && b.status !== 'Upcoming').length
);
const totalBottleProducts = computed(() => bottleStore.bottles.length);
const inStockBottles = computed(() => bottleStore.bottles.filter((b) => b.inStock !== false).length);
const totalRecipes = computed(() => recipeStore.recipes.length);
const totalCocktails = computed(() => cocktailStore.cocktails.length);
const visibleCocktails = computed(() => cocktailStore.cocktails.filter((c) => c.visible).length);
const totalVessels = computed(() => vesselStore.vessels.length);

// Loading state
const isLoading = computed(() =>
  batchStore.loading || bottleStore.loading || productionStore.loading
);
</script>

<template>
  <div class="space-y-6">
    <!-- Header with greeting -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-parchment font-[Cormorant_Garamond]">
          {{ greeting }}
        </h1>
        <p class="text-sm text-parchment/40 mt-1">
          Here is an overview of your distillery operations.
        </p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/admin/batch">
          <UButton size="sm" variant="soft" class="bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20">
            <UIcon name="i-lucide-plus" class="mr-1" />
            New Batch
          </UButton>
        </NuxtLink>
        <NuxtLink to="/admin/production">
          <UButton size="sm" variant="soft" class="bg-copper/10 text-copper border border-copper/20 hover:bg-copper/20">
            <UIcon name="i-lucide-factory" class="mr-1" />
            Record Production
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-parchment/40">
        <UIcon name="i-lucide-loader-2" class="text-xl animate-spin text-gold" />
        <span class="text-sm">Loading operations data...</span>
      </div>
    </div>

    <template v-else>
      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <DashboardStatCard
          title="Total Batches"
          :value="totalBatches"
          :subtitle="`${activeBatches} active`"
          icon="i-lucide-flask-conical"
          color="gold"
        />
        <DashboardStatCard
          title="Bottle Products"
          :value="totalBottleProducts"
          :subtitle="`${inStockBottles} in stock`"
          icon="i-lucide-wine"
          color="copper"
        />
        <DashboardStatCard
          title="Recipes"
          :value="totalRecipes"
          icon="i-lucide-book-open"
          color="amber"
        />
        <DashboardStatCard
          title="Cocktails"
          :value="totalCocktails"
          :subtitle="`${visibleCocktails} on menu`"
          icon="i-lucide-martini"
          color="copper"
        />
      </div>

      <!-- Batch Pipeline -->
      <DashboardBatchPipeline />

      <!-- Main content grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Left column (2/3) -->
        <div class="xl:col-span-2 space-y-6">
          <!-- Action Items + Recent Productions row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardActionItems />
            <DashboardRecentProductions />
          </div>

          <!-- Vessel Overview -->
          <DashboardVesselOverview />
        </div>

        <!-- Right column (1/3) -->
        <div class="space-y-6">
          <DashboardLowInventory />
          <DashboardRevenue />
        </div>
      </div>

      <!-- Operational Pipeline (existing dashboard components for active management) -->
      <div class="border-t border-brown/20 pt-6">
        <h2 class="text-xl font-bold text-parchment font-[Cormorant_Garamond] mb-4">
          Active Pipeline Management
        </h2>
        <p class="text-xs text-parchment/40 mb-4">
          Manage active batches through each stage of the production process.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
            <DashboardUpcoming />
          </div>
          <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
            <DashboardBrewing />
          </div>
          <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
            <DashboardFermenters />
          </div>
          <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
            <DashboardDistilling />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

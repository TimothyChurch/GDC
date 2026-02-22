<script setup lang="ts">
import {
  STAGE_DISPLAY,
  stageTextColor,
  stageBgColor,
} from "~/composables/batchPipeline";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();

const recipeStore = useRecipeStore();
const itemStore = useItemStore();
const batchStore = useBatchStore();

const stageDisplay = (name: string) =>
  STAGE_DISPLAY[name] || { icon: "i-lucide-circle", color: "neutral" };

const recipe = computed(() =>
  recipeStore.getRecipeById(route.params._id as string),
);

// Panel slide-over for editing
import { LazyPanelRecipe } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelRecipe);

const editRecipe = () => {
  if (!recipe.value) return;
  recipeStore.setRecipe(recipe.value._id);
  panel.open();
};

const totalCost = computed(() => {
  if (!recipe.value) return 0;
  return recipePrice(recipe.value);
});

const ingredients = computed(() => {
  if (!recipe.value?.items) return [];
  return recipe.value.items.map((ing) => {
    const item = itemStore.getItemById(ing._id);
    const price = latestPrice(ing._id);
    const cost = price * ing.amount;
    return {
      id: ing._id,
      name: item?.name || "Unknown",
      amount: ing.amount,
      unit: ing.unit,
      pricePerUnit: price,
      cost,
    };
  });
});

const relatedBatches = computed(() =>
  batchStore.batches.filter((b) => b.recipe === route.params._id),
);
</script>

<template>
  <div v-if="!recipeStore.loaded" class="flex items-center justify-center py-12">
    <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-parchment/30" />
  </div>

  <div v-else-if="recipe" class="space-y-6">
    <AdminPageHeader
      :title="recipe.name"
      :subtitle="`${recipe.class}${recipe.type ? ' - ' + recipe.type : ''}`"
      icon="i-lucide-book-open"
    >
      <template #actions>
        <UButton
          icon="i-lucide-arrow-left"
          variant="outline"
          color="neutral"
          size="sm"
          @click="router.push('/admin/recipes')"
        >
          Back
        </UButton>
        <UButton icon="i-lucide-pencil" size="sm" @click="editRecipe">
          Edit
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Recipe Info -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3
        class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"
      >
        Recipe Info
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Class
          </div>
          <div class="text-sm text-parchment">{{ recipe.class }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Type
          </div>
          <div class="text-sm text-parchment">{{ recipe.type || "N/A" }}</div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Volume
          </div>
          <div class="text-sm text-parchment">
            {{ recipe.volume }} {{ recipe.volumeUnit }}
          </div>
        </div>
        <div>
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">
            Total Cost
          </div>
          <div class="text-sm text-parchment font-semibold">
            {{ Dollar.format(totalCost) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pipeline -->
    <div
      v-if="recipe.pipeline?.length"
      class="bg-charcoal rounded-xl border border-brown/30 p-5"
    >
      <h3
        class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"
      >
        Production Pipeline
        <span
          v-if="recipe.pipelineTemplate"
          class="text-sm font-normal text-parchment/50 ml-2"
        >
          ({{ recipe.pipelineTemplate }})
        </span>
      </h3>
      <div class="flex items-center flex-wrap gap-1">
        <div
          v-for="(stage, index) in recipe.pipeline"
          :key="stage"
          class="flex items-center"
        >
          <div
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
            :class="stageBgColor(stageDisplay(stage).color)"
          >
            <UIcon
              :name="stageDisplay(stage).icon"
              :class="stageTextColor(stageDisplay(stage).color)"
            />
            <span class="text-sm text-parchment">{{ stage }}</span>
          </div>
          <UIcon
            v-if="index < recipe.pipeline.length - 1"
            name="i-lucide-chevron-right"
            class="text-parchment/30 mx-1 shrink-0"
          />
        </div>
      </div>
    </div>

    <!-- Ingredients -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3
        class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"
      >
        Ingredients
      </h3>
      <div v-if="ingredients.length > 0" class="divide-y divide-brown/20">
        <div
          class="grid grid-cols-4 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider"
        >
          <span>Item</span>
          <span>Amount</span>
          <span>Price/Unit</span>
          <span class="text-right">Cost</span>
        </div>
        <div
          v-for="(ing, i) in ingredients"
          :key="i"
          class="grid grid-cols-4 gap-4 py-2 text-sm"
        >
          <NuxtLink
            :to="`/admin/items/${ing.id}`"
            class="text-gold hover:text-copper transition-colors"
          >
            {{ ing.name }}
          </NuxtLink>
          <span class="text-parchment/60">{{ ing.amount }} {{ ing.unit }}</span>
          <span class="text-parchment/60">{{
            Dollar.format(ing.pricePerUnit)
          }}</span>
          <span class="text-parchment text-right">{{
            Dollar.format(ing.cost)
          }}</span>
        </div>
      </div>
      <div v-else class="text-center py-6">
        <UIcon
          name="i-lucide-package-open"
          class="text-2xl text-parchment/20 mx-auto mb-2"
        />
        <p class="text-sm text-parchment/50">No ingredients listed</p>
      </div>
    </div>

    <!-- Directions -->
    <div
      v-if="recipe.directions"
      class="bg-charcoal rounded-xl border border-brown/30 p-5"
    >
      <h3
        class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"
      >
        Directions
      </h3>
      <p class="text-sm text-parchment/60 whitespace-pre-wrap">
        {{ recipe.directions }}
      </p>
    </div>

    <!-- Related Batches -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <h3
        class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"
      >
        Related Batches
      </h3>
      <div
        v-if="relatedBatches.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <NuxtLink
          v-for="b in relatedBatches"
          :key="b._id"
          :to="`/admin/batch/${b._id}`"
          class="hover:scale-[1.02] transition-transform"
        >
          <DashboardBatchCard :batch-id="b._id" />
        </NuxtLink>
      </div>
      <div v-else class="text-center py-6">
        <UIcon
          name="i-lucide-flask-conical"
          class="text-2xl text-parchment/20 mx-auto mb-2"
        />
        <p class="text-sm text-parchment/50">No batches use this recipe</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <UIcon
      name="i-lucide-search-x"
      class="text-4xl text-parchment/20 mx-auto mb-3"
    />
    <p class="text-parchment/60">Recipe not found</p>
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      class="mt-3"
      @click="router.push('/admin/recipes')"
    >
      Back to Recipes
    </UButton>
  </div>
</template>

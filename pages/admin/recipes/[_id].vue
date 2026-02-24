<script setup lang="ts">
import {
  STAGE_DISPLAY,
  stageTextColor,
  stageBgColor,
} from "~/composables/batchPipeline";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();

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

const { ingredientCost } = useUnitConversion();

// --- Inline ingredient editing ---
// Local editable copy of ingredients, synced from the recipe
const editableIngredients = ref<{ _id: string; amount: number; unit: string }[]>([]);

// Initialize / sync when recipe changes
watch(
  () => recipe.value?.items,
  (items) => {
    if (items) {
      editableIngredients.value = items.map((ing) => ({ ...ing }));
    }
  },
  { immediate: true, deep: true },
);

// Track whether the user has unsaved ingredient changes
const ingredientsDirty = computed(() => {
  if (!recipe.value?.items) return false;
  const original = recipe.value.items;
  const edited = editableIngredients.value;
  if (original.length !== edited.length) return true;
  return original.some((orig, i) => {
    const ed = edited[i];
    return (
      orig._id !== ed._id ||
      orig.amount !== ed.amount ||
      orig.unit !== ed.unit
    );
  });
});

const savingIngredients = ref(false);

const saveIngredients = async () => {
  if (!recipe.value || !ingredientsDirty.value) return;
  savingIngredients.value = true;
  try {
    recipeStore.setRecipe(recipe.value._id);
    recipeStore.recipe.items = editableIngredients.value.map((ing) => ({
      _id: ing._id,
      amount: ing.amount,
      unit: ing.unit,
    }));
    await recipeStore.updateRecipe();
    toast.add({
      title: "Ingredients updated",
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } finally {
    savingIngredients.value = false;
  }
};

const resetIngredients = () => {
  if (recipe.value?.items) {
    editableIngredients.value = recipe.value.items.map((ing) => ({ ...ing }));
  }
};

const removeIngredient = (index: number) => {
  editableIngredients.value.splice(index, 1);
};

// Add ingredient row
const newIngredient = ref({
  _id: "" as string,
  amount: null as number | null,
  unit: "" as string,
});

const addIngredient = () => {
  if (!newIngredient.value._id || !newIngredient.value.amount || !newIngredient.value.unit) return;
  editableIngredients.value.push({
    _id: newIngredient.value._id,
    amount: newIngredient.value.amount,
    unit: newIngredient.value.unit,
  });
  newIngredient.value = { _id: "", amount: null, unit: "" };
};

// Computed display data enriched from editable state
const ingredients = computed(() => {
  return editableIngredients.value.map((ing) => {
    const item = itemStore.getItemById(ing._id);
    const price = latestPrice(ing._id);
    const cost = ingredientCost(price, ing.amount, ing.unit, item?.inventoryUnit || ing.unit);
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

    <!-- Ingredients (inline editable) -->
    <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
      <div class="flex items-center justify-between mb-4">
        <h3
          class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"
        >
          Ingredients
        </h3>
        <div v-if="ingredientsDirty" class="flex items-center gap-2">
          <span class="text-xs text-amber-400 flex items-center gap-1">
            <UIcon name="i-lucide-circle-dot" class="text-xs" />
            Unsaved changes
          </span>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            @click="resetIngredients"
          >
            Reset
          </UButton>
          <UButton
            size="xs"
            icon="i-lucide-save"
            :loading="savingIngredients"
            @click="saveIngredients"
          >
            Save
          </UButton>
        </div>
      </div>

      <div v-if="editableIngredients.length > 0 || newIngredient._id" class="space-y-0">
        <!-- Header row -->
        <div
          class="grid grid-cols-[1fr_100px_100px_90px_70px_36px] sm:grid-cols-[1fr_100px_120px_90px_80px_36px] gap-2 pb-2 text-xs text-parchment/60 uppercase tracking-wider"
        >
          <span>Item</span>
          <span>Amount</span>
          <span>Unit</span>
          <span>Price/Unit</span>
          <span class="text-right">Cost</span>
          <span></span>
        </div>

        <!-- Editable ingredient rows -->
        <div
          v-for="(ing, i) in ingredients"
          :key="editableIngredients[i]?._id + '-' + i"
          class="grid grid-cols-[1fr_100px_100px_90px_70px_36px] sm:grid-cols-[1fr_100px_120px_90px_80px_36px] gap-2 py-1.5 items-center border-t border-brown/10"
        >
          <!-- Item name (read-only, clickable link) -->
          <NuxtLink
            :to="`/admin/items/${ing.id}`"
            class="text-sm text-gold hover:text-copper transition-colors truncate"
          >
            {{ ing.name }}
          </NuxtLink>

          <!-- Amount (editable) -->
          <UInput
            v-model.number="editableIngredients[i].amount"
            type="number"
            size="sm"
            :ui="{ base: 'text-sm' }"
            step="any"
            min="0"
          />

          <!-- Unit (editable) -->
          <USelectMenu
            v-model="editableIngredients[i].unit"
            :items="allUnits"
            size="sm"
          />

          <!-- Price per unit (read-only) -->
          <span class="text-sm text-parchment/60">{{
            Dollar.format(ing.pricePerUnit)
          }}</span>

          <!-- Cost (read-only, computed) -->
          <span class="text-sm text-parchment text-right">{{
            Dollar.format(ing.cost)
          }}</span>

          <!-- Delete button -->
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            @click="removeIngredient(i)"
          />
        </div>

        <!-- Add new ingredient row -->
        <div
          class="grid grid-cols-[1fr_100px_100px_90px_70px_36px] sm:grid-cols-[1fr_100px_120px_90px_80px_36px] gap-2 pt-3 mt-2 border-t border-brown/30 items-center"
        >
          <USelectMenu
            v-model="newIngredient._id"
            :items="
              itemStore.items.map((i) => ({
                label: i.name,
                value: i._id,
              }))
            "
            value-key="value"
            placeholder="Add item..."
            searchable
            size="sm"
          />
          <UInput
            v-model.number="newIngredient.amount"
            type="number"
            placeholder="Amt"
            size="sm"
            step="any"
            min="0"
          />
          <USelectMenu
            v-model="newIngredient.unit"
            :items="allUnits"
            placeholder="Unit"
            size="sm"
          />
          <span></span>
          <span></span>
          <UButton
            icon="i-lucide-plus"
            size="xs"
            :disabled="!newIngredient._id || !newIngredient.amount || !newIngredient.unit"
            @click="addIngredient"
          />
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="text-center py-6">
          <UIcon
            name="i-lucide-package-open"
            class="text-2xl text-parchment/20 mx-auto mb-2"
          />
          <p class="text-sm text-parchment/50">No ingredients listed</p>
        </div>

        <!-- Add row even when empty -->
        <div
          class="grid grid-cols-[1fr_100px_100px_36px] gap-2 items-center"
        >
          <USelectMenu
            v-model="newIngredient._id"
            :items="
              itemStore.items.map((i) => ({
                label: i.name,
                value: i._id,
              }))
            "
            value-key="value"
            placeholder="Add item..."
            searchable
            size="sm"
          />
          <UInput
            v-model.number="newIngredient.amount"
            type="number"
            placeholder="Amt"
            size="sm"
            step="any"
            min="0"
          />
          <USelectMenu
            v-model="newIngredient.unit"
            :items="allUnits"
            placeholder="Unit"
            size="sm"
          />
          <UButton
            icon="i-lucide-plus"
            size="xs"
            :disabled="!newIngredient._id || !newIngredient.amount || !newIngredient.unit"
            @click="addIngredient"
          />
        </div>
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

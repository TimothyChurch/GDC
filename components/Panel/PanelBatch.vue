<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => batchStore.batch,
  async onSave(data) {
    // compute batch cost before saving
    const recipe = recipeStore.getRecipeById(data.recipe);
    if (!data.recipeCost && data.recipe) data.recipeCost = recipePrice(data.recipe);
    if (recipe?.volume && data.batchSize && recipe.volumeUnit && data.batchSizeUnit) {
      const scaling = convertUnitRatio(recipe.volumeUnit, data.batchSizeUnit);
      data.batchCost = (recipePrice(recipe) * (data.batchSize / recipe.volume)) / scaling || 0;
    }
    Object.assign(batchStore.batch, data);
    await batchStore.updateBatch();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const price = computed(() => {
  return localData.value.recipe ? Dollar.format(recipePrice(localData.value.recipe)) : Dollar.format(0);
});

const recipe = computed(() => recipeStore.getRecipeById(localData.value.recipe));

const scaledPrice = computed(() => {
  if (!recipe.value?.volume || !localData.value.batchSize) return 0;
  const scaling = convertUnitRatio(recipe.value.volumeUnit, localData.value.batchSizeUnit) || 1;
  return (recipePrice(recipe.value) * (localData.value.batchSize / recipe.value.volume)) / scaling || 0;
});
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Batch' : 'Edit Batch' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Recipe">
            <USelect
              v-model="localData.recipe"
              :options="recipeStore.recipes"
              option-attribute="name"
              value-attribute="_id"
            />
          </UFormField>
          <UFormField label="Recipe Cost">
            <span class="text-sm">{{ price }}</span>
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Batch Size">
              <UInput v-model="localData.batchSize" type="number" placeholder="Volume" />
            </UFormField>
            <UFormField label="Size Unit">
              <USelect v-model="localData.batchSizeUnit" :options="volumeUnits" />
            </UFormField>
          </div>
          <UFormField label="Batch Cost">
            <span class="text-sm">{{ Dollar.format(scaledPrice) }}</span>
          </UFormField>
        </div>
        <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
          <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
          <UButton @click="save" :loading="saving" :disabled="!isDirty">
            {{ isNew ? 'Create' : 'Save' }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

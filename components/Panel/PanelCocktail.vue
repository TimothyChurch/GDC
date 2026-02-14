<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const cocktailStore = useCocktailStore();
const itemStore = useItemStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => cocktailStore.cocktail,
  async onSave(data) {
    Object.assign(cocktailStore.cocktail, data);
    await cocktailStore.updateCocktail();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const cost = computed(() => {
  return localData.value.ingredients.reduce(
    (total: number, ingredient: { item: string; amount: number }) => {
      let c = itemStore.getPriceById(ingredient.item) || 0;
      return total + ingredient.amount * c;
    },
    0
  ) as number;
});

const glasswareOptions = ["Highball", "Lowball", "Martini", "Mug", "Shot glass", "Glencairn"];
const menuOptions = ["main", "seasonal", "shots", "off menu"];
const units = ["oz", "ml", "dash", "barspoon", "each"];

const newIngredient = ref({ item: '' as string, amount: 0, unit: '' });

const addIngredient = () => {
  localData.value.ingredients.push({ ...newIngredient.value });
  newIngredient.value = { item: '', amount: 0, unit: '' };
};

const removeIngredient = (index: number) => {
  localData.value.ingredients.splice(index, 1);
};
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Cocktail' : 'Edit Cocktail' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput v-model="localData.name" placeholder="Cocktail name" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Glassware">
              <USelect v-model="localData.glassware" :items="glasswareOptions" />
            </UFormField>
            <UFormField label="Menu">
              <USelect v-model="localData.menu" :items="menuOptions" />
            </UFormField>
          </div>

          <UFormField label="Ingredients">
            <div class="space-y-2">
              <div
                v-for="(ingredient, index) in localData.ingredients"
                :key="index"
                class="flex items-center gap-2"
              >
                <span class="flex-1 text-sm truncate">{{ itemStore.getItemById(ingredient.item)?.name }}</span>
                <span class="text-sm text-parchment/60">{{ ingredient.amount }} {{ ingredient.unit }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeIngredient(index)" />
              </div>
              <div class="flex gap-2 items-end">
                <USelectMenu
                  v-model="newIngredient.item"
                  value-key="id"
                  :items="itemStore.itemNameId"
                  class="flex-1"
                  placeholder="Select item"
                />
                <UInput v-model.number="newIngredient.amount" type="number" placeholder="Amt" class="w-16" />
                <USelect v-model="newIngredient.unit" :items="units" class="w-20" />
                <UButton icon="i-lucide-plus" @click="addIngredient" size="sm" />
              </div>
            </div>
          </UFormField>

          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Cost">
              <span class="text-sm">{{ Dollar.format(cost) }}</span>
            </UFormField>
            <UFormField label="Est. Price">
              <span class="text-sm">{{ Dollar.format(estimateCocktailPrice(cost)) }}</span>
            </UFormField>
            <UFormField label="Price">
              <UInput v-model.number="localData.price" type="number" step="0.01" />
            </UFormField>
          </div>

          <FormImageUpload
            v-model="localData.img"
            folder="cocktails"
            label="Cocktail Photo"
          />
          <UFormField label="Description">
            <UTextarea v-model="localData.description" />
          </UFormField>
          <UFormField label="Directions">
            <UTextarea v-model="localData.directions" />
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

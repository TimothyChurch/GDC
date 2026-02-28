<script setup lang="ts">
import * as yup from 'yup';
import type { IngredientSourceType } from '~/types';

const emit = defineEmits<{ close: [boolean] }>();

const schema = yup.object({
  name: yup.string().required('Name is required'),
});

const cocktailStore = useCocktailStore();
const itemStore = useItemStore();
const bottleStore = useBottleStore();
const { getIngredientName, totalIngredientCost } = useIngredientResolver();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => cocktailStore.cocktail,
  async onSave(data) {
    Object.assign(cocktailStore.cocktail, data);
    await cocktailStore.updateCocktail();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const cost = computed(() => totalIngredientCost(localData.value.ingredients));

const { glasswareOptions, menuOptions, unitOptions, addGlassware, removeGlassware, addMenu, removeMenu } = useCocktailOptions();
const preparationOptions = ['Stirred', 'Shaken', 'Dry Shaken', 'Double Shaken', 'Built in Glass'];

const newGlassware = ref('');
const newMenu = ref('');

const ingredientOptions = computed(() => {
  const items = itemStore.itemNameId.map((i) => ({
    id: `item:${i.id}`,
    label: `${i.label} (Item)`,
  }));
  const bottles = bottleStore.bottleNameId.map((b) => ({
    id: `bottle:${b.id}`,
    label: `${b.label} (Bottle)`,
  }));
  return [...items, ...bottles].sort((a, b) => a.label.localeCompare(b.label));
});

const selectedIngredient = ref('');
const newIngredientAmount = ref(0);
const newIngredientUnit = ref('');

const addIngredient = () => {
  if (!selectedIngredient.value) return;
  const [sourceType, ...idParts] = selectedIngredient.value.split(':');
  const id = idParts.join(':');
  localData.value.ingredients.push({
    item: id,
    amount: newIngredientAmount.value,
    unit: newIngredientUnit.value,
    sourceType: sourceType as IngredientSourceType,
  });
  selectedIngredient.value = '';
  newIngredientAmount.value = 0;
  newIngredientUnit.value = '';
};

const removeIngredient = (index: number) => {
  localData.value.ingredients.splice(index, 1);
};

// Drag-and-drop reordering
const dragIndex = ref<number | null>(null);

const onDragStart = (index: number, event: DragEvent) => {
  dragIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
};

const onDragOver = (index: number, event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onDrop = (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) return;
  const items = localData.value.ingredients;
  const [moved] = items.splice(dragIndex.value, 1);
  items.splice(index, 0, moved);
  dragIndex.value = null;
};

const onDragEnd = () => {
  dragIndex.value = null;
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
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name" name="name">
            <UInput v-model="localData.name" placeholder="Cocktail name" />
          </UFormField>
          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Glassware">
              <div class="flex gap-1">
                <USelect v-model="localData.glassware" :items="glasswareOptions" class="flex-1" />
                <UPopover>
                  <UButton icon="i-lucide-settings-2" variant="ghost" size="xs" color="neutral" />
                  <template #content>
                    <div class="p-3 space-y-2 w-56">
                      <p class="text-xs font-semibold text-parchment/70">Manage Glassware</p>
                      <div v-for="g in glasswareOptions" :key="g" class="flex items-center justify-between text-sm">
                        <span>{{ g }}</span>
                        <UButton icon="i-lucide-x" size="xs" variant="ghost" color="error" @click="removeGlassware(g)" />
                      </div>
                      <div class="flex gap-1">
                        <UInput v-model="newGlassware" placeholder="Add new..." size="xs" class="flex-1" @keyup.enter="addGlassware(newGlassware); newGlassware = ''" />
                        <UButton icon="i-lucide-plus" size="xs" @click="addGlassware(newGlassware); newGlassware = ''" />
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </UFormField>
            <UFormField label="Menu">
              <div class="flex gap-1">
                <USelect v-model="localData.menu" :items="menuOptions" class="flex-1" />
                <UPopover>
                  <UButton icon="i-lucide-settings-2" variant="ghost" size="xs" color="neutral" />
                  <template #content>
                    <div class="p-3 space-y-2 w-56">
                      <p class="text-xs font-semibold text-parchment/70">Manage Menus</p>
                      <div v-for="m in menuOptions" :key="m" class="flex items-center justify-between text-sm">
                        <span class="capitalize">{{ m }}</span>
                        <UButton icon="i-lucide-x" size="xs" variant="ghost" color="error" @click="removeMenu(m)" />
                      </div>
                      <div class="flex gap-1">
                        <UInput v-model="newMenu" placeholder="Add new..." size="xs" class="flex-1" @keyup.enter="addMenu(newMenu); newMenu = ''" />
                        <UButton icon="i-lucide-plus" size="xs" @click="addMenu(newMenu); newMenu = ''" />
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </UFormField>
            <UFormField label="Preparation">
              <USelect v-model="localData.preparation" :items="preparationOptions" placeholder="Select preparation method" />
            </UFormField>
          </div>

          <UFormField label="Ingredients">
            <div class="space-y-2">
              <div
                v-for="(ingredient, index) in localData.ingredients"
                :key="index"
                class="flex items-center gap-2 rounded px-1 py-0.5 transition-colors"
                :class="dragIndex === index ? 'opacity-50 bg-brown/10' : ''"
                draggable="true"
                @dragstart="onDragStart(index, $event)"
                @dragover="onDragOver(index, $event)"
                @drop="onDrop(index)"
                @dragend="onDragEnd"
              >
                <UIcon name="i-lucide-grip-vertical" class="text-parchment/40 cursor-grab shrink-0" />
                <span class="flex-1 text-sm truncate">
                  {{ getIngredientName(ingredient) }}
                  <span v-if="ingredient.sourceType === 'bottle'" class="text-xs text-copper/70 ml-1">(Bottle)</span>
                </span>
                <UInput v-model.number="ingredient.amount" type="number" step="0.25" class="w-16" size="xs" />
                <USelect v-model="ingredient.unit" :items="unitOptions" class="w-20" size="xs" />
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeIngredient(index)" />
              </div>
              <div class="flex gap-2 items-end">
                <USelectMenu
                  v-model="selectedIngredient"
                  value-key="id"
                  :items="ingredientOptions"
                  class="flex-1"
                  placeholder="Select ingredient"
                />
                <UInput v-model.number="newIngredientAmount" type="number" placeholder="Amt" class="w-16" />
                <USelect v-model="newIngredientUnit" :items="unitOptions" class="w-20" />
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
          <UButton type="submit" :loading="saving" :disabled="!isDirty">
            {{ isNew ? 'Create' : 'Save' }}
          </UButton>
        </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>

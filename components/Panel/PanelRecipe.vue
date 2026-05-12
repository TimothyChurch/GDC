<script setup lang="ts">
import * as yup from 'yup';
import { getDefaultGrainInForClass } from '../../utils/grainBill';

const emit = defineEmits<{ close: [boolean] }>();

const recipeStore = useRecipeStore();

const schema = yup.object({
  name: yup.string().required('Name is required'),
  class: yup.string().required('Class is required'),
  volume: yup.number().positive('Must be positive').required('Volume is required'),
  volumeUnit: yup.string().required('Volume unit is required'),
});
const itemStore = useItemStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => recipeStore.recipe,
  draft: { key: 'PanelRecipe', id: () => recipeStore.recipe._id },
  async onSave(data) {
    Object.assign(recipeStore.recipe, data);
    await recipeStore.updateRecipe();
  },
  onClose: () => emit("close", true),
});

const isNew = !localData.value._id;

const types = computed(() => {
  return (
    liquorClasses.filter((l) => l.class === localData.value.class)[0]?.types ||
    []
  );
});

const bulkSpiritStore = useBulkSpiritStore();

const newItem = ref({
  _id: null as unknown as string,
  amount: null as unknown as number,
  unit: null as unknown as string,
});

// Bulk spirit ingredients
const newBulkSpirit = ref({
  bulkSpirit: '' as string,
  volume: null as unknown as number,
  volumeUnit: 'gallon' as string,
});

const addBulkSpirit = () => {
  if (!localData.value.bulkSpirits) localData.value.bulkSpirits = [];
  localData.value.bulkSpirits.push({ ...newBulkSpirit.value });
  newBulkSpirit.value = { bulkSpirit: '', volume: 0, volumeUnit: 'gallon' };
};

const removeBulkSpirit = (idx: number) => {
  localData.value.bulkSpirits?.splice(idx, 1);
};

const bulkSpiritOptions = computed(() =>
  bulkSpiritStore.activeBulkSpirits.map((bs) => ({ label: bs.name, value: bs._id }))
);

const addItem = () => {
  localData.value.items.push({ ...newItem.value });
  newItem.value = { _id: "", amount: 0, unit: "" };
};

const removeItem = (itemId: string) => {
  localData.value.items = localData.value.items.filter(
    (i: any) => i._id !== itemId,
  );
};

// Prefill `grainIn` from the class on a new recipe (or when grainIn is unset
// on an existing recipe being edited). Only fires when the user changes class
// on a recipe that hasn't yet committed a grainIn choice — never overwrites
// a deliberate user choice.
watch(
  () => localData.value.class,
  (newClass, oldClass) => {
    if (!newClass) return;
    if (typeof localData.value.grainIn === 'boolean' && oldClass) return;
    localData.value.grainIn = getDefaultGrainInForClass(newClass);
  },
);
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-white/10"
        >
          <h2
            class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"
          >
            {{ isNew ? "New Recipe" : "Edit Recipe" }}
          </h2>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click="cancel"
          />
        </div>
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <UFormField label="Name" name="name">
              <UInput
                v-model="localData.name"
                placeholder="Recipe name"
                class="w-full"
              />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Class" name="class">
                <USelectMenu
                  v-model="localData.class"
                  :items="
                    liquorClasses.map((c) => ({ label: c.class, value: c.class }))
                  "
                  value-key="value"
                  placeholder="Select Class"
                  searchable
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Type">
                <USelectMenu
                  v-model="localData.type"
                  :items="types.map((t) => ({ label: t.type, value: t.type }))"
                  value-key="value"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField label="Volume" name="volume">
              <BaseQuantityInput
                v-model:value="localData.volume"
                v-model:unit="localData.volumeUnit"
                :unit-options="volumeUnits"
                placeholder="Volume"
              />
            </UFormField>

            <UFormField label="Ingredients">
              <div class="space-y-2">
                <!-- Inline-editable ingredient rows -->
                <div
                  v-for="(item, idx) in localData.items"
                  :key="item._id + '-' + idx"
                  class="grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"
                >
                  <span class="text-sm truncate text-parchment">{{
                    itemStore.nameById(item._id)
                  }}</span>
                  <UInput
                    v-model.number="localData.items[idx]!.amount"
                    type="number"
                    size="xs"
                    step="any"
                    min="0"
                  />
                  <USelectMenu
                    v-model="localData.items[idx]!.unit"
                    :items="allUnits"
                    size="xs"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    @click="removeItem(item._id)"
                  />
                </div>
                <!-- Add new ingredient row -->
                <div class="grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10">
                  <USelectMenu
                    v-model="newItem._id"
                    :items="
                      itemStore.items.map((i) => ({
                        label: i.name,
                        value: i._id,
                      }))
                    "
                    value-key="value"
                    placeholder="Add item..."
                    searchable
                    size="xs"
                  />
                  <UInput
                    v-model.number="newItem.amount"
                    type="number"
                    placeholder="Amt"
                    size="xs"
                    step="any"
                    min="0"
                  />
                  <USelectMenu
                    v-model="newItem.unit"
                    :items="allUnits"
                    placeholder="Unit"
                    size="xs"
                  />
                  <UButton
                    icon="i-lucide-plus"
                    size="xs"
                    :disabled="!newItem._id || !newItem.amount || !newItem.unit"
                    @click="addItem"
                  />
                </div>
              </div>
            </UFormField>

            <!-- Bulk Spirit Ingredients -->
            <UFormField label="Bulk Spirits" v-if="bulkSpiritOptions.length > 0 || (localData.bulkSpirits && localData.bulkSpirits.length > 0)">
              <div class="space-y-2">
                <div
                  v-for="(bs, idx) in localData.bulkSpirits || []"
                  :key="bs.bulkSpirit + '-' + idx"
                  class="grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"
                >
                  <span class="text-sm truncate text-parchment">
                    {{ bulkSpiritStore.getBulkSpiritById(bs.bulkSpirit)?.name || 'Unknown' }}
                  </span>
                  <UInput
                    v-model.number="localData.bulkSpirits![idx]!.volume"
                    type="number"
                    size="xs"
                    step="any"
                    min="0"
                  />
                  <USelectMenu
                    v-model="localData.bulkSpirits![idx]!.volumeUnit"
                    :items="volumeUnits"
                    size="xs"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    @click="removeBulkSpirit(idx)"
                  />
                </div>
                <div class="grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10">
                  <USelectMenu
                    v-model="newBulkSpirit.bulkSpirit"
                    :items="bulkSpiritOptions"
                    value-key="value"
                    placeholder="Add bulk spirit..."
                    searchable
                    size="xs"
                  />
                  <UInput
                    v-model.number="newBulkSpirit.volume"
                    type="number"
                    placeholder="Vol"
                    size="xs"
                    step="any"
                    min="0"
                  />
                  <USelectMenu
                    v-model="newBulkSpirit.volumeUnit"
                    :items="volumeUnits"
                    size="xs"
                  />
                  <UButton
                    icon="i-lucide-plus"
                    size="xs"
                    :disabled="!newBulkSpirit.bulkSpirit || !newBulkSpirit.volume"
                    @click="addBulkSpirit"
                  />
                </div>
              </div>
            </UFormField>

            <!-- Grain-in toggle (affects PG projection math) -->
            <UFormField>
              <div class="flex items-center justify-between">
                <div class="pr-4">
                  <div class="text-sm font-medium text-parchment">Grain-in fermentation</div>
                  <div class="text-xs text-parchment/60">
                    Grain remains in the wash through fermentation (typical for
                    bourbon/whiskey). Off = lautered/sparged before fermenting.
                    Affects proof-gallon math.
                  </div>
                </div>
                <USwitch v-model="localData.grainIn" />
              </div>
            </UFormField>

            <!-- Projection (live preview) -->
            <RecipeProjections
              :recipe="localData"
              @update:recipe="(r) => Object.assign(localData, r)"
            />

            <!-- Pipeline Builder -->
            <RecipePipelineBuilder
              v-model="localData.pipeline"
              v-model:template="localData.pipelineTemplate"
            />

            <UFormField label="Directions">
              <UTextarea v-model="localData.directions" />
            </UFormField>
          </div>
          <div
            class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"
          >
            <UButton color="neutral" variant="outline" @click="cancel"
              >Cancel</UButton
            >
            <UButton type="submit" :loading="saving" :disabled="!isDirty">
              {{ isNew ? "Create" : "Save" }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>

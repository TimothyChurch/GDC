<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const recipeStore = useRecipeStore();
const itemStore = useItemStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => recipeStore.recipe,
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

const newItem = ref({
  _id: null as unknown as string,
  amount: null as unknown as number,
  unit: null as unknown as string,
});

const addItem = () => {
  localData.value.items.push({ ...newItem.value });
  newItem.value = { _id: "", amount: 0, unit: "" };
};

const removeItem = (itemId: string) => {
  localData.value.items = localData.value.items.filter(
    (i: any) => i._id !== itemId,
  );
};
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
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput
              v-model="localData.name"
              placeholder="Recipe name"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Class">
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
          <UFormField label="Volume">
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
                  v-model.number="localData.items[idx].amount"
                  type="number"
                  size="xs"
                  step="any"
                  min="0"
                />
                <USelectMenu
                  v-model="localData.items[idx].unit"
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
          <UButton @click="save" :loading="saving" :disabled="!isDirty">
            {{ isNew ? "Create" : "Save" }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

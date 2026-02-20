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
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const types = computed(() => {
  return liquorClasses.filter((l) => l.class === localData.value.class)[0]?.types;
});

const newItem = ref({ _id: null as string | null, amount: null as number | null, unit: null as string | null });

const addItem = () => {
  localData.value.items.push({ ...newItem.value });
  newItem.value = { _id: null, amount: null, unit: null };
};

const removeItem = (itemId: string) => {
  localData.value.items = localData.value.items.filter((i: any) => i._id !== itemId);
};
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Recipe' : 'Edit Recipe' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput v-model="localData.name" placeholder="Recipe name" />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Class">
              <USelectMenu
                v-model="localData.class"
                :options="liquorClasses"
                option-attribute="class"
                value-attribute="class"
                placeholder="Select Class"
                searchable
              />
            </UFormField>
            <UFormField label="Type">
              <USelectMenu
                v-model="localData.type"
                :options="types"
                option-attribute="type"
                value-attribute="type"
              />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Volume">
              <UInput v-model="localData.volume" type="number" />
            </UFormField>
            <UFormField label="Volume Unit">
              <USelectMenu v-model="localData.volumeUnit" :options="volumeUnits" />
            </UFormField>
          </div>

          <UFormField label="Ingredients">
            <div class="space-y-2">
              <div
                v-for="item in localData.items"
                :key="item._id"
                class="flex items-center justify-between gap-2"
              >
                <span class="text-sm flex-1 truncate">{{ itemStore.nameById(item._id) }}</span>
                <span class="text-sm text-parchment/60">{{ item.amount }} {{ item.unit }}</span>
                <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" @click="removeItem(item._id)" />
              </div>
              <div class="flex gap-2 items-end">
                <USelectMenu
                  :options="itemStore.items"
                  v-model="newItem._id"
                  option-attribute="name"
                  value-attribute="_id"
                  placeholder="Select item"
                  searchable
                  class="flex-1"
                />
                <UInput v-model.number="newItem.amount" type="number" placeholder="Amt" class="w-16" />
                <USelectMenu v-model="newItem.unit" :options="allUnits" placeholder="Unit" class="w-24" />
                <UButton icon="i-lucide-plus" @click="addItem" size="sm" />
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

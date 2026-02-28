<script setup lang="ts">
import * as yup from 'yup';

const emit = defineEmits<{ close: [boolean] }>();

const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();

const schema = yup.object({
  name: yup.string().required('Name is required'),
  abv: yup.number().min(0).max(100).nullable(),
  price: yup.number().min(0).nullable(),
});

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => bottleStore.bottle,
  async onSave(data) {
    Object.assign(bottleStore.bottle, data);
    await bottleStore.updateBottle();
  },
  onClose: () => emit("close", true),
});

const isNew = !localData.value._id;

const newType = (type: string) => {
  localData.value.type = type;
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
            {{ isNew ? "New Bottle" : "Edit Bottle" }}
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
              <UInput v-model="localData.name" placeholder="Bottle name" />
            </UFormField>
            <UFormField label="Recipe" name="recipe">
              <USelectMenu
                :items="recipeStore.recipes"
                searchable
                label-key="name"
                value-key="_id"
                v-model="localData.recipe"
                class="w-full"
              />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Class" name="class">
                <USelectMenu
                  v-model="localData.class"
                  :items="liquorClasses.map((i) => i.class)"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Type" name="type">
                <USelectMenu
                  v-if="localData.class"
                  v-model="localData.type"
                  :items="
                    liquorClasses
                      .filter((i) => i.class === localData.class)[0]
                      ?.types.map((i) => i.type)
                  "
                  create-item
                  @create="newType"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="ABV" name="abv">
                <UInput v-model="localData.abv" type="number" />
              </UFormField>
              <UFormField label="Price" name="price">
                <UInput v-model="localData.price" type="number" />
              </UFormField>
            </div>
            <div class="flex items-center gap-6">
              <UFormField label="In Stock">
                <USwitch v-model="localData.inStock" />
              </UFormField>
              <UFormField v-if="!isNew" label="Archived">
                <USwitch v-model="localData.archived" color="red" />
              </UFormField>
            </div>
            <FormImageUpload
              v-model="localData.img"
              folder="bottles"
              label="Product Photo"
            />
            <UFormField label="Description" name="description">
              <UTextarea v-model="localData.description" />
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

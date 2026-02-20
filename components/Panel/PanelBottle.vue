<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();

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
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput v-model="localData.name" placeholder="Bottle name" />
          </UFormField>
          <UFormField label="Recipe">
            <USelectMenu
              :items="recipeStore.recipes"
              searchable
              option-attribute="name"
              value-attribute="_id"
              v-model="localData.recipe"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Class">
              <USelectMenu
                v-model="localData.class"
                :items="liquorClasses.map((i) => i.class)"
              />
            </UFormField>
            <UFormField label="Type">
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
              />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="ABV">
              <UInput v-model="localData.abv" type="number" />
            </UFormField>
            <UFormField label="Price">
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
          <UFormField label="Description">
            <UTextarea v-model="localData.description" />
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

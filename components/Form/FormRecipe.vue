<script setup>
const recipeStore = useRecipeStore();
const itemStore = useItemStore();

const recipeItemsColumns = [
  {
    key: "_id",
    label: "Item",
  },
  {
    key: "amount",
    label: "Amount",
  },
  {
    key: "unit",
    label: "Unit",
  },
  {
    key: "actions",
  },
];
const recipeItemsRows = computed(() => {
  return recipeStore.recipe.items;
});
const removeItem = (itemId) => {
  recipeStore.recipe.items = recipeStore.recipe.items.filter(
    (item) => item._id != itemId
  );
};
const newitem = ref({
  _id: null,
  amount: null,
  unit: null,
});

const additem = () => {
  recipeStore.recipe.items.push(newitem.value);
  newitem.value = { _id: null, amount: null, unit: null };
};
const types = computed(() => {
  return liquorClasses.filter(
    (liquor) => liquor.class == recipeStore.recipe.class
  )[0]?.types;
});

const saveRecipe = () => {
  recipeStore.updateRecipe();
  toggleFormModal();
};
</script>
<template>
  <UContainer class="min-w-5xl">
    <UForm class="grid grid-cols-2 gap-3" :state="recipeStore.recipe">
      <UFormField label="Name" class="col-span-2">
        <UInput v-model="recipeStore.recipe.name" />
      </UFormField>
      <UFormField label="Class" name="class">
        <USelectMenu
          v-model="recipeStore.recipe.class"
          :options="liquorClasses"
          option-attribute="class"
          value-attribute="class"
          placeholder="Select Class"
          searchable
        />
      </UFormField>
      <UFormField label="Type" name="type">
        <USelectMenu
          v-model="recipeStore.recipe.type"
          :options="types"
          option-attribute="type"
          value-attribute="type"
        />
      </UFormField>
      <UFormField label="Volume">
        <UInput v-model="recipeStore.recipe.volume" type="number" />
      </UFormField>
      <UFormField label="Volumne Unit">
        <USelectMenu
          v-model="recipeStore.recipe.volumeUnit"
          :options="volumeUnits"
        />
      </UFormField>
      <UTable
        :rows="recipeItemsRows"
        :columns="recipeItemsColumns"
        class="col-span-2"
      >
        <template #_id-data="{ row }" :key="row._id">
          {{ itemStore.nameById(row._id) }}
        </template>
        <template #actions-data="{ row }">
          <UButton
            @click="removeItem(row._id)"
            icon="i-heroicons-solid-trash"
          />
        </template>
      </UTable>
      <div class="flex gap-3 justify-between col-span-2">
        <UFormField label="Name">
          <USelectMenu
            :options="itemStore.items"
            v-model="newitem._id"
            option-attribute="name"
            value-attribute="_id"
            placeholder="Select item"
            clear-search-on-close
            searchable
            creatable
          />
        </UFormField>
        <UFormField label="Amount">
          <UInput v-model="newitem.amount" type="number" />
        </UFormField>
        <UFormField label="Unit">
          <USelectMenu
            v-model="newitem.unit"
            :options="allUnits"
            placeholder="Unit"
            searchable
          />
        </UFormField>
        <UButton @click="additem" icon="i-heroicons-solid-plus" />
      </div>
      <UFormField label="Directions">
        <UTextarea v-model="recipeStore.recipe.directions" />
      </UFormField>
      <UButton @click="saveRecipe()" class="my-5 col-span-2"
        >Save Recipe</UButton
      >
    </UForm>
  </UContainer>
</template>

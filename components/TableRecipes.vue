<script setup>
const recipeStore = useRecipeStore();
const itemStore = useItemStore();

if (!recipeStore.recipes.length) {
  recipeStore.getRecipes();
}
const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "class",
    label: "Class",
  },
  {
    key: "type",
    label: "Type",
  },
  {
    key: "size",
    label: "Size",
  },
  {
    key: "actions",
  },
];
const expand = ref({
  openedRows: [],
  rows: {},
});
const items = (row) => [
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => editRecipe(row),
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteRecipe(row._id),
    },
  ],
];
const addRecipe = () => {
  recipeStore.resetRecipe();
  formSelection.value = "FormRecipe";
  toggleFormModal();
};
const editRecipe = (row) => {
  recipeStore.recipe = row;
  formSelection.value = "FormRecipe";
  toggleFormModal();
};
const deleteRecipe = (row) => {
  recipeStore.deleteRecipe(row._id);
};
</script>

<template>
  <UContainer>
    <UTable
      :rows="recipeStore.recipes"
      :columns="columns"
      v-model:expand="expand"
    >
      <template #size-data="{ row }">
        <span>{{ row.volume }} {{ row.volumeUnit }}</span>
      </template>
      <template #actions-header>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-plus-20-solid"
          @click="addRecipe()"
        />
      </template>
      <template #actions-data="{ row }">
        <UDropdown :items="items(row)">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal-20-solid"
          />
        </UDropdown>
      </template>
      <template #expand="{ row }">
        <UTable :rows="row.items">
          <template #_id-header>Name</template>
          <template #_id-data="{ row }">
            {{ itemStore.nameById(row._id) }}
          </template>
        </UTable>
      </template>
    </UTable>
  </UContainer>
</template>

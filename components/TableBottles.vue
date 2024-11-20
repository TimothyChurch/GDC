<script setup>
const bottleStore = useBottleStore();
const { selectBottle, deleteBottle } = bottleStore;

const columns = [
  {
    key: "name",
    label: "Name",
    sortable: true,
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
    key: "abv",
    label: "ABV",
  },
  {
    key: "recipe",
    label: "Recipe",
  },
  {
    key: "actions",
  },
];
const items = (row) => [
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => editItem(row._id),
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteItem(row._id),
    },
  ],
];
const newItem = () => {
  formSelection.value = "FormBottleAdd";
  toggleFormModal();
};
const editItem = (id) => {
  selectBottle(id);
  formSelection.value = "FormBottleEdit";
  toggleFormModal();
};
const deleteItem = async (id) => {
  await deleteBottle(id);
};
</script>

<template>
  <div>
    <UTable :columns="columns" :rows="bottleStore.bottles">
      <template #actions-header>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-plus-20-solid"
          @click="newItem"
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
    </UTable>
  </div>
</template>

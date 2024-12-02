<script setup>
const itemStore = useItemStore();
const contactStore = useContactStore();

// Fetch items when the component is mounted
onMounted(() => {
  itemStore.getitems();
});

const columns = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "vendor", label: "Vendor" },
  { key: "actions", label: "Actions" },
];

const items = (row) => [
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => editItem(row),
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteItem(row._id),
    },
  ],
];

const newItem = () => {
  formSelection.value = "FormItem";
  toggleFormModal();
};

const editItem = (row) => {
  itemStore.item = row;
  formSelection.value = "FormItem";
  toggleFormModal();
};

const deleteItem = async (id) => {
  await itemStore.deleteitem(id);
};
</script>

<template>
  <UContainer>
    <UTable :rows="itemStore.items" :columns="columns">
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
      <template #vendor-data="{ row }">
        {{ contactStore.getContactById(row.vendor).businessName }}
      </template>
    </UTable>
  </UContainer>
</template>

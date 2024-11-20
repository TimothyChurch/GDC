<script setup>
const inventoryStore = useInventoryStore();
const bottleStore = useBottleStore();

const bottleInventory = ref();
const buttonClick = () => {
  bottleInventory.value = inventoryStore.getItemInventory(
    "6733ef11f79ffe4449b33e80"
  );
};
const formattedInventories = computed(() => {
  const data = inventoryStore.inventories.map((inventory) => {
    const data = {
      year: inventory.year,
      month: inventory.month,
      day: inventory.day,
      ...inventory.items,
    };
    return data;
  });
  const sortDays = data.sort((a, b) => {
    return parseInt(a.day) - parseInt(b.day);
  });
  const sortMonths = sortDays.sort((a, b) => {
    if (a.month < b.month) return -1;
    if (a.month > b.month) return 1;
    return 0;
  });
  const sortYears = sortMonths.sort((a, b) => {
    if (a.year < b.year) return -1;
    if (a.year > b.year) return 1;
    return 0;
  });
  return sortYears;
});
const date = [
  {
    key: "year",
    label: "Year",
  },
  {
    key: "month",
    label: "Month",
  },
  {
    key: "day",
    label: "Day",
  },
];
const actions = [
  {
    key: "actions",
  },
];

const columns = computed(() => {
  const bottlesObject = bottleStore.bottles.map((bottle) => {
    const data = { key: bottle._id, label: bottle.name };
    return data;
  });
  const sortedBottles = bottlesObject.sort((a, b) => {
    if (a.label < b.label) return -1;
    if (a.label > b.label) return 1;
    return 0;
  });
  const addDate = date.concat(sortedBottles);
  const allColumns = addDate.concat(actions);

  return allColumns;
});

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
  <UContainer>
    <UTable :rows="formattedInventories" :columns="columns">
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
  </UContainer>
</template>

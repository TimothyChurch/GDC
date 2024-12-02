<script setup>
const contactStore = useContactStore();
contactStore.getContacts();

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "type",
    label: "Type",
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
      click: () => editItem(row),
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteItem(row._id),
    },
  ],
];
const addItem = () => {
  formSelection.value = "FormContact";
  toggleFormModal();
};

const editItem = (row) => {
  contactStore.contact = row;
  formSelection.value = "FormContact";
  toggleFormModal();
};

const deleteItem = (row) => {
  contactStore.deleteContact(row._id);
};
</script>

<template>
  <div>
    <UTable
      :rows="contactStore.contacts"
      :columns="columns"
      v-model:expand="expand"
    >
      <template #expand="{ row }">
        <div class="flex gap-3 justify-around">
          <UFormGroup label="Website">
            <a v-if="row.website" :href="row.website" target="_blank">{{
              row.website
            }}</a>
            <div v-else>N/A</div>
          </UFormGroup>
          <UFormGroup label="Address">
            <div v-if="row.address">{{ row.address }}</div>
            <div v-else>N/A</div>
          </UFormGroup>
          <UFormGroup label="Email">
            <div v-if="row.email">{{ row.email }}</div>
            <div v-else>N/A</div>
          </UFormGroup>
          <UFormGroup label="Phone">
            <div v-if="row.phone">{{ row.phone }}</div>
            <div v-else>N/A</div>
          </UFormGroup>
        </div>
      </template>
      <template #name-data="{ row }">
        <div v-if="row.firstName">{{ row.firstName }} {{ row.lastName }}</div>
        <div v-if="row.businessName">{{ row.businessName }}</div>
      </template>
      <template #actions-header>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-plus-20-solid"
          @click="addItem"
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

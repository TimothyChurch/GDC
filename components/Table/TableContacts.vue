<script setup>
const contactStore = useContactStore();
contactStore.getContacts();
const { confirm } = useDeleteConfirm();

const search = ref('');
const page = ref(1);
const pageCount = ref(10);

const filteredData = computed(() => {
  if (!search.value) return contactStore.contacts;
  const q = search.value.toLowerCase();
  return contactStore.contacts.filter((c) => {
    const firstName = c.firstName?.toLowerCase() || '';
    const lastName = c.lastName?.toLowerCase() || '';
    const businessName = c.businessName?.toLowerCase() || '';
    return firstName.includes(q) || lastName.includes(q) || businessName.includes(q);
  });
});

const rows = computed(() => {
  return filteredData.value.slice(
    (page.value - 1) * pageCount.value,
    page.value * pageCount.value
  );
});

const columns = [
  {
    key: "name",
    label: "Name",
    sortable: true,
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
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
      click: () => deleteItem(row),
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

const deleteItem = async (row) => {
  const name = row.businessName || `${row.firstName} ${row.lastName}`;
  const confirmed = await confirm('Contact', name);
  if (confirmed) {
    contactStore.deleteContact(row._id);
  }
};
</script>

<template>
  <div>
    <UInput v-model="search" placeholder="Search contacts..." class="mb-2" />
    <UTable
      :rows="rows"
      :columns="columns"
      :loading="contactStore.loading"
      v-model:expand="expand"
    >
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-6 gap-3">
          <span class="text-sm text-gray-500">No contacts found</span>
        </div>
      </template>
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
    <div class="flex justify-between">
      <UFormGroup label="Results per Page">
        <USelect
          :options="[5, 10, 20, 100]"
          v-model="pageCount" />
      </UFormGroup>
      <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <UPagination
          v-model="page"
          :page-count="pageCount"
          :total="filteredData.length" />
      </div>
    </div>
  </div>
</template>

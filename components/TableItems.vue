<script setup>
const itemStore = useItemStore();
const contactStore = useContactStore();

const search = ref('');

const filteredItems = computed(() =>
	itemStore.items.filter(
		(item) =>
			item.name.toLowerCase().includes(search.value.toLowerCase()) ||
			item.type.toLowerCase().includes(search.value.toLowerCase()) ||
			item.vendor.toLowerCase().includes(search.value.toLowerCase())
	)
);

const columns = [
	{ key: 'name', label: 'Name', sortable: true },
	{ key: 'type', label: 'Type', sortable: true },
	{ key: 'vendor', label: 'Vendor', sortable: true },
	{ key: 'actions', label: 'Actions' },
];

const items = (row) => [
	[
		{
			label: 'Edit',
			icon: 'i-heroicons-pencil-square-20-solid',
			click: () => editItem(row),
		},
		{
			label: 'Delete',
			icon: 'i-heroicons-trash-20-solid',
			click: () => deleteItem(row._id),
		},
	],
];

const newItem = () => {
	formSelection.value = 'FormItem';
	toggleFormModal();
};

const editItem = (row) => {
	itemStore.item = row;
	formSelection.value = 'FormItem';
	toggleFormModal();
};

const deleteItem = async (id) => {
	await itemStore.deleteItem(id);
};
</script>

<template>
	<UContainer>
		<UInput
			v-model="search"
			placeholder="Search items..." />
		<UTable
			:rows="filteredItems"
			:columns="columns">
			<template #actions-header>
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-plus-20-solid"
					@click="newItem" />
			</template>
			<template #actions-data="{ row }">
				<UDropdown :items="items(row)">
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-ellipsis-horizontal-20-solid" />
				</UDropdown>
			</template>
			<template #vendor-data="{ row }">
				{{ contactStore.getContactById(row.vendor)?.businessName }}
			</template>
		</UTable>
	</UContainer>
</template>

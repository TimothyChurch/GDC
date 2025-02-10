<script setup>
const itemStore = useItemStore();
const contactStore = useContactStore();

const router = useRouter();

const search = ref('');
const filteredType = ref('');

const filteredItems = computed(() => {
	const firstFilter = ref(itemStore.items);
	if (filteredType.value != '') {
		firstFilter.value = firstFilter.value.filter(
			(item) => item.type === filteredType.value
		);
	}
	const secondFilter = ref(firstFilter.value);
	if (search.value != '') {
		secondFilter.value = secondFilter.value.filter(
			(item) =>
				item.name.toLowerCase().includes(search.value.toLowerCase()) ||
				item.type.toLowerCase().includes(search.value.toLowerCase())
		);
	}
	return secondFilter.value;
});

const columns = [
	{ key: 'name', label: 'Name', sortable: true },
	{ key: 'type', label: 'Type', sortable: true },
	{ key: 'vendor', label: 'Vendor', sortable: true },
	{ key: 'actions', label: 'Actions' },
];

const items = (row) => [
	[
		{
			label: 'Details',
			icon: 'i-heroicons-info-circle-20-solid',
			click: () => router.push(`/admin/items/${row._id}`),
		},
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
			<template #type-header>
				<USelect
					v-model="filteredType"
					placeholder="Filter by type"
					:options="itemInventoryTypes" />
			</template>
			<template #vendor-data="{ row }">
				{{ contactStore.getContactById(row.vendor)?.businessName }}
			</template>
		</UTable>
	</UContainer>
</template>

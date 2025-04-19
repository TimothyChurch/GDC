<script setup>
const itemStore = useItemStore();
const contactStore = useContactStore();

const router = useRouter();

const allItems = ref()
allItems.value = itemStore.items.map((item) => ({...item, price: Dollar.format(itemStore.latestPrice(item._id)) }));

const search = ref('');
const filteredType = ref('');

const filteredItems = computed(() => {
	if (filteredType.value != '') {
		allItems.value = allItems.value.filter(
			(item) => item.type === filteredType.value
		);
	}
	const secondFilter = ref(allItems.value);
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
	{ key: 'price', label: 'Price', sortable: true },
	{ key: 'inventoryUnit', label: 'Unit'},
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
const onSelect = (row) => {
	router.push(`/admin/items/${row._id}`);
}
</script>

<template>
	<UContainer>
		<UInput
			v-model="search"
			placeholder="Search items..." />
			{{ filteredItems[2] }}
		<UTable
			:rows="filteredItems"
			:columns="columns"
			@select="onSelect">
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

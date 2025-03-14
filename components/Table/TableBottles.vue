<script setup>
const router = useRouter();
// Bottle Store

const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();

const bottles = computed(() => {
	return bottleStore.bottles.map((bottle) => {
		return {
			...bottle,
			inventory: bottleStockCheck(bottle._id).currentStock,
			class: recipeStore.getRecipeById(bottle.recipe)?.class,
			type: recipeStore.getRecipeById(bottle.recipe)?.type,
			cost: Dollar.format(bottleCost(bottle._id)),
		};
	});
});

// Table Parameters

const columns = [
	{
		key: 'name',
		label: 'Name',
		sortable: true,
	},
	{
		key: 'class',
		label: 'Class',
	},
	{
		key: 'type',
		label: 'Type',
	},
	{
		key: 'abv',
		label: 'ABV',
	},
	{
		key: 'cost',
		label: 'Cost',
	},

	{ key: 'price', label: 'Price' },
	{
		key: 'inventory',
		label: 'Inventory',
		sortable: true,
	},
	{
		key: 'actions',
	},
];

const page = ref(1);
const pageCount = ref(10);

// Table Buttons

const items = (row) => [
	[
		{
			label: 'Details',
			icon: 'i-heroicons-info-circle-20-solid',
			click: () => router.push(`/admin/bottles/${row._id}`),
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

// Functions for Table

const addItem = () => {
	bottleStore.resetBottle();
	formSelection.value = 'FormBottle';
	console.log('Adding new bottle');
	toggleFormModal();
};
const editItem = (row) => {
	bottleStore.bottle = row;
	formSelection.value = 'FormBottle';
	toggleFormModal();
};
const deleteItem = async (id) => {
	await bottleStore.deleteBottle(id);
};

const searchFilter = ref('');
const rows = computed(() => {
	const filtered = ref([]);
	if (searchFilter.value != '') {
		filtered.value = bottles.value.filter((bottle) => {
			return (
				bottle.name.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
				bottle.class
					?.toLowerCase()
					.includes(searchFilter.value.toLowerCase()) ||
				bottle.type?.toLowerCase().includes(searchFilter.value.toLowerCase())
			);
		});
	} else {
		filtered.value = bottles.value;
	}
	return filtered.value.slice(
		(page.value - 1) * pageCount.value,
		page.value * pageCount.value
	);
});
</script>

<template>
	<div class="flex flex-col">
		{{ rows[0] }}
		<UInput
			v-model="searchFilter"
			placeholder="Search..." />
		<UTable
			:columns="columns"
			:rows="rows">
			<template #actions-header>
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-plus-20-solid"
					@click="addItem()" />
			</template>
			<template #actions-data="{ row }">
				<UDropdown :items="items(row)">
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-ellipsis-horizontal-20-solid" />
				</UDropdown>
			</template>
		</UTable>
		<div class="flex justify-between">
			<UFormGroup label="Results per Page">
				<USelect
					:options="[5, 10, 20, 100]"
					v-model="pageCount" />
			</UFormGroup>
			<div
				class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
				<UPagination
					v-model="page"
					:page-count="pageCount"
					:total="bottleStore.bottles.length" />
			</div>
		</div>
	</div>
</template>

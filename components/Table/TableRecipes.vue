<script setup>
const recipeStore = useRecipeStore();
const itemStore = useItemStore();
const purchaseOrderStore = usePurchaseOrderStore();

const columns = [
	{
		key: 'name',
		label: 'Name',
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
		key: 'size',
		label: 'Size',
	},
	{
		key: 'actions',
	},
];

const recipeColumns = [
	{
		key: '_id',
		label: 'Name',
	},
	{
		key: 'amount',
		label: 'Amount',
	},
	{ key: 'cost', label: 'Cost' },
	{ key: 'total', label: 'Total' },
];
const expand = ref({
	openedRows: [],
	rows: {},
});
const items = (row) => [
	[
		{
			label: 'Edit',
			icon: 'i-heroicons-pencil-square-20-solid',
			click: () => editRecipe(row),
		},
		{
			label: 'Delete',
			icon: 'i-heroicons-trash-20-solid',
			click: () => deleteRecipe(row),
		},
	],
];
const addRecipe = () => {
	recipeStore.resetRecipe();
	formSelection.value = 'FormRecipe';
	toggleFormModal();
};
const editRecipe = (row) => {
	recipeStore.recipe = row;
	formSelection.value = 'FormRecipe';
	toggleFormModal();
};
const deleteRecipe = (row) => {
	console.log(row);
	recipeStore.deleteRecipe(row._id);
};

const itemsTableRows = (row) => {
	return row.items.map((item) => {
		return {
			name: itemStore.nameById(item._id),
			amount: `${item.amount} ${item.unit}`,
			cost: `${Dollar.format(latestPrice(item._id))} /
						${itemStore.getItemById(item._id)?.inventoryUnit}`,
			total: `${Dollar.format(
				item.amount *
					latestPrice(item._id) *
					convertUnitRatio(
						item.unit,
						itemStore.getItemById(item._id)?.inventoryUnit
					)
			)}`,
		};
	});
};
</script>

<template>
	<div>
		<UTable
			:rows="recipeStore.recipes"
			:columns="columns"
			v-model:expand="expand">
			<template #size-data="{ row }">
				<span>{{ row.volume }} {{ row.volumeUnit }}</span>
			</template>
			<template #actions-header>
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-plus-20-solid"
					@click="addRecipe()" />
			</template>
			<template #actions-data="{ row }">
				<UDropdown :items="items(row)">
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-ellipsis-horizontal-20-solid" />
				</UDropdown>
			</template>
			<template #expand="{ row }">
				<UTable :rows="itemsTableRows(row)"> </UTable>
			</template>
		</UTable>
	</div>
</template>

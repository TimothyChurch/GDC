<script setup lang="ts">
import type { Inventory } from '~/types';

const inventoryStore = useInventoryStore();

const columns = [
	{
		key: 'date',
		label: 'Date',
	},
	{
		key: 'actions',
	},
];
const items = (row: Inventory) => [
	[
		{
			label: 'Edit',
			icon: 'i-heroicons-pencil-square-20-solid',
			click: () => editItem(row),
		},
		{
			label: 'Delete',
			icon: 'i-heroicons-trash-20-solid',
			click: () => deleteItem(row),
		},
	],
];

const expand = ref({
	openedRows: [],
	row: {},
});

const itemColumns = [
	{
		key: 'item',
		label: 'Item',
	},
	{
		key: 'quantity',
		label: 'Quantity',
	},
];
// CRUD Functions

const addItem = () => {
	inventoryStore.resetInventory();
	formSelection.value = 'FormInventory';
	toggleFormModal();
};
const editItem = (row: Inventory) => {
	inventoryStore.inventory = row;
	formSelection.value = 'FormInventory';
	toggleFormModal();
};
const deleteItem = (row: Inventory) => {
	inventoryStore.deleteInventory(row._id.toString());
};
</script>

<template>
	<div>
		<UTable
			:rows="inventoryStore.inventories"
			:columns="columns"
			v-model:expand="expand">
			<template #expand="{ row }">
				<UTable
					:rows="Object.entries(row.items)"
					:columns="itemColumns">
					<template #item-data="{ row }">
						<div>{{ getInventoryNameById(row[0]) }}</div>
					</template>
					<template #quantity-data="{ row }">
						<div>{{ row[1] }}</div>
					</template>
				</UTable>
			</template>
			<template #date-data="{ row }">
				{{ new Date(row.date).toLocaleDateString() }}
			</template>
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
	</div>
</template>

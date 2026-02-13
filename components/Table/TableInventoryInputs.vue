<script setup lang="ts">
import type { Inventory } from '~/types';

const inventoryStore = useInventoryStore();
const { confirm } = useDeleteConfirm();

const search = ref('');
const page = ref(1);
const pageCount = ref(10);

const filteredData = computed(() => {
	if (!search.value) return inventoryStore.inventories;
	const q = search.value.toLowerCase();
	return inventoryStore.inventories.filter((inv) => {
		const dateStr = new Date(inv.date).toLocaleDateString().toLowerCase();
		return dateStr.includes(q);
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
		key: 'date',
		label: 'Date',
		sortable: true,
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
const deleteItem = async (row: Inventory) => {
	const confirmed = await confirm('Inventory Record');
	if (confirmed) {
		inventoryStore.deleteInventory(row._id.toString());
	}
};
</script>

<template>
	<div>
		<UInput v-model="search" placeholder="Search by date..." class="mb-2" />
		<UTable
			:rows="rows"
			:columns="columns"
			:loading="inventoryStore.loading"
			v-model:expand="expand">
			<template #empty-state>
				<div class="flex flex-col items-center justify-center py-6 gap-3">
					<span class="text-sm text-gray-500">No inventory records found</span>
				</div>
			</template>
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

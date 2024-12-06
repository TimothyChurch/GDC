<script setup>
// Bottle Store

const bottleStore = useBottleStore();

// Table Parameters

const columns = [
	{
		key: 'name',
		label: 'Name',
		sortable: true,
	},
	{
		key: 'abv',
		label: 'ABV',
	},
	{
		key: 'recipe',
		label: 'Recipe',
	},
	{
		key: 'actions',
	},
];

const page = ref(1);
const pageCount = ref(5);

const rows = computed(() => {
	return bottleStore.bottles.slice(
		(page.value - 1) * pageCount.value,
		page.value * pageCount.value
	);
});

// Table Buttons

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
</script>

<template>
	<div class="flex flex-col">
		{{ formModalStatus }}
		{{ formSelection }}
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

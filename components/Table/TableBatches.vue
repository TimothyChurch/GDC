<script setup>
const router = useRouter();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

const columns = [
	{ key: 'recipe', label: 'Recipe' },
	{ key: 'batchCost', label: 'Batch Costs' },
	{ key: 'status', label: 'Status' },
	{ key: 'actions' },
];
const items = (row) => [
	[
		{
			label: 'Details',
			click: () => router.push(`/admin/batch/${row._id}`),
		},
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
const addItem = () => {
	batchStore.resetBatch();
	formSelection.value = 'FormBatch';
	toggleFormModal();
};
const editItem = (row) => {
	batchStore.batch = row;
	formSelection.value = 'FormBatch';
	toggleFormModal();
};
const deleteItem = (row) => {
	batchStore.deleteBatch(row._id.toString());
};
</script>

<template>
	<div>
		<UTable
			:rows="batchStore.batches"
			:columns="columns">
			<template #recipe-data="{ row }">
				{{ recipeStore.getRecipeById(row.recipe)?.name }}
			</template>
			<template #batchCost-data="{ row }">
				{{ Dollar.format(row.batchCost) }}
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

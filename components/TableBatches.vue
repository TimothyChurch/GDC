<script setup>
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

const columns = [
	{ key: 'recipe', label: 'Recipe' },
	{ key: 'brewDate', label: 'Brew Date' },
	{ key: 'fermenter', label: 'Fermenter' },
	{ key: 'distillDate', label: 'Distill Date' },
	{ key: 'notes', label: 'Notes' },
	{ key: 'actions' },
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
			<template #brewDate-data="{ row }">
				{{ new Date(row.brewDate).toLocaleDateString() }}
			</template>
			<template #fermenter-data="{ row }">
				{{ vesselStore.getVesselById(row.fermenter) }}
			</template>
			<template #distillDate-data="{ row }">
				{{ new Date(row.distillDate).toLocaleDateString() }}
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

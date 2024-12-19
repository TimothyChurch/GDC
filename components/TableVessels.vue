<script setup>
const vesselStore = useVesselStore();

const columns = [
	{
		key: 'name',
		label: 'Name',
		sortable: true,
	},
	{
		key: 'type',
		label: 'Type',
		sortable: true,
	},
	{
		key: 'current',
		label: 'Current',
	},
	{
		key: 'actions',
	},
];

const items = (row) => [
	[
		{
			label: 'Empty Vessel',
			click: () => vesselStore.emptyVessel(row._id),
		},
		{
			label: 'Edit',
			icon: 'i-heroicons-pencil-square-20-solid',
			click: () => editVessel(row),
		},
		{
			label: 'Delete',
			icon: 'i-heroicons-trash-20-solid',
			click: () => deleteVessel(row._id),
		},
	],
];

const addVessel = () => {
	vesselStore.resetVessel();
	formSelection.value = 'FormVessel';
	toggleFormModal();
};
const editVessel = (row) => {
	vesselStore.vessel = row;
	formSelection.value = 'FormVessel';
	toggleFormModal();
};
const deleteVessel = (row) => {
	vesselStore.deleteVessel(row._id);
};
</script>

<template>
	<div>
		<UTable
			:rows="vesselStore.vessels"
			:columns="columns">
			<template #actions-header>
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-plus-20-solid"
					@click="addVessel()" />
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

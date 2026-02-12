<script setup>
const purchaseOrderStore = usePurchaseOrderStore();
const contactStore = useContactStore();
const itemStore = useItemStore();
const { confirm } = useDeleteConfirm();

const columns = [
	{
		label: 'Status',
		key: 'status',
	},
	{
		label: 'Vendor',
		key: 'vendor',
	},
	{
		label: 'Total Amount',
		key: 'total',
	},
	{
		label: 'Date',
		key: 'date',
	},
	{
		key: 'actions',
	},
];
const expand = ref({
	openedRows: [purchaseOrderStore.purchaseOrders],
	row: {},
});
const itemsColumns = [
	{
		label: 'Item',
		key: 'item',
	},
	{
		label: 'Quantity',
		key: 'quantity',
	},
	{
		label: 'Size',
		key: 'size',
	},
	{
		label: 'Price',
		key: 'price',
	},
	{
		label: 'Total',
		key: 'total',
	},
];
const actionItems = (row) => [
	[
		{
			label: 'Edit',
			icon: 'i-heroicons-pencil-square-20-solid',
			click: () => editPurchaseOrder(row),
		},
		{
			label: 'Delete',
			icon: 'i-heroicons-trash-20-solid',
			click: () => deletePurchaseOrder(row),
		},
	],
];
const addPurchaseOrder = () => {
	purchaseOrderStore.resetCurrentPurchaseOrder();
	formSelection.value = 'FormPurchaseOrder';
	toggleFormModal();
};
const editPurchaseOrder = (row) => {
	purchaseOrderStore.purchaseOrder = row;
	formSelection.value = 'FormPurchaseOrder';
	toggleFormModal();
};
const deletePurchaseOrder = async (row) => {
	const vendorName = contactStore.getContactById(row.vendor)?.businessName || 'this order';
	const confirmed = await confirm('Purchase Order', vendorName);
	if (confirmed) {
		purchaseOrderStore.deletePurchaseOrder(row._id);
	}
};
</script>

<template>
	<div>
		<UTable
			:rows="purchaseOrderStore.purchaseOrders"
			:columns="columns"
			:loading="purchaseOrderStore.loading"
			v-model:expand="expand">
			<template #empty-state>
				<div class="flex flex-col items-center justify-center py-6 gap-3">
					<span class="text-sm text-gray-500">No purchase orders found</span>
				</div>
			</template>
			<template #vendor-data="{ row }">
				<span v-if="contactStore.getContactById(row.vendor)?.firstName">
					{{ contactStore.getContactById(row.vendor).firstName }}
					{{ contactStore.getContactById(row.vendor).lastName }}
				</span>
				<span v-else>{{
					contactStore.getContactById(row.vendor)?.businessName
				}}</span>
			</template>
			<template #total-data="{ row }">
				{{ Dollar.format(row.total) }}
			</template>
			<template #date-data="{ row }">
				{{ new Date(row.date).toLocaleDateString() }}
			</template>
			<template #expand="{ row }">
				<UTable
					:rows="row.items"
					:columns="itemsColumns">
					<template #item-data="{ row }">
						{{ itemStore.getItemById(row.item).name }}
					</template>
					<template #size-data="{ row }">
						{{ row.size }} {{ row.sizeUnit }}
					</template>
					<template #price-data="{ row }">
						{{ Dollar.format(row.price) }}
					</template>
					<template #total-data="{ row }">
						{{ Dollar.format(row.price * row.quantity) }}
					</template>
				</UTable>
			</template>
			<template #actions-header>
				<UButton
					color="gray"
					variant="ghost"
					icon="i-heroicons-plus-20-solid"
					@click="addPurchaseOrder()" />
			</template>
			<template #actions-data="{ row }">
				<UDropdown :items="actionItems(row)">
					<UButton
						color="gray"
						variant="ghost"
						icon="i-heroicons-ellipsis-horizontal-20-solid" />
				</UDropdown>
			</template>
		</UTable>
	</div>
</template>

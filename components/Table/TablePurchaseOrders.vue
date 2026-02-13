<script setup>
const purchaseOrderStore = usePurchaseOrderStore();
const contactStore = useContactStore();
const itemStore = useItemStore();
const { confirm } = useDeleteConfirm();

const search = ref('');
const page = ref(1);
const pageCount = ref(10);

const filteredData = computed(() => {
	if (!search.value) return purchaseOrderStore.purchaseOrders;
	const q = search.value.toLowerCase();
	return purchaseOrderStore.purchaseOrders.filter((po) => {
		const contact = contactStore.getContactById(po.vendor);
		const vendorName = (contact?.businessName || `${contact?.firstName || ''} ${contact?.lastName || ''}`).toLowerCase();
		const status = po.status?.toLowerCase() || '';
		return vendorName.includes(q) || status.includes(q);
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
		label: 'Status',
		key: 'status',
		sortable: true,
	},
	{
		label: 'Vendor',
		key: 'vendor',
		sortable: true,
	},
	{
		label: 'Total Amount',
		key: 'total',
		sortable: true,
	},
	{
		label: 'Date',
		key: 'date',
		sortable: true,
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
		<UInput v-model="search" placeholder="Search purchase orders..." class="mb-2" />
		<div class="overflow-x-auto">
			<UTable
				:rows="rows"
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
		<div class="flex flex-col sm:flex-row justify-between gap-2">
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

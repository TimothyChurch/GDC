<script setup>
const route = useRoute();
// Access Store instances
const itemStore = useItemStore();
const purchaseOrderStore = usePurchaseOrderStore();
const contactStore = useContactStore();
// Set up computed properties
const item = computed(() => itemStore.getItemById(route.params._id));
const purchaseOrders = computed(() =>
	purchaseOrderStore.getPurchaseOrdersByItemId(route.params._id)
);
// Purchase order table info
const columns = [
	{ key: 'date', label: 'Date' },
	{ key: 'status', label: 'Status' },
	{ key: 'vendor', label: 'Vendor' },
	{ key: 'quantity', label: 'Quantity' },
	{ key: 'size', label: 'Size' },
	{ key: 'price', label: 'Price' },
	{ key: 'total', label: 'Total' },
	{ key: 'actions', label: 'Actions' },
];
const selectedItem = (row) => {
	return row.items.filter((item) => item.item === route.params._id)[0];
};
</script>

<template>
	<UCard>
		<template #header>
			<h1 class="font-bold text-xl">Purchase History</h1>
		</template>
		<UTable
			:rows="purchaseOrders"
			:columns="columns">
			<template #date-data="{ row }">
				{{ new Date(row.date).toLocaleDateString() }}
			</template>
			<template #vendor-data="{ row }">
				{{ contactStore.getContactById(row.vendor)?.businessName }}
			</template>
			<template #quantity-data="{ row }">
				{{ selectedItem(row)?.quantity }}
			</template>
			<template #size-data="{ row }">
				{{ selectedItem(row)?.size }} {{ selectedItem(row)?.sizeUnit }}
			</template>
			<template #price-data="{ row }">
				{{ Dollar.format(selectedItem(row)?.price) }}
			</template>
			<template #total-data="{ row }">
				{{
					Dollar.format(selectedItem(row)?.quantity * selectedItem(row)?.price)
				}}
			</template>
		</UTable>
	</UCard>
</template>

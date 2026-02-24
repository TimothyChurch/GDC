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
	{ accessorKey: 'date', header: 'Date' },
	{ accessorKey: 'status', header: 'Status' },
	{ accessorKey: 'vendor', header: 'Vendor' },
	{ accessorKey: 'quantity', header: 'Quantity' },
	{ accessorKey: 'size', header: 'Size' },
	{ accessorKey: 'price', header: 'Price' },
	{ accessorKey: 'total', header: 'Total' },
	{ accessorKey: 'actions', header: 'Actions' },
];
const selectedItem = (row) => {
	return row.items.filter((item) => item.item === route.params._id)[0];
};

// Panel slide-over
import { LazyPanelPurchaseOrder } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelPurchaseOrder);
const openPanel = async () => await panel.open();

const newPurchaseOrder = () => {
	purchaseOrderStore.resetCurrentPurchaseOrder();
	openPanel();
}
</script>

<template>
	<UCard>
		<template #header>
			<div class="flex justify-between">
			<h1 class="font-bold text-xl">Purchase History</h1>
			<UButton @click="newPurchaseOrder()">Add Purchase History</UButton>
		</div>
		</template>
		<UTable
			:data="purchaseOrders"
			:columns="columns">
			<template #date-cell="{ row }">
				{{ new Date(row.original.date).toLocaleDateString() }}
			</template>
			<template #vendor-cell="{ row }">
				{{ contactStore.getContactById(row.original.vendor)?.businessName }}
			</template>
			<template #quantity-cell="{ row }">
				{{ selectedItem(row.original)?.quantity }}
			</template>
			<template #size-cell="{ row }">
				{{ selectedItem(row.original)?.size }} {{ selectedItem(row.original)?.sizeUnit }}
			</template>
			<template #price-cell="{ row }">
				{{ Dollar.format(selectedItem(row.original)?.price) }}
			</template>
			<template #total-cell="{ row }">
				{{
					Dollar.format(selectedItem(row.original)?.quantity * selectedItem(row.original)?.price)
				}}
			</template>
		</UTable>
	</UCard>
</template>

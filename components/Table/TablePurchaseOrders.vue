<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { PurchaseOrder } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const props = defineProps<{
  data?: PurchaseOrder[]
}>()

const router = useRouter();
const purchaseOrderStore = usePurchaseOrderStore();
const contactStore = useContactStore();
const itemStore = useItemStore();
const { confirm } = useDeleteConfirm();

const tableData = computed(() => props.data ?? purchaseOrderStore.purchaseOrders)

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => tableData.value.length)
);

const columns: TableColumn<PurchaseOrder>[] = [
  expandColumn<PurchaseOrder>(),
  sortableColumn<PurchaseOrder>("status", "Status"),
  sortableColumn<PurchaseOrder>("vendor", "Vendor", {
    cell: ({ row }) => {
      const contact = contactStore.getContactById(row.original.vendor);
      if (contact?.firstName) return `${contact.firstName} ${contact.lastName}`;
      return contact?.businessName || "Unknown";
    },
  }),
  sortableColumn<PurchaseOrder>("total", "Total Amount", {
    cell: ({ row }) => Dollar.format(row.original.total),
  }),
  sortableColumn<PurchaseOrder>("date", "Date", {
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  }),
  actionsColumn<PurchaseOrder>((row) => {
    const items: any[] = [
      {
        label: "View Details",
        onSelect() {
          router.push(`/admin/purchaseOrders/${row.original._id}`);
        },
      },
      {
        label: "Edit order",
        onSelect() {
          purchaseOrderStore.purchaseOrder = JSON.parse(JSON.stringify(row.original));
          openPanel();
        },
      },
    ];

    // Add "Mark as Received" if PO is not already Delivered or Cancelled
    if (row.original.status !== "Delivered" && row.original.status !== "Cancelled") {
      items.push({
        label: "Mark as Received",
        async onSelect() {
          purchaseOrderStore.purchaseOrder = JSON.parse(JSON.stringify(row.original));
          purchaseOrderStore.purchaseOrder.status = "Delivered";
          const result = await purchaseOrderStore.updatePurchaseOrder();
          // Update item purchase histories
          result.items.forEach((item: any) => {
            const foundItem = itemStore.items.find((i) => i._id === item.item);
            if (foundItem && !foundItem.purchaseHistory?.includes(result._id)) {
              itemStore.item = foundItem;
              itemStore.item.purchaseHistory?.push(result._id);
              itemStore.updateItem();
            }
          });
          // Auto-update inventory
          await purchaseOrderStore.receivePurchaseOrder(result._id);
        },
      });
    }

    items.push({
      label: "Delete order",
      variant: "danger",
      async onClick() {
        const vendorName = contactStore.getContactById(row.original.vendor)?.businessName || "this order";
        const confirmed = await confirm("Purchase Order", vendorName);
        if (confirmed) {
          purchaseOrderStore.deletePurchaseOrder(row.original._id);
        }
      },
    });

    return items;
  }),
];

// Panel slide-over
import { LazyPanelPurchaseOrder } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelPurchaseOrder);
const openPanel = async () => await panel.open();

const addPurchaseOrder = () => {
  purchaseOrderStore.resetCurrentPurchaseOrder();
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="purchaseOrderStore.loading"
    search-placeholder="Search purchase orders..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="addPurchaseOrder" variant="ghost">Add Order</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="tableData"
        :columns="columns"
        :loading="purchaseOrderStore.loading"
        :empty="'No purchase orders found'"
        @select="(_e: Event, row: any) => router.push(`/admin/purchaseOrders/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      >
        <template #expanded="{ row }">
          <div class="py-2 px-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-parchment/60">
                  <th class="pb-1">Item</th>
                  <th class="pb-1">Quantity</th>
                  <th class="pb-1">Size</th>
                  <th class="pb-1">Price</th>
                  <th class="pb-1">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in row.original.items" :key="idx">
                  <td>{{ itemStore.getItemById(item.item)?.name || 'Unknown' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ item.size }} {{ item.sizeUnit }}</td>
                  <td>{{ Dollar.format(item.price) }}</td>
                  <td>{{ Dollar.format(item.price * item.quantity) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="po in tableData.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())"
        :key="po._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="router.push(`/admin/purchaseOrders/${po._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ contactStore.getContactById(po.vendor)?.businessName || `${contactStore.getContactById(po.vendor)?.firstName || ''} ${contactStore.getContactById(po.vendor)?.lastName || ''}`.trim() || 'Unknown' }}</div>
            <div class="text-xs text-parchment/60">{{ new Date(po.date).toLocaleDateString() }}</div>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
            :class="{
              'bg-amber/15 text-amber border-amber/20': po.status === 'Pending',
              'bg-blue-500/15 text-blue-400 border-blue-500/20': po.status === 'Confirmed',
              'bg-purple-500/15 text-purple-400 border-purple-500/20': po.status === 'Shipped',
              'bg-green-500/15 text-green-400 border-green-500/20': po.status === 'Delivered',
              'bg-red-500/15 text-red-400 border-red-500/20': po.status === 'Cancelled',
            }"
          >
            {{ po.status || 'Pending' }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Items</span>
            <div class="text-parchment/70">{{ po.items?.length || 0 }} item{{ (po.items?.length || 0) !== 1 ? 's' : '' }}</div>
          </div>
          <div>
            <span class="text-parchment/60">Total</span>
            <div class="text-copper font-semibold">{{ Dollar.format(po.total || 0) }}</div>
          </div>
        </div>
      </div>
      <div v-if="tableData.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No purchase orders found
      </div>
    </div>
  </TableWrapper>
</template>

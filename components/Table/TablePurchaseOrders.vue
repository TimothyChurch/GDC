<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { PurchaseOrder } from "~/types";
import type { Row } from "@tanstack/vue-table";

const props = defineProps<{
  data?: PurchaseOrder[]
}>()

const router = useRouter();
const purchaseOrderStore = usePurchaseOrderStore();
const contactStore = useContactStore();
const itemStore = useItemStore();
const { confirm } = useDeleteConfirm();

const tableData = computed(() => props.data ?? purchaseOrderStore.purchaseOrders)

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

const columns: TableColumn<PurchaseOrder>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Status",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
  },
  {
    accessorKey: "vendor",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Vendor",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => {
      const contact = contactStore.getContactById(row.original.vendor);
      if (contact?.firstName) return `${contact.firstName} ${contact.lastName}`;
      return contact?.businessName || "Unknown";
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Total Amount",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => Dollar.format(row.original.total),
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Date",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row),
            "aria-label": "Actions dropdown",
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto",
              "aria-label": "Actions dropdown",
            })
        )
      );
    },
  },
];

function getRowItems(row: Row<PurchaseOrder>) {
  return [
    {
      label: "View Details",
      onSelect() {
        router.push(`/admin/purchaseOrders/${row.original._id}`);
      },
    },
    {
      label: "Edit order",
      onSelect() {
        purchaseOrderStore.purchaseOrder = row.original;
        openPanel();
      },
    },
    {
      label: "Delete order",
      variant: "danger",
      async onClick() {
        const vendorName = contactStore.getContactById(row.original.vendor)?.businessName || "this order";
        const confirmed = await confirm("Purchase Order", vendorName);
        if (confirmed) {
          purchaseOrderStore.deletePurchaseOrder(row.original._id);
        }
      },
    },
  ];
}

// Panel slide-over
import { PanelPurchaseOrder } from "#components";
const overlay = useOverlay();
const panel = overlay.create(PanelPurchaseOrder);
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
    :total-items="tableData.length"
    :loading="purchaseOrderStore.loading"
    search-placeholder="Search purchase orders..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="addPurchaseOrder" variant="ghost">Add Order</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :data="tableData"
        :columns="columns"
        :loading="purchaseOrderStore.loading"
        :empty="{ icon: 'i-lucide-clipboard-list', label: 'No purchase orders found' }"
        @select="(row: PurchaseOrder) => router.push(`/admin/purchaseOrders/${row._id}`)"
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

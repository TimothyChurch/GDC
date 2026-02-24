<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Production } from "~/types";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";

const router = useRouter();
const productionsStore = useProductionStore();
const vesselStore = useVesselStore();
const bottlestore = useBottleStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const sorting = ref([{ id: "date", desc: true }]);

const tableRef = useTemplateRef('tableRef');
const filteredTotal = computed(() =>
  tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? productionsStore.productions.length
);

const columns: TableColumn<Production>[] = [
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
    cell: ({ row }) =>
      new Date(row.original.date).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  },
  {
    accessorKey: "vessel",
    header: "Vessel",
    cell: ({ row }) =>
      vesselStore.vessels
        .filter((vessel) => row.original.vessel.includes(vessel._id))
        .map((vessel) => vessel.name)
        .join(", ") || "N/A",
  },
  {
    accessorKey: "bottle",
    header: "Bottle",
    cell: ({ row }) => bottlestore.getName(row.original.bottle) || "Unknown",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "productionCost",
    header: "Production Cost",
    cell: ({ row }) => Dollar.format(row.original.productionCost),
  },
  {
    accessorKey: "bottleCost",
    header: "Bottle Cost",
    cell: ({ row }) => Dollar.format(row.original.bottleCost),
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

function getRowItems(row: Row<Production>) {
  return [
    {
      label: "View Details",
      onSelect() {
        router.push(`/admin/production/${row.original._id}`);
      },
    },
    {
      label: "Edit production",
      onSelect() {
        productionsStore.production = JSON.parse(JSON.stringify(row.original));
        openPanel();
      },
    },
    {
      label: "Delete production",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Production", bottlestore.getName(row.original.bottle));
        if (confirmed) {
          await productionsStore.deleteProduction(row.original._id);
        }
      },
    },
  ];
}

// Panel slide-over
import { LazyPanelProduction } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelProduction);
const openPanel = async () => await panel.open();

const newItem = () => {
  productionsStore.resetProduction();
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="productionsStore.loading"
    search-placeholder="Search productions..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="newItem" variant="ghost">Add Production</UButton>
    </template>

    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        v-model:sorting="sorting"
        :data="productionsStore.productions"
        :columns="columns"
        :loading="productionsStore.loading"
        :empty="'No productions found'"
        @select="(_e: Event, row: any) => router.push(`/admin/production/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      />
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="prod in productionsStore.productions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())"
        :key="prod._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="router.push(`/admin/production/${prod._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ bottlestore.getName(prod.bottle) || 'Unknown' }}</div>
            <div class="text-xs text-parchment/60">{{ new Date(prod.date).toLocaleDateString() }}</div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/15 text-gold border border-gold/20">
            {{ prod.quantity }} bottles
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Total Cost</span>
            <div class="text-copper font-semibold">{{ Dollar.format(prod.productionCost || 0) }}</div>
          </div>
          <div>
            <span class="text-parchment/60">Per Bottle</span>
            <div class="text-parchment/70">{{ Dollar.format(prod.bottleCost || 0) }}</div>
          </div>
        </div>
      </div>
      <div v-if="productionsStore.productions.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No productions found
      </div>
    </div>
  </TableWrapper>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Inventory } from "~/types";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";

const inventoryStore = useInventoryStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

const tableRef = useTemplateRef('tableRef');
const filteredTotal = computed(() =>
  tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? inventoryStore.inventories.length
);

const columns: TableColumn<Inventory>[] = [
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

function getRowItems(row: Row<Inventory>) {
  return [
    {
      label: "Edit record",
      onSelect() {
        inventoryStore.inventory = JSON.parse(JSON.stringify(row.original));
        openPanel();
      },
    },
    {
      label: "Delete record",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Inventory Record");
        if (confirmed) {
          inventoryStore.deleteInventory(row.original._id.toString());
        }
      },
    },
  ];
}

// Panel slide-over
import { LazyPanelInventory } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelInventory);
const openPanel = async () => await panel.open();

const addItem = () => {
  inventoryStore.resetInventory();
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="inventoryStore.loading"
    search-placeholder="Search by date..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="addItem" variant="ghost">Add Record</UButton>
    </template>
    <UTable
      ref="tableRef"
      v-model:global-filter="search"
      v-model:pagination="pagination"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
      :data="inventoryStore.inventories"
      :columns="columns"
      :loading="inventoryStore.loading"
      :empty="'No inventory records found'"
    />
  </TableWrapper>
</template>

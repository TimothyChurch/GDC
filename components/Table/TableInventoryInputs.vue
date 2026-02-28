<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Inventory } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const inventoryStore = useInventoryStore();
const { confirm } = useDeleteConfirm();

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => inventoryStore.inventories.length)
);

const columns: TableColumn<Inventory>[] = [
  sortableColumn<Inventory>("date", "Date", {
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  }),
  actionsColumn<Inventory>((row) => [
    {
      label: "Edit record",
      onSelect() {
        inventoryStore.inventory = structuredClone(toRaw(row.original));
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
  ]),
];

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
      <UButton icon="i-lucide-plus-circle" size="xl" @click="addItem" variant="ghost">Add Record</UButton>
    </template>
    <UTable
      ref="tableRef"
      v-model:global-filter="search"
      v-model:pagination="pagination"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
      :data="inventoryStore.inventories"
      :columns="columns"
      :loading="inventoryStore.loading"
    >
      <template #empty>
        <BaseEmptyState icon="i-lucide-archive" title="No inventory records found" description="Add inventory records to track stock levels" action-label="Add Record" @action="addItem" />
      </template>
    </UTable>
  </TableWrapper>
</template>

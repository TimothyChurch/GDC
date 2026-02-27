<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Vessel } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const vesselStore = useVesselStore();
const { confirm } = useDeleteConfirm();

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => vesselStore.vessels.length)
);

const columns: TableColumn<Vessel>[] = [
  sortableColumn<Vessel>("name", "Name"),
  sortableColumn<Vessel>("type", "Type"),
  {
    accessorKey: "current",
    header: "Current",
  },
  actionsColumn<Vessel>((row) => [
    {
      label: "View Details",
      onSelect() {
        navigateTo(`/admin/vessels/${row.original._id}`);
      },
    },
    {
      label: "Empty Vessel",
      onSelect() {
        vesselStore.emptyVessel(row.original._id);
      },
    },
    {
      label: "Edit vessel",
      onSelect() {
        vesselStore.vessel = JSON.parse(JSON.stringify(row.original));
        openPanel();
      },
    },
    {
      label: "Delete vessel",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Vessel", row.original.name);
        if (confirmed) {
          vesselStore.deleteVessel(row.original._id);
        }
      },
    },
  ]),
];

// Panel slide-over
import { LazyPanelVessel } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelVessel);
const openPanel = async () => await panel.open();

const addVessel = () => {
  vesselStore.resetVessel();
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="vesselStore.loading"
    search-placeholder="Search vessels..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="addVessel" variant="ghost">Add Vessel</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="vesselStore.vessels"
        :columns="columns"
        :loading="vesselStore.loading"
        :empty="'No vessels found'"
      />
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="vessel in vesselStore.vessels"
        :key="vessel._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ vessel.name }}</div>
            <div class="text-xs text-parchment/60">{{ vessel.type || 'Unknown type' }}</div>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
            :class="vessel.current ? 'bg-amber/15 text-amber border-amber/25' : 'bg-brown/15 text-parchment/60 border-brown/25'"
          >
            {{ vessel.current ? 'In Use' : 'Empty' }}
          </span>
        </div>
        <div v-if="vessel.current" class="text-xs">
          <span class="text-parchment/60">Contents: </span>
          <span class="text-parchment/70">{{ vessel.current }}</span>
        </div>
      </div>
      <div v-if="vesselStore.vessels.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No vessels found
      </div>
    </div>
  </TableWrapper>
</template>

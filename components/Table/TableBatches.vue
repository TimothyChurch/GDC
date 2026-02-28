<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Batch } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const props = defineProps<{ data?: Batch[] }>();

const router = useRouter();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const { confirm } = useDeleteConfirm();

const tableData = computed(() => {
  const data = props.data ?? batchStore.batches;
  return props.data ? data : data.filter(b => b.currentStage !== 'Barreled');
});

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => tableData.value.length)
);

import { STAGE_DISPLAY, stageBgColor, stageTextColor, hasStageVolumes, getActiveStages, getStageVolume } from '~/composables/batchPipeline'

function stageColor(stage: string) {
  const display = STAGE_DISPLAY[stage]
  if (!display) return 'bg-brown/15 text-parchment/50 border-brown/25'
  return stageBgColor(display.color) + ' ' + stageTextColor(display.color)
}

function statusBadgeColor(status: string) {
  switch (status) {
    case 'active': return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
    case 'completed': return 'bg-green-500/15 text-green-400 border-green-500/25'
    case 'cancelled': return 'bg-red-500/15 text-red-400 border-red-500/25'
    default: return 'bg-brown/15 text-parchment/50 border-brown/25'
  }
}

const columns: TableColumn<Batch>[] = [
  sortableColumn<Batch>("recipe", "Recipe", {
    cell: ({ row }) => recipeStore.getRecipeById(row.original.recipe)?.name || "Unknown",
  }),
  sortableColumn<Batch>("batchCost", "Batch Cost", {
    cell: ({ row }) => Dollar.format(row.original.batchCost || 0),
  }),
  sortableColumn<Batch>("batchSize", "Size", {
    cell: ({ row }) => `${row.original.batchSize || 0} ${row.original.batchSizeUnit || ''}`.trim(),
  }),
  sortableColumn<Batch>("currentStage", "Stage", {
    cell: ({ row }) => {
      const batch = row.original;
      const badges: any[] = [];

      if (hasStageVolumes(batch) && getActiveStages(batch).length > 1) {
        const unit = (batch.batchSizeUnit || 'gallon').replace(/gallon/i, 'g').replace(/liter/i, 'L');
        for (const stage of getActiveStages(batch)) {
          const vol = getStageVolume(batch, stage);
          badges.push(
            h("span", {
              class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", stageColor(stage)],
            }, `${stage} ${vol}${unit}`)
          );
        }
      } else {
        badges.push(
          h("span", {
            class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", stageColor(batch.currentStage || "")],
          }, batch.currentStage || "Unknown")
        );
      }

      if (batch.status !== 'active') {
        badges.push(
          h("span", {
            class: ["px-1.5 py-0.5 rounded-full text-[10px] font-semibold border", statusBadgeColor(batch.status || "")],
          }, batch.status)
        );
      }

      return h("div", { class: "flex items-center gap-1.5 flex-wrap" }, badges);
    },
  }),
  actionsColumn<Batch>((row) => [
    {
      label: "Details",
      onSelect() {
        router.push(`/admin/batch/${row.original._id}`);
      },
    },
    {
      label: "Edit batch",
      onSelect() {
        batchStore.batch = structuredClone(toRaw(row.original));
        openPanel();
      },
    },
    {
      label: "Delete batch",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Batch", recipeStore.getRecipeById(row.original.recipe)?.name);
        if (confirmed) {
          batchStore.deleteBatch(row.original._id.toString());
        }
      },
    },
  ]),
];

// Panel slide-over
import { LazyPanelBatch } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelBatch);
const openPanel = async () => await panel.open();

const addItem = () => {
  batchStore.resetBatch();
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="batchStore.loading"
    search-placeholder="Search batches..."
  >
    <template #actions>
      <UButton icon="i-lucide-plus-circle" size="xl" @click="addItem" variant="ghost">Add Batch</UButton>
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
        :loading="batchStore.loading"
        @select="(_e: Event, row: any) => router.push(`/admin/batch/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      >
        <template #empty>
          <BaseEmptyState icon="i-lucide-beer" title="No batches found" description="Create your first batch to get started" action-label="Add Batch" @action="addItem" />
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="batch in tableData.filter(b => {
          if (!search) return true;
          const term = search.toLowerCase();
          const recipeName = recipeStore.getRecipeById(b.recipe)?.name || '';
          return recipeName.toLowerCase().includes(term) || (b.currentStage || '').toLowerCase().includes(term);
        })"
        :key="batch._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="router.push(`/admin/batch/${batch._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown' }}</div>
            <div class="text-xs text-parchment/60">{{ batch.batchSize }} {{ batch.batchSizeUnit }}</div>
          </div>
          <div class="flex flex-wrap gap-1">
            <template v-if="hasStageVolumes(batch) && getActiveStages(batch).length > 1">
              <span
                v-for="stage in getActiveStages(batch)"
                :key="stage"
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                :class="stageColor(stage)"
              >
                {{ stage }} {{ getStageVolume(batch, stage) }}{{ (batch.batchSizeUnit || 'gallon').replace(/gallon/i, 'g').replace(/liter/i, 'L') }}
              </span>
            </template>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              :class="stageColor(batch.currentStage || '')"
            >
              {{ batch.currentStage || 'Unknown' }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Batch Cost</span>
            <div class="text-copper font-semibold">{{ Dollar.format(batch.batchCost || 0) }}</div>
          </div>
          <div v-if="batch.createdAt">
            <span class="text-parchment/60">Created</span>
            <div class="text-parchment/70">{{ new Date(batch.createdAt).toLocaleDateString() }}</div>
          </div>
        </div>
      </div>
      <BaseEmptyState v-if="tableData.length === 0" icon="i-lucide-beer" title="No batches found" description="Create your first batch to get started" action-label="Add Batch" @action="addItem" />
    </div>
  </TableWrapper>
</template>

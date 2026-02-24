<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Batch } from "~/types";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";

const props = defineProps<{ data?: Batch[] }>();

const router = useRouter();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

const tableData = computed(() => props.data ?? batchStore.batches);

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
  {
    accessorKey: "recipe",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Recipe",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => recipeStore.getRecipeById(row.original.recipe)?.name || "Unknown",
  },
  {
    accessorKey: "batchCost",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Batch Cost",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => Dollar.format(row.original.batchCost || 0),
  },
  {
    id: "batchSize",
    accessorKey: "batchSize",
    header: "Size",
    cell: ({ row }) => `${row.original.batchSize || 0} ${row.original.batchSizeUnit || ''}`.trim(),
  },
  {
    accessorKey: "currentStage",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Stage",
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
      const batch = row.original;
      const badges: any[] = [];

      if (hasStageVolumes(batch) && getActiveStages(batch).length > 1) {
        // Multi-stage: show each active stage with volume
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

function getRowItems(row: Row<Batch>) {
  return [
    {
      label: "Details",
      onSelect() {
        router.push(`/admin/batch/${row.original._id}`);
      },
    },
    {
      label: "Edit batch",
      onSelect() {
        batchStore.batch = JSON.parse(JSON.stringify(row.original));
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
  ];
}

// Panel slide-over
import { LazyPanelBatch } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelBatch);
const openPanel = async () => await panel.open();

const addItem = () => {
  batchStore.resetBatch();
  openPanel();
};

const tableRef = useTemplateRef('tableRef');
const filteredTotal = computed(() =>
  tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? tableData.value.length
);
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
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="addItem" variant="ghost">Add Batch</UButton>
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
        :empty="'No batches found'"
        @select="(_e: Event, row: any) => router.push(`/admin/batch/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      />
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="batch in tableData"
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
      <div v-if="tableData.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No batches found
      </div>
    </div>
  </TableWrapper>
</template>

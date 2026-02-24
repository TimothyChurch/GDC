<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Bottle } from "~/types";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";

const props = defineProps<{ bottles: Bottle[] }>();

const router = useRouter();
const bottleStore = useBottleStore();
const { confirm } = useDeleteConfirm();
const { isLowStock } = useBottleStock();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

const tableRef = useTemplateRef('tableRef');
const filteredTotal = computed(() =>
  tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? props.bottles.length
);

const columns: TableColumn<Bottle>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Name",
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
    id: "classType",
    header: "Class / Type",
    accessorFn: (row) => `${row.class || ""} ${row.type || ""}`.trim(),
    cell: ({ row }) => {
      const c = row.original.class || "";
      const t = row.original.type || "";
      return t ? `${c} - ${t}` : c || "N/A";
    },
  },
  {
    accessorKey: "abv",
    header: "ABV",
    cell: ({ row }) => row.original.abv ? `${row.original.abv}%` : "N/A",
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Price",
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    },
    cell: ({ row }) => Dollar.format(row.original.price || 0),
  },
  {
    accessorKey: "inStock",
    header: "Status",
    cell: ({ row }) => {
      const badges = [];
      if (row.original.archived) {
        badges.push(
          h("span", {
            class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
            innerHTML: "Archived",
          })
        );
      }
      if (isLowStock(row.original._id)) {
        badges.push(
          h("span", {
            class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-orange-500/15 text-orange-400 border-orange-500/25",
            innerHTML: "Low Stock",
          })
        );
      }
      badges.push(
        h("span", {
          class: [
            "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
            row.original.inStock
              ? "bg-green-500/15 text-green-400 border-green-500/25"
              : "bg-red-500/15 text-red-400 border-red-500/25",
          ],
          innerHTML: row.original.inStock ? "Yes" : "No",
        })
      );
      return h("div", { class: "flex items-center gap-1.5" }, badges);
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

function getRowItems(row: Row<Bottle>) {
  return [
    {
      label: "View Details",
      onSelect() {
        router.push(`/admin/bottles/${row.original._id}`);
      },
    },
    {
      label: "Edit bottle",
      onSelect() {
        bottleStore.bottle = JSON.parse(JSON.stringify(row.original));
        openPanel();
      },
    },
    {
      label: "Delete bottle",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Bottle", row.original.name);
        if (confirmed) {
          bottleStore.deleteBottle(row.original._id);
        }
      },
    },
  ];
}

// Panel slide-over
import { LazyPanelBottle } from "#components";
const overlay = useOverlay();
const panel = overlay.create(LazyPanelBottle);
const openPanel = async () => await panel.open();

const newBottle = () => {
  bottleStore.resetBottle();
  openPanel();
};
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="bottleStore.loading"
    search-placeholder="Search bottles..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="newBottle" variant="ghost">Add Bottle</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="props.bottles"
        :columns="columns"
        :loading="bottleStore.loading"
        :empty="'No bottles match the current filters'"
        @select="(_e: Event, row: any) => router.push(`/admin/bottles/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      />
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="bottle in props.bottles"
        :key="bottle._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="router.push(`/admin/bottles/${bottle._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ bottle.name }}</div>
            <div class="text-xs text-parchment/60">{{ bottle.class }}{{ bottle.type ? ` - ${bottle.type}` : '' }}</div>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              v-if="bottle.archived"
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
            >
              Archived
            </span>
            <span
              v-if="isLowStock(bottle._id)"
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-orange-500/15 text-orange-400 border-orange-500/25"
            >
              Low Stock
            </span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              :class="bottle.inStock ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25'"
            >
              {{ bottle.inStock ? 'In Stock' : 'Out of Stock' }}
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Price</span>
            <div class="text-copper font-semibold">{{ Dollar.format(bottle.price || 0) }}</div>
          </div>
          <div>
            <span class="text-parchment/60">ABV</span>
            <div class="text-parchment/70">{{ bottle.abv ? `${bottle.abv}%` : 'N/A' }}</div>
          </div>
        </div>
      </div>
      <div v-if="props.bottles.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No bottles match the current filters
      </div>
    </div>
  </TableWrapper>
</template>

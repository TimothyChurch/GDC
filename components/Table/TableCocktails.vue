<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Cocktail } from "~/types";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";

const cocktailStore = useCocktailStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

const tableRef = useTemplateRef('tableRef');
const filteredTotal = computed(() =>
  tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? cocktailStore.cocktails.length
);

const columns: TableColumn<Cocktail>[] = [
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "glassware",
    header: "Glassware",
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) =>
      Dollar.format(cocktailStore.cocktailCost(row.original._id.toString())),
  },
  {
    header: "Approx Price",
    cell: ({ row }) =>
      Dollar.format(
        ((cocktailStore.cocktailCost(row.original._id.toString()) - 1.5) /
          2.5) *
          4 +
          7
      ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => Dollar.format(row.original.price),
  },
  {
    accessorKey: "visible",
    header: "Visible",
    cell: ({ row }) => (row.original.visible ? "Yes" : "No"),
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

function getRowItems(row: Row<Cocktail>) {
  return [
    {
      label: "View Details",
      onSelect() {
        navigateTo(`/admin/cocktails/${row.original._id}`);
      },
    },
    {
      label: "Edit cocktail",
      onSelect() {
        cocktailStore.setCocktail(row.original._id.toString());
        openModal();
      },
    },
    {
      label: "Delete cocktail",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Cocktail", row.original.name);
        if (confirmed) {
          cocktailStore.deleteCocktail(row.original._id.toString());
        }
      },
    },
  ];
}
// Modal component info
import { LazyPanelCocktail } from "#components";
const overlay = useOverlay();
const modal = overlay.create(LazyPanelCocktail);
const newCocktail = () => {
  cocktailStore.resetCocktail();
  openModal();
};
const openModal = async () => await modal.open();
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="cocktailStore.loading"
    search-placeholder="Search cocktails..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="newCocktail" variant="ghost">Add Cocktail</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        sticky
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="cocktailStore.cocktails"
        :columns="columns"
        :loading="cocktailStore.loading"
        :empty="'No cocktails found'"
        class="max-h-full"
        @select="(_e: Event, row: any) => navigateTo(`/admin/cocktails/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      >
        <template #expanded="{ row }">
          <TableCocktailExpand :ingredients="row.original.ingredients" />
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="cocktail in cocktailStore.cocktails"
        :key="cocktail._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="navigateTo(`/admin/cocktails/${cocktail._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ cocktail.name }}</div>
            <div class="text-xs text-parchment/60">{{ cocktail.glassware || 'No glassware' }}</div>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
            :class="cocktail.visible ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25'"
          >
            {{ cocktail.visible ? 'Visible' : 'Hidden' }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Cost</span>
            <div class="text-parchment/70">{{ Dollar.format(cocktailStore.cocktailCost(cocktail._id.toString())) }}</div>
          </div>
          <div>
            <span class="text-parchment/60">Price</span>
            <div class="text-copper font-semibold">{{ Dollar.format(cocktail.price || 0) }}</div>
          </div>
          <div>
            <span class="text-parchment/60">Ingredients</span>
            <div class="text-parchment/70">{{ cocktail.ingredients?.length || 0 }}</div>
          </div>
        </div>
      </div>
      <div v-if="cocktailStore.cocktails.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No cocktails found
      </div>
    </div>
  </TableWrapper>
</template>

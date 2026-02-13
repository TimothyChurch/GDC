<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Cocktail } from "~/types";
import type { Row } from "@tanstack/vue-table";

const cocktailStore = useCocktailStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

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
    cell: ({ row }) => (row.original.visible ? "Yes" : "No")  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end",
            },
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
import { ModalCocktail } from "#components";
const overlay = useOverlay();
const modal = overlay.create(ModalCocktail);
const newCocktail = () => {
  cocktailStore.resetCocktail();
  openModal();
};
const openModal = async () => await modal.open();
</script>

<template>
  <div>
    <div class="flex justify-between mb-2">
      <UInput v-model="search" placeholder="Search cocktails..." />
      <UButton
        icon="i-heroicons-plus-circle"
        size="xl"
        @click="newCocktail"
        variant="ghost"
        >Add Cocktail</UButton
      >
    </div>
    <UTable
      sticky
      v-model:global-filter="search"
      v-model:pagination="pagination"
      :data="cocktailStore.cocktails"
      :columns="columns"
      :loading="cocktailStore.loading"
      :empty="{ icon: 'i-lucide-wine', label: 'No cocktails found' }"
      class="max-h-full"
    >
      <template #expanded="{ row }">
        <TableCocktailExpand :ingredients="row.original.ingredients" />
      </template>
    </UTable>
    <div class="flex justify-between items-center mt-2">
      <UFormGroup label="Results per Page">
        <USelect
          :options="[5, 10, 20, 100]"
          :model-value="pagination.pageSize"
          @update:model-value="pagination = { ...pagination, pageSize: Number($event), pageIndex: 0 }" />
      </UFormGroup>
      <UPagination
        :model-value="pagination.pageIndex + 1"
        @update:model-value="pagination = { ...pagination, pageIndex: $event - 1 }"
        :page-count="pagination.pageSize"
        :total="cocktailStore.cocktails.length" />
    </div>
  </div>
</template>

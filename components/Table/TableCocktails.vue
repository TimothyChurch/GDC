<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Cocktail } from "~/types";
import type { Row } from "@tanstack/vue-table";

const cocktailStore = useCocktailStore();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const toast = useToast();

const search = ref("");

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
      onClick() {
        cocktailStore.deleteCocktail(row.original._id.toString());
        toast.add({
          title: "Cocktail deleted!",
          color: "error",
          icon: "i-lucide-trash",
        });
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
  <UTable
    sticky
    :global-filter="search"
    :data="cocktailStore.cocktails"
    :columns="columns"
    class="max-h-full"
  >
    <template #expanded="{ row }">
      <TableCocktailExpand :ingredients="row.original.ingredients" />
    </template>
  </UTable>
  <!-- <UContainer>
    <div class="sticky top-0 flex justify-between">
      <UInput v-model="search" placeholder="Search cocktails" class="mb-4" />
      <UButton
        icon="i-heroicons-plus-circle"
        size="xl"
        @click="newCocktail"
        variant="ghost"
        >Add Cocktail</UButton
      >
    </div>
    <div class="overflow-y-auto">
      <UTable
        sticky
        :global-filter="search"
        :data="cocktailStore.cocktails"
        :columns="columns"
      >
        <template #expanded="{ row }">
          <TableCocktailExpand :ingredients="row.original.ingredients" />
        </template>
      </UTable>
    </div>
  </UContainer> -->
</template>

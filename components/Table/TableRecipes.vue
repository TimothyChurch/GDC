<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Recipe } from "~/types";
import type { Row } from "@tanstack/vue-table";

const recipeStore = useRecipeStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");

const columns: TableColumn<Recipe>[] = [
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
    accessorKey: "class",
    header: "Class",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    header: "Volume",
    cell: ({ row }) =>
      `${row.original.volume} ${row.original.volumeUnit}` || "N/A",
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

function getRowItems(row: Row<Recipe>) {
  return [
    {
      label: "Edit recipe",
      onSelect() {
        recipeStore.setRecipe(row.original._id.toString());
        openModal();
      },
    },
    {
      label: "Delete recipe",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Recipe", row.original.name);
        if (confirmed) {
          recipeStore.deleteRecipe(row.original._id.toString());
        }
      },
    },
  ];
}
// Modal component info
import { ModalRecipe } from "#components";
const overlay = useOverlay();
const modal = overlay.create(ModalRecipe);
const newRecipe = () => {
  recipeStore.resetRecipe();
  openModal();
};
const openModal = async () => await modal.open();
</script>

<template>
  <div>
    <UTable
      :data="recipeStore.recipes"
      :columns="columns"
      :loading="recipeStore.loading"
      :empty="{ icon: 'i-lucide-book-open', label: 'No recipes found' }"
    >
      <template #expanded="{ row }">
        <div v-for="item in row.original.items">
          {{ item }}
        </div>
      </template>
    </UTable>
  </div>
</template>

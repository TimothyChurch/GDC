<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Recipe } from "~/types";
import type { Row } from "@tanstack/vue-table";

const router = useRouter();
const recipeStore = useRecipeStore();
const { confirm } = useDeleteConfirm();

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const search = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 10 });

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
import { PanelRecipe } from "#components";
const overlay = useOverlay();
const modal = overlay.create(PanelRecipe);
const newRecipe = () => {
  recipeStore.resetRecipe();
  openModal();
};
const openModal = async () => await modal.open();
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="recipeStore.recipes.length"
    :loading="recipeStore.loading"
    search-placeholder="Search recipes..."
  >
    <template #actions>
      <UButton icon="i-heroicons-plus-circle" size="xl" @click="newRecipe" variant="ghost">Add Recipe</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :data="recipeStore.recipes"
        :columns="columns"
        :loading="recipeStore.loading"
        :empty="{ icon: 'i-lucide-book-open', label: 'No recipes found' }"
      >
        <template #expanded="{ row }">
          <div v-for="item in row.original.items" :key="item._id">
            {{ item }}
          </div>
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="recipe in recipeStore.recipes"
        :key="recipe._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4"
        @click="router.push(`/admin/recipes/${recipe._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">{{ recipe.name }}</div>
            <div class="text-xs text-parchment/60">{{ recipe.class }}{{ recipe.type ? ` - ${recipe.type}` : '' }}</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Volume</span>
            <div class="text-parchment/70">{{ recipe.volume }} {{ recipe.volumeUnit }}</div>
          </div>
          <div>
            <span class="text-parchment/60">Ingredients</span>
            <div class="text-parchment/70">{{ recipe.items?.length || 0 }} item{{ (recipe.items?.length || 0) !== 1 ? 's' : '' }}</div>
          </div>
        </div>
      </div>
      <div v-if="recipeStore.recipes.length === 0" class="text-center py-6 text-parchment/50 text-sm">
        No recipes found
      </div>
    </div>
  </TableWrapper>
</template>

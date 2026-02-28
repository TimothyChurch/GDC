<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Recipe } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const router = useRouter();
const recipeStore = useRecipeStore();
const itemStore = useItemStore();
const { confirm } = useDeleteConfirm();

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => recipeStore.recipes.length)
);

const columns: TableColumn<Recipe>[] = [
  expandColumn<Recipe>(),
  sortableColumn<Recipe>("name", "Name"),
  sortableColumn<Recipe>("class", "Class"),
  sortableColumn<Recipe>("type", "Type"),
  sortableColumn<Recipe>("volume", "Volume", {
    cell: ({ row }) =>
      `${row.original.volume} ${row.original.volumeUnit}` || "N/A",
  }),
  actionsColumn<Recipe>((row) => [
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
  ]),
];

// Modal component info
import { LazyPanelRecipe } from "#components";
const overlay = useOverlay();
const modal = overlay.create(LazyPanelRecipe);
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
    :total-items="filteredTotal"
    :loading="recipeStore.loading"
    search-placeholder="Search recipes..."
  >
    <template #actions>
      <UButton icon="i-lucide-plus-circle" size="xl" @click="newRecipe" variant="ghost">Add Recipe</UButton>
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="recipeStore.recipes"
        :columns="columns"
        :loading="recipeStore.loading"
        @select="(_e: Event, row: any) => router.push(`/admin/recipes/${row.original._id}`)"
        :ui="{ tr: 'cursor-pointer' }"
      >
        <template #empty>
          <BaseEmptyState icon="i-lucide-book-open" title="No recipes found" description="Create a recipe to define ingredient lists for your batches" action-label="Add Recipe" @action="newRecipe" />
        </template>
        <template #expanded="{ row }">
          <div class="py-2 px-4 space-y-1">
            <div v-for="item in row.original.items" :key="item._id" class="flex items-center gap-2 text-sm">
              <span class="text-parchment">{{ itemStore.getItemById(item._id)?.name || item._id }}</span>
              <span class="text-parchment/60">{{ item.amount }} {{ item.unit }}</span>
            </div>
            <div v-if="!row.original.items?.length" class="text-sm text-parchment/50">No ingredients</div>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="recipe in recipeStore.recipes.filter(r => {
          if (!search) return true;
          const term = search.toLowerCase();
          return r.name.toLowerCase().includes(term) || (r.class || '').toLowerCase().includes(term) || (r.type || '').toLowerCase().includes(term);
        })"
        :key="recipe._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
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
      <BaseEmptyState v-if="recipeStore.recipes.length === 0" icon="i-lucide-book-open" title="No recipes found" description="Create a recipe to define ingredient lists for your batches" action-label="Add Recipe" @action="newRecipe" />
    </div>
  </TableWrapper>
</template>

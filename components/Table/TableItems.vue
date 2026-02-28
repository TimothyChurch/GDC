<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Item } from "~/types";
import { getPaginationRowModel } from "@tanstack/vue-table";

const router = useRouter();
const itemStore = useItemStore();
const { confirm } = useDeleteConfirm();

// Category filtering
const dynamicCategories = useItemCategories();
const categories = computed(() => ["All", ...dynamicCategories.value]);
const selectedCategory = ref<string>("All");

const filteredItems = computed(() => {
  if (selectedCategory.value === "All") return itemStore.items;
  return itemStore.items.filter(
    (i) => (i.category || "Other") === selectedCategory.value
  );
});

const categoryCounts = computed(() => {
  const counts: Record<string, number> = { All: itemStore.items.length };
  for (const cat of dynamicCategories.value) {
    counts[cat] = itemStore.items.filter(
      (i) => (i.category || "Other") === cat
    ).length;
  }
  return counts;
});

const { search, pagination, tableRef, filteredTotal } = useTableState(
  computed(() => filteredItems.value.length)
);

const selectCategory = (cat: string) => {
  selectedCategory.value = cat;
  pagination.value = { ...pagination.value, pageIndex: 0 };
};

const columns: TableColumn<Item>[] = [
  sortableColumn<Item>("name", "Name"),
  sortableColumn<Item>("type", "Type"),
  sortableColumn<Item>("category", "Category"),
  sortableColumn<Item>("vendor", "Vendor", {
    id: "vendor",
    accessorFn: (row) => itemStore.getVendorName(row._id) || "",
    cell: ({ row }) => {
      return itemStore.getVendorName(row.original._id) || "\u2014";
    },
  }),
  sortableColumn<Item>("inventoryUnit", "Inventory Units"),
  sortableColumn<Item>("pricePerUnit", "Price per Unit", {
    id: "pricePerUnit",
    accessorFn: (row) => itemStore.latestPrice(row._id),
    cell: ({ row }) => {
      const price = itemStore.latestPrice(row.original._id);
      if (price > 0) {
        return (
          Dollar.format(price) + " / " + (row.original.inventoryUnit || "")
        );
      }
      return "Price not set";
    },
  }),
  actionsColumn<Item>((row) => [
    {
      label: "Edit item",
      onSelect() {
        itemStore.setItem(row.original._id.toString());
        openModal();
      },
    },
    {
      label: "Delete item",
      variant: "danger",
      async onClick() {
        const confirmed = await confirm("Item", row.original.name);
        if (confirmed) {
          itemStore.deleteItem(row.original._id.toString());
        }
      },
    },
  ]),
];

// Panel slide-over
import { LazyPanelItem } from "#components";
const overlay = useOverlay();
const modal = overlay.create(LazyPanelItem);
const newItem = () => {
  itemStore.resetItem();
  openModal();
};
const openModal = async () => await modal.open();
</script>

<template>
  <TableWrapper
    v-model:search="search"
    v-model:pagination="pagination"
    :total-items="filteredTotal"
    :loading="itemStore.loading"
    search-placeholder="Search items..."
  >
    <template #header>
      <div class="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-hide">
        <button
          v-for="cat in categories"
          :key="cat"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors"
          :class="
            selectedCategory === cat
              ? 'bg-gold/15 text-gold border-gold/20'
              : 'text-parchment/50 border-brown/20 hover:text-parchment/70 hover:border-brown/30'
          "
          @click="selectCategory(cat)"
        >
          {{ cat }}
          <span
            class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
            :class="
              selectedCategory === cat
                ? 'bg-gold/20 text-gold'
                : 'bg-brown/20 text-parchment/60'
            "
          >
            {{ categoryCounts[cat] || 0 }}
          </span>
        </button>
      </div>
    </template>
    <template #actions>
      <UButton
        icon="i-lucide-plus-circle"
        size="xl"
        @click="newItem"
        variant="ghost"
        >Add Item</UButton
      >
    </template>
    <!-- Desktop table -->
    <div class="hidden sm:block">
      <UTable
        ref="tableRef"
        v-model:global-filter="search"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        :data="filteredItems"
        :columns="columns"
        :loading="itemStore.loading"
        @select="
          (_e: Event, row: any) =>
            router.push(`/admin/items/${row.original._id}`)
        "
        :ui="{ tr: 'cursor-pointer' }"
      >
        <template #empty>
          <BaseEmptyState icon="i-lucide-package" title="No items found" description="Add inventory items to track stock and costs" action-label="Add Item" @action="newItem" />
        </template>
      </UTable>
    </div>

    <!-- Mobile card view -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="item in filteredItems.filter(i => {
          if (!search) return true;
          const term = search.toLowerCase();
          return i.name.toLowerCase().includes(term) || (i.type || '').toLowerCase().includes(term) || (i.category || '').toLowerCase().includes(term);
        })"
        :key="item._id"
        class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"
        @click="router.push(`/admin/items/${item._id}`)"
      >
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-parchment">
              {{ item.name }}
            </div>
            <div class="text-xs text-parchment/60">
              {{ item.type || "No type" }}
            </div>
          </div>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brown/15 text-parchment/50 border border-brown/25"
          >
            {{ item.inventoryUnit || "N/A" }}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-parchment/60">Price</span>
            <div class="text-copper font-semibold">
              {{
                itemStore.latestPrice(item._id) > 0
                  ? `${Dollar.format(itemStore.latestPrice(item._id))} / ${item.inventoryUnit}`
                  : "Not set"
              }}
            </div>
          </div>
          <div>
            <span class="text-parchment/60">Vendor</span>
            <div class="text-parchment/70">
              {{ itemStore.getVendorName(item._id) || "\u2014" }}
            </div>
          </div>
        </div>
      </div>
      <BaseEmptyState v-if="filteredItems.length === 0" icon="i-lucide-package" title="No items found" description="Add inventory items to track stock and costs" action-label="Add Item" @action="newItem" />
    </div>
  </TableWrapper>
</template>

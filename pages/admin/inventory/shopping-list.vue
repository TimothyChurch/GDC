<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { ShoppingListItem } from "~/stores/useItemStore";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { getStockStatusColor } from "~/composables/useInventoryCategories";

definePageMeta({ layout: "admin" });

const router = useRouter();
const itemStore = useItemStore();

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");

const columns: TableColumn<ShoppingListItem>[] = [
  {
    id: "name",
    accessorFn: (row) => row.item.name,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Item",
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
      return h(
        "span",
        { class: "text-parchment font-medium" },
        row.original.item.name,
      );
    },
  },
  {
    id: "category",
    accessorFn: (row) => row.item.category || "Other",
    header: "Category",
    cell: ({ row }) => {
      return row.original.item.category || "Other";
    },
  },
  {
    id: "status",
    accessorFn: (row) => row.status,
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const color = getStockStatusColor(status);
      return h(
        UBadge,
        {
          color,
          variant: "subtle",
          size: "sm",
        },
        () => status,
      );
    },
  },
  {
    id: "currentStock",
    accessorFn: (row) => row.currentStock,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Current Stock",
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
      const stock = row.original.currentStock;
      const unit = row.original.item.inventoryUnit || "units";
      const colorClass =
        stock <= 0 ? "text-red-400 font-bold" : "text-amber-400 font-semibold";
      return h("span", { class: colorClass }, `${stock} ${unit}`);
    },
  },
  {
    id: "reorderPoint",
    accessorFn: (row) => row.reorderPoint,
    header: "Reorder Point",
    cell: ({ row }) => {
      const rp = row.original.reorderPoint;
      const unit = row.original.item.inventoryUnit || "units";
      return rp > 0 ? `${rp} ${unit}` : "--";
    },
  },
  {
    id: "usePerMonth",
    accessorFn: (row) => row.usePerMonth,
    header: "Use / Month",
    cell: ({ row }) => {
      const upm = row.original.usePerMonth;
      const unit = row.original.item.inventoryUnit || "units";
      return upm > 0 ? `${upm} ${unit}` : "--";
    },
  },
  {
    id: "suggestedOrderQty",
    accessorFn: (row) => row.suggestedOrderQty,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label: "Suggested Qty",
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
      const qty = row.original.suggestedOrderQty;
      const unit = row.original.item.inventoryUnit || "units";
      return h(
        "span",
        { class: "text-gold font-semibold" },
        `${qty} ${unit}`,
      );
    },
  },
];

const globalFilter = ref("");
const pagination = ref({ pageIndex: 0, pageSize: 20 });

const tableRef = useTemplateRef<{ tableApi?: { getFilteredRowModel: () => { rows: unknown[] } } }>("tableRef");
const filteredTotal = computed((): number =>
  tableRef.value?.tableApi?.getFilteredRowModel().rows.length ??
  itemStore.shoppingListItems.length,
);

// Summary stats
const outOfStockCount = computed(
  () =>
    itemStore.shoppingListItems.filter((i) => i.status === "Out of Stock")
      .length,
);
const lowStockCount = computed(
  () =>
    itemStore.shoppingListItems.filter((i) => i.status === "Low Stock").length,
);
</script>

<template>
  <div>
    <AdminPageHeader
      title="Shopping List"
      subtitle="Items that need to be purchased based on inventory levels and usage"
      icon="i-lucide-shopping-cart"
    >
      <template #actions>
        <UButton
          icon="i-lucide-warehouse"
          variant="outline"
          to="/admin/inventory"
        >
          Inventory
        </UButton>
        <UButton
          icon="i-lucide-receipt"
          to="/admin/purchaseOrders"
        >
          Create Purchase Order
        </UButton>
      </template>
    </AdminPageHeader>

    <!-- Summary cards -->
    <div
      v-if="itemStore.shoppingListItems.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
    >
      <div
        class="bg-charcoal rounded-xl border border-brown/30 p-4 flex items-center gap-3"
      >
        <div
          class="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0"
        >
          <UIcon name="i-lucide-alert-triangle" class="text-xl text-red-400" />
        </div>
        <div>
          <div class="text-2xl font-bold text-red-400">
            {{ outOfStockCount }}
          </div>
          <div class="text-xs text-parchment/60">Out of Stock</div>
        </div>
      </div>
      <div
        class="bg-charcoal rounded-xl border border-brown/30 p-4 flex items-center gap-3"
      >
        <div
          class="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0"
        >
          <UIcon
            name="i-lucide-triangle-alert"
            class="text-xl text-amber-400"
          />
        </div>
        <div>
          <div class="text-2xl font-bold text-amber-400">
            {{ lowStockCount }}
          </div>
          <div class="text-xs text-parchment/60">Low Stock</div>
        </div>
      </div>
      <div
        class="bg-charcoal rounded-xl border border-brown/30 p-4 flex items-center gap-3"
      >
        <div
          class="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center shrink-0"
        >
          <UIcon
            name="i-lucide-shopping-cart"
            class="text-xl text-gold"
          />
        </div>
        <div>
          <div class="text-2xl font-bold text-gold">
            {{ itemStore.shoppingListItems.length }}
          </div>
          <div class="text-xs text-parchment/60">Total Items</div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <TableWrapper
      v-model:search="globalFilter"
      v-model:pagination="pagination"
      :total-items="filteredTotal"
      :loading="itemStore.loading"
      search-placeholder="Search shopping list..."
      empty-icon="i-lucide-package-check"
      empty-label="All stocked up! No items need purchasing."
    >
      <!-- Desktop table -->
      <div class="hidden sm:block">
        <UTable
          ref="tableRef"
          v-model:global-filter="globalFilter"
          v-model:pagination="pagination"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
          :data="itemStore.shoppingListItems"
          :columns="columns"
          :loading="itemStore.loading"
          :empty="'All stocked up! No items need purchasing.'"
          :ui="{ tr: 'cursor-pointer' }"
          @select="
            (_e: Event, row: any) =>
              router.push(`/admin/items/${row.original.item._id}`)
          "
        />
      </div>

      <!-- Mobile card view -->
      <div class="sm:hidden space-y-3">
        <div
          v-if="itemStore.shoppingListItems.length === 0"
          class="text-center py-12"
        >
          <UIcon
            name="i-lucide-package-check"
            class="text-4xl text-green-400/40 mb-3"
          />
          <p class="text-sm text-parchment/50">
            All stocked up! No items need purchasing.
          </p>
        </div>
        <div
          v-for="entry in itemStore.shoppingListItems"
          :key="entry.item._id"
          class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer hover:border-gold/30 transition-all duration-200"
          @click="router.push(`/admin/items/${entry.item._id}`)"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="text-sm font-medium text-parchment">
                {{ entry.item.name }}
              </div>
              <div class="text-xs text-parchment/60">
                {{ entry.item.category || "Other" }}
              </div>
            </div>
            <UBadge
              :color="getStockStatusColor(entry.status)"
              variant="subtle"
              size="sm"
            >
              {{ entry.status }}
            </UBadge>
          </div>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span class="text-parchment/60">Current</span>
              <div
                :class="
                  entry.currentStock <= 0
                    ? 'text-red-400 font-bold'
                    : 'text-amber-400 font-semibold'
                "
              >
                {{ entry.currentStock }}
                {{ entry.item.inventoryUnit || "units" }}
              </div>
            </div>
            <div>
              <span class="text-parchment/60">Use/Mo</span>
              <div class="text-parchment/70">
                {{
                  entry.usePerMonth > 0
                    ? `${entry.usePerMonth} ${entry.item.inventoryUnit || "units"}`
                    : "--"
                }}
              </div>
            </div>
            <div>
              <span class="text-parchment/60">Order Qty</span>
              <div class="text-gold font-semibold">
                {{ entry.suggestedOrderQty }}
                {{ entry.item.inventoryUnit || "units" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TableWrapper>
  </div>
</template>

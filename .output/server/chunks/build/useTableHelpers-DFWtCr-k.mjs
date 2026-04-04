import { ref, useTemplateRef, computed, resolveComponent, h } from 'vue';

function renderSortHeader(column, label) {
  const UButton = resolveComponent("UButton");
  const isSorted = column.getIsSorted();
  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label,
    icon: isSorted ? isSorted === "asc" ? "i-lucide-arrow-up-narrow-wide" : "i-lucide-arrow-down-wide-narrow" : "i-lucide-arrow-up-down",
    class: "-mx-2.5",
    onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
  });
}
function sortableColumn(accessorKey, label, options) {
  const col = {
    header: ({ column }) => renderSortHeader(column, label)
  };
  if (options?.accessorFn) {
    col.id = options.id || accessorKey;
    col.accessorFn = options.accessorFn;
  } else {
    col.accessorKey = accessorKey;
    if (options?.id) {
      col.id = options.id;
    }
  }
  if (options?.cell) {
    col.cell = options.cell;
  }
  return col;
}
function actionsColumn(getItems) {
  return {
    id: "actions",
    cell: ({ row }) => {
      const UButton = resolveComponent("UButton");
      const UDropdownMenu = resolveComponent("UDropdownMenu");
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getItems(row),
            "aria-label": "Actions dropdown"
          },
          () => h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            class: "ml-auto",
            "aria-label": "Actions dropdown"
          })
        )
      );
    }
  };
}
function expandColumn() {
  return {
    id: "expand",
    cell: ({ row }) => {
      const UButton = resolveComponent("UButton");
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-lucide-chevron-down",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : ""
          ]
        },
        onClick: () => row.toggleExpanded()
      });
    }
  };
}
function useTableState(fallbackCount, options) {
  const search = ref("");
  const pagination = ref({
    pageIndex: 0,
    pageSize: 10
  });
  const tableRef = useTemplateRef("tableRef");
  const filteredTotal = computed(
    () => tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? fallbackCount.value
  );
  return { search, pagination, tableRef, filteredTotal };
}

export { actionsColumn as a, expandColumn as e, sortableColumn as s, useTableState as u };
//# sourceMappingURL=useTableHelpers-DFWtCr-k.mjs.map

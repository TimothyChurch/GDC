import type { TableColumn } from "@nuxt/ui";
import type { Row, Column } from "@tanstack/vue-table";

/**
 * Renders a sortable column header button with ascending/descending/unsorted icons.
 * This is the standard pattern used across all admin TanStack UTable components.
 */
function renderSortHeader(column: Column<any, unknown>, label: string) {
  const UButton = resolveComponent("UButton");
  const isSorted = column.getIsSorted();
  return h(UButton, {
    color: "neutral",
    variant: "ghost",
    label,
    icon: isSorted
      ? isSorted === "asc"
        ? "i-lucide-arrow-up-narrow-wide"
        : "i-lucide-arrow-down-wide-narrow"
      : "i-lucide-arrow-up-down",
    class: "-mx-2.5",
    onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
  });
}

/**
 * Creates a sortable table column definition.
 *
 * @param accessorKey - The data key to access on each row
 * @param label - The display label for the column header
 * @param options - Optional overrides: `cell` render function, `id`, `accessorFn`
 * @returns A TableColumn definition with sortable header
 *
 * @example
 * // Simple sortable column
 * sortableColumn<Bottle>("name", "Name")
 *
 * // With custom cell renderer
 * sortableColumn<Bottle>("price", "Price", {
 *   cell: ({ row }) => Dollar.format(row.original.price || 0),
 * })
 *
 * // With accessorFn instead of accessorKey
 * sortableColumn<Contact>("name", "Name", {
 *   id: "name",
 *   accessorFn: (row) => row.businessName || `${row.firstName} ${row.lastName}`.trim(),
 * })
 */
export function sortableColumn<T>(
  accessorKey: string,
  label: string,
  options?: {
    id?: string;
    accessorFn?: (row: T) => any;
    cell?: TableColumn<T>["cell"];
  }
): TableColumn<T> {
  const col: Record<string, any> = {
    header: ({ column }: { column: Column<T, unknown> }) =>
      renderSortHeader(column, label),
  };

  // If accessorFn is provided, use id + accessorFn instead of accessorKey
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

  return col as TableColumn<T>;
}

/**
 * Creates a standard actions dropdown column for table rows.
 *
 * @param getItems - Function that returns the dropdown menu items for a given row
 * @returns A TableColumn definition with the actions dropdown
 *
 * @example
 * actionsColumn<Bottle>((row) => [
 *   { label: "Edit bottle", onSelect() { editBottle(row) } },
 *   { label: "Delete bottle", variant: "danger", async onClick() { await deleteBottle(row) } },
 * ])
 */
export function actionsColumn<T>(
  getItems: (row: Row<T>) => any[]
): TableColumn<T> {
  return {
    id: "actions",
    cell: ({ row }: { row: Row<T> }) => {
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
  } as TableColumn<T>;
}

/**
 * Creates an expand/collapse button column for tables with expandable rows.
 *
 * @returns A TableColumn definition with the expand toggle button
 */
export function expandColumn<T>(): TableColumn<T> {
  return {
    id: "expand",
    cell: ({ row }: { row: Row<T> }) => {
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
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      });
    },
  } as TableColumn<T>;
}

/**
 * Creates standard table state: search ref, pagination ref, template ref, and filtered total computed.
 *
 * @param fallbackCount - A ref or computed that returns the total row count as fallback
 * @param options - Optional: initial pageSize (default 10)
 * @returns Object with search, pagination, tableRef, filteredTotal
 *
 * @example
 * const { search, pagination, tableRef, filteredTotal } = useTableState(
 *   computed(() => store.items.length)
 * )
 */
export function useTableState(
  fallbackCount: Ref<number>,
  options?: { pageSize?: number }
) {
  const search = ref("");
  const pagination = ref({
    pageIndex: 0,
    pageSize: options?.pageSize ?? 10,
  });

  const tableRef = useTemplateRef("tableRef");
  const filteredTotal = computed(
    () =>
      (tableRef.value as any)?.tableApi?.getFilteredRowModel().rows.length ??
      fallbackCount.value
  );

  return { search, pagination, tableRef, filteredTotal };
}

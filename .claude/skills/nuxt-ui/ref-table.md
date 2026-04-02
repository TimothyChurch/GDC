# Nuxt UI v4 — Table (TanStack)

UTable is built on TanStack Table. Import type: `import type { TableColumn } from '@nuxt/ui'`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | - | Row data (**not** `rows`) |
| `columns` | `TableColumn<T>[]` | - | Column definitions |
| `caption` | `string` | - | Table caption |
| `loading` | `boolean` | `false` | Loading state |
| `loadingColor` | Color | - | Loading indicator color |
| `loadingAnimation` | `'carousel' \| 'swing' \| 'elastic'` | - | Animation |
| `empty` | `string` | - | Empty state text |
| `sticky` | `boolean \| 'header' \| 'footer'` | - | Sticky positioning |
| `virtualize` | `boolean \| { estimateSize, overscan }` | - | Virtual scrolling (1000+ rows) |
| `getSubRows` | `Function` | - | Access nested/tree row data |
| `getRowId` | `Function` | - | Custom row identifier |
| `meta` | `object` | - | Metadata for table instance |
| `watchOptions` | `object` | `{ deep: true }` | Reactivity depth control |

## v-model State Props

`globalFilter`, `columnFilters`, `sorting`, `rowSelection`, `expanded`, `pagination` (`{ pageIndex: number, pageSize: number }`), `columnVisibility`, `columnPinning`, `grouping`, `columnOrder`, `columnSizing`

## Options Props (TanStack config)

`paginationOptions`, `sortingOptions`, `globalFilterOptions`, `expandedOptions`, `rowSelectionOptions`, `groupingOptions`, `columnFiltersOptions`

## Column Definition

```ts
const columns: TableColumn<MyType>[] = [
  {
    accessorKey: 'name',          // Data property key
    // OR: accessorFn: (row) => row.firstName + ' ' + row.lastName,
    id: 'name',                   // Unique ID (auto-derived from accessorKey)
    header: 'Name',               // String or render function
    cell: ({ row }) => row.original.name,  // Cell render function
    // footer: ({ column }) => h(...),
    enableSorting: true,
    enableHiding: true,
    size: 200,                    // Column width
    meta: {
      class: { th: 'text-right', td: 'text-right font-mono' },
      style: { th: '', td: '' },
      colspan: { td: 2 },        // Number or function
      rowspan: { td: 1 }         // Number or function
    }
  },
  { id: 'actions', cell: ({ row }) => h(UDropdownMenu, { items: getActions(row) }, ...) }
]
```

## Sortable Header Pattern

```ts
header: ({ column }) => {
  const isSorted = column.getIsSorted()
  return h(UButton, {
    color: 'neutral', variant: 'ghost', label: 'Column Name',
    icon: isSorted
      ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow')
      : 'i-lucide-arrow-up-down',
    class: '-mx-2.5',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
  })
}
```

**Render components in columns**: Use `resolveComponent('UButton')` or import from `#components`.

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `#[columnId]-header` | `{ column, header, table }` | Custom header per column |
| `#[columnId]-cell` | `{ row, cell, column, getValue, table }` | Custom cell per column |
| `#expanded` | `{ row }` | Expanded row content |
| `#empty` | - | Custom empty state |
| `#loading` | - | Custom loading state |
| `#caption` | - | Custom caption |
| `#body-top` | - | Content above body rows |
| `#body-bottom` | - | Content below body rows |

## Events

| Event | Signature | Description |
|-------|-----------|-------------|
| `@select` | `(e: Event, row: TableRow<T>) => void` | Row click |
| `@hover` | `(e: Event, row: TableRow<T> \| null) => void` | Row hover |
| `@contextmenu` | `(e: Event, row: TableRow<T>) => void` | Right-click on row |

## Styling

```vue
<UTable
  :ui="{
    root: '', base: 'min-w-full', thead: '', tbody: '',
    tr: 'cursor-pointer', th: 'px-4 py-3.5', td: 'p-4 text-sm',
    separator: '', empty: 'py-6 text-center', loading: ''
  }"
/>
```

Per-row conditional styling:
```ts
const meta = { class: { tr: (row) => row.original.status === 'error' ? 'bg-error/10' : '' } }
```

## Table API Access

```vue
<UTable ref="table" ... />
<script setup>
const table = useTemplateRef('table')
// table.value?.tableApi?.getFilteredRowModel().rows.length
// table.value?.tableApi?.setPageIndex(0)
// table.value?.tableApi?.getColumn('email')?.setFilterValue(...)
// table.value?.tableApi?.getFilteredSelectedRowModel()
// table.value?.tableApi?.toggleAllPageRowsSelected()
</script>
```

## Pagination Integration

```vue
<UTable
  ref="table"
  v-model:pagination="pagination"
  :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
/>
<UPagination
  :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
  :items-per-page="table?.tableApi?.getState().pagination.pageSize"
  :total="table?.tableApi?.getFilteredRowModel().rows.length"
  @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
/>
```

**Note**: UPagination is 1-based, TanStack is 0-based.

## Advanced Features

- **Row Selection**: Add checkbox column with `row.toggleSelected()`, bind `v-model:row-selection`
- **Column Pinning**: `column.pin('left'|'right')`, bind `v-model:column-pinning`
- **Grouping**: Pass `grouping` array + `getGroupedRowModel()`, use `row.getIsGrouped()`
- **Tree Data**: Provide `getSubRows` function returning children array
- **Virtualization**: Set `virtualize` prop (requires fixed height container); disables sticky and row dividers
- **Hover with Popover**: Use `refDebounced` to prevent flicker

---

## UPagination

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | - | Current page (v-model:page, 1-based) |
| `total` | `number` | `0` | Total items |
| `itemsPerPage` | `number` | `10` | Per page |
| `siblingCount` | `number` | `2` | Sibling buttons |
| `showControls` | `boolean` | `true` | Prev/next/first/last buttons |
| `showEdges` | `boolean` | `false` | First/last always shown |
| `color` | Color | `'neutral'` | Inactive button color |
| `variant` | Variant | `'outline'` | Inactive button variant |
| `activeColor` | Color | `'primary'` | Active button color |
| `activeVariant` | Variant | `'solid'` | Active button variant |
| `size` | Size | `'md'` | Button size |
| `disabled` | `boolean` | - | Disable controls |
| `to` | `(page: number) => string \| object` | - | Transform buttons into links |

**Slots**: `first`, `prev`, `next`, `last`, `ellipsis`, `item`
**Events**: `update:page`

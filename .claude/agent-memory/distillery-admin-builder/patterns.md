# Reusable Component Patterns

## Table Pattern (TanStack - Target Standard)
```typescript
// Column definitions with render functions
const columns: TableColumn<EntityType>[] = [
  { accessorKey: 'name', header: 'Name' },
  { id: 'actions', cell: ({ row }) => h(UDropdownMenu, { items: getRowItems(row) }, ...) }
];
// Pagination
const pagination = ref({ pageIndex: 0, pageSize: 10 });
// Global filter
const search = ref('');
// Template: <UTable :data="store.items" :columns="columns" v-model:pagination="pagination" v-model:global-filter="search" />
```

## Modal/Overlay Pattern (Current)
```typescript
import { ModalComponent } from '#components';
const overlay = useOverlay();
const modal = overlay.create(ModalComponent);
const openModal = async () => await modal.open();
```

## Delete Confirmation Pattern
```typescript
const { confirm } = useDeleteConfirm();
const deleteItem = async (row) => {
  const confirmed = await confirm('EntityName', row.displayName);
  if (confirmed) store.deleteItem(row._id);
};
```

## Store CRUD Pattern
- `loading` ref for initial fetch, `saving` ref for CUD operations
- Try/catch with `useToast()` for success/error feedback
- Local state mutation (push/splice/filter) instead of re-fetching
- `reset*()` method to clear the form singleton
- Auto-fetch on store initialization: `getItems(); // called at module level`

## Dashboard Widget Color Scheme
- gold: primary metric (active batches)
- copper: secondary metric (stock levels)
- amber: warning/attention (pending items)
- green: positive/success (recent productions)
- red: alert/critical (low inventory)

## Custom Colors (from Tailwind config)
- `espresso` - main background
- `charcoal` - sidebar/header background
- `parchment` - text color
- `copper` - accent color
- `gold` - highlight/active color
- `brown` - border/divider color

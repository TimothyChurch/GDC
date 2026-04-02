# Nuxt UI v4 — Best Practices & Patterns

## Version Info

- **Current**: v4.5.1 (installed: ^4.4.0)
- **Built on**: Reka UI primitives, Tailwind CSS v4, Iconify icons
- **67 core components** across 6 categories

## Complete Component Index

**Layout (7)**: UApp, UContainer, UError, UFooter, UHeader, UMain, UTheme
**Element (16)**: UAlert, UAvatar, UAvatarGroup, UBadge, UBanner, UButton, UCalendar, UCard, UChip, UCollapsible, UFieldGroup, UIcon, UKbd, UProgress, USeparator, USkeleton
**Form (19)**: UCheckbox, UCheckboxGroup, UColorPicker, UFileUpload, UForm, UFormField, UInput, UInputDate, UInputMenu, UInputNumber, UInputTags, UInputTime, UPinInput, URadioGroup, USelect, USelectMenu, USlider, USwitch, UTextarea
**Data (9)**: UAccordion, UCarousel, UEmpty, UMarquee, UScrollArea, UTable, UTimeline, UTree, UUser
**Navigation (8)**: UBreadcrumb, UCommandPalette, UFooterColumns, ULink, UNavigationMenu, UPagination, UStepper, UTabs
**Overlay (8)**: UContextMenu, UDrawer, UDropdownMenu, UModal, UPopover, USlideover, UToast, UTooltip

---

## Key Differences from v2/v3

| v2 | v3/v4 | Notes |
|----|-------|-------|
| `UDropdown` | `UDropdownMenu` | Different item structure |
| `color="gray"` | `color="neutral"` | Renamed color |
| `UFormGroup` | `UFormField` | Renamed |
| `UButtonGroup` | `UFieldGroup` | Renamed in v4 |
| `UDivider` | `USeparator` | Renamed in v4 |
| UTable `rows` prop | UTable `data` prop | Data prop renamed |
| `@select(row)` | `@select(event, row)` | Event added as first arg |
| `ui` prop (nested objects) | `ui` prop (slot-based classes) | Simplified |
| Headless UI | Reka UI | Underlying primitives |
| `tailwind.config.ts` | `@theme` in CSS | Tailwind v4 |

### v4 New Features (cumulative through v4.5.1)

- **v4.1+**: `experimental.componentDetection` for tree-shaking
- **v4.2+**: `scrollable` on UModal, `theme.prefix` for Tailwind CSS prefix
- **v4.5+**: Toast deduplication via matching `id` values
- **`virtualize` prop**: UTable, USelectMenu, UCommandPalette, UTree, UInputMenu
- **`loadingAuto` on UButton**: Auto-loading based on @click Promise state
- **DropdownMenu filtering**: `filter` prop with search input
- **New components**: UInputDate, UInputTime, UInputTags, UInputMenu, UColorPicker, UFileUpload, UTree, UCalendar, UScrollArea, UEditor

---

## GDC-Specific Conventions

### Overlay Pattern (Panels)

GDC uses `useOverlay()` with `USlideover` for panel components:
```ts
import { PanelBatch } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelBatch)
const openPanel = async () => await panel.open()
```

### Delete Confirmation Pattern

```ts
const modal = overlay.create(ModalDeleteConfirm)
const confirmed = await modal.open({ entityName, entityLabel })
```

### Toast Pattern (Stores)

```ts
// Success
toast.add({ title: 'Item created', color: 'success', icon: 'i-lucide-check-circle' })
// Error
toast.add({ title: 'Failed to save', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' })
```

### Form Pattern (Yup)

```ts
import * as yup from 'yup'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = yup.object({ ... })
type Schema = yup.InferType<typeof schema>
const state = reactive({ ... })
async function onSubmit(event: FormSubmitEvent<Schema>) { ... }
```

### Table Row Click Pattern

```vue
<UTable :data="items" :columns="columns" :ui="{ tr: 'cursor-pointer' }"
  @select="(e, row) => navigateTo(`/admin/items/${row.original._id}`)" />
```

---

## Common Gotchas

1. **USelect vs USelectMenu v-model**: USelect binds to value, USelectMenu binds to whole object (use `value-key` to change)
2. **UPagination is 1-based**, TanStack Table is 0-based — add/subtract 1 when bridging
3. **UFormField `name` must match state key** exactly for auto-validation
4. **Programmatic overlays** (useOverlay) can't access page-level `provide/inject` — pass data via props
5. **`color="gray"` is invalid** — use `color="neutral"` in v4
6. **Table `rows` prop doesn't exist** — use `data` prop
7. **Table `@select` has event as first arg**: `@select="(e, row) => ..."` not `@select="(row) => ..."`
8. **Wrap color mode components in `<ClientOnly>`** to prevent hydration mismatches
9. **UFormField replaces UFormGroup** — the old name doesn't exist
10. **`useFileUpload`** is a built-in Nuxt UI composable — GDC's custom one is `useCloudinaryUpload`

---

## Performance Tips

1. **Use `virtualize` prop** on UTable, USelectMenu, UCommandPalette for large datasets (1000+ items)
2. **Use `unmountOnHide`** on UTabs, UAccordion, UCollapsible to free memory for hidden content
3. **Use `Lazy` prefix** for overlay components: `LazyPanelBatch`, `LazyModalDelete`
4. **Use `experimental.componentDetection`** in nuxt.config for tree-shaking unused components
5. **Install `@iconify-json/lucide`** locally to avoid network requests for icons
6. **Use `watchOptions: { deep: false }`** on UTable when data changes at the top level only

---

## Theming Quick Reference

- **Design tokens**: `text-default`, `text-muted`, `text-dimmed`, `bg-default`, `bg-muted`, `bg-elevated`, `bg-accented`, `border-default`, `border-accented`
- **Semantic colors**: primary, secondary, success, info, warning, error, neutral
- **`ui` prop**: Per-instance overrides using slot names as keys with Tailwind classes
- **Icons**: `i-{collection}-{name}` format (default: lucide)
- **Shared props**: `color`, `variant`, `size` on most components

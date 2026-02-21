# Nuxt UI v4 Reference (v4.4.0+)

> Comprehensive reference for all Nuxt UI v4 components, composables, theming, and patterns used in this project. Built on Reka UI primitives, Tailwind CSS v4, and Iconify icons.

## Table of Contents
- [Configuration & Theming](#configuration--theming)
- [Form Components](#form-components)
- [Table (TanStack)](#table-tanstack)
- [Overlay Components](#overlay-components)
- [Composables](#composables)
- [Navigation Components](#navigation-components)
- [Data Display Components](#data-display-components)
- [Layout Components](#layout-components)
- [Complete Component Index](#complete-component-index)
- [Key Differences from v2/v3](#key-differences-from-v2v3)

---

## Configuration & Theming

### nuxt.config.ts Options
```ts
ui: {
  prefix: 'U',              // Component prefix
  fonts: true,               // Auto-register @nuxt/fonts
  colorMode: true,           // Auto-register @nuxt/color-mode
  theme: {
    colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error'], // Semantic colors
    transitions: true,       // CSS transitions on components
  }
}
```

### Semantic Colors (defaults)
| Name | Default | Purpose |
|------|---------|---------|
| `primary` | `green` | Main CTAs, brand |
| `secondary` | `blue` | Secondary actions |
| `success` | `green` | Success states |
| `info` | `blue` | Info alerts |
| `warning` | `yellow` | Warning states |
| `error` | `red` | Errors, destructive |
| `neutral` | `slate` | Text, borders, backgrounds |

Configure in `app.config.ts`:
```ts
export default defineAppConfig({
  ui: {
    colors: { primary: 'amber', neutral: 'stone' },
    icons: { loading: 'i-lucide-loader-circle', close: 'i-lucide-x', search: 'i-lucide-search' }
  }
})
```

### Design Tokens (CSS Custom Properties)
All components reference these tokens which auto-adapt to light/dark mode:

| Tailwind Class | Light Default | Dark Default |
|---|---|---|
| `text-default` | neutral-700 | neutral-200 |
| `text-dimmed` | neutral-400 | neutral-500 |
| `text-muted` | neutral-500 | neutral-400 |
| `text-toned` | neutral-600 | neutral-300 |
| `text-highlighted` | neutral-900 | white |
| `text-inverted` | white | neutral-900 |
| `bg-default` | white | neutral-900 |
| `bg-muted` | neutral-50 | neutral-800 |
| `bg-elevated` | neutral-100 | neutral-800 |
| `bg-accented` | neutral-200 | neutral-700 |
| `bg-inverted` | neutral-900 | white |
| `border-default` | neutral-200 | neutral-800 |
| `border-accented` | neutral-300 | neutral-700 |

Override in CSS: `html { --ui-bg: #f3e2c6; --ui-text: #3f2b1d; }`

### The `ui` Prop System
Every component accepts a `ui` prop for per-instance style overrides. Keys are **slot names** mapping to Tailwind classes:
```vue
<UButton :ui="{ base: 'rounded-full', leadingIcon: 'text-gold' }" />
<UTable :ui="{ tr: 'cursor-pointer', th: 'text-gold' }" />
<UModal :ui="{ content: 'bg-charcoal', title: 'text-gold' }" />
```

### Icons (Iconify)
Format: `i-{collection}-{icon-name}`. Default collection: `lucide`.
```vue
<UIcon name="i-lucide-home" class="size-5" />
<UButton icon="i-lucide-plus" label="Add" />
<UInput icon="i-lucide-search" />
```

### Component Color/Variant/Size Props (shared across most components)
- **color**: `'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'`
- **variant**: `'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'` (varies by component)
- **size**: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`

---

## Form Components

### UForm
Top-level form wrapper. Handles validation and error distribution to child UFormField components.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `SchemaObject` | - | Yup/Zod/Valibot/Joi schema |
| `state` | `object` | - | Reactive form state |
| `validate` | `Function` | - | Custom validation (alongside schema) |
| `validateOn` | `string[]` | - | `'input'`, `'change'`, `'blur'` |
| `validateOnInputDelay` | `number` | `300` | Debounce for input validation |
| `disabled` | `boolean` | `false` | Disable all controls |
| `transform` | `boolean` | `true` | Apply schema transforms |
| `loadingAuto` | `boolean` | `true` | Auto-set loading on async submit |

**Events**: `@submit(FormSubmitEvent<T>)`, `@error(FormErrorEvent)`

**Template Ref Methods**: `submit()`, `validate(opts?)`, `clear(path?)`, `getErrors(path?)`, `setErrors(errors, name?)` | **Reactive**: `errors`, `disabled`, `dirty`, `dirtyFields`, `touchedFields`

**Yup Pattern (this project)**:
```vue
<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  name: yup.string().required('Required')
})
type Schema = yup.InferType<typeof schema>

const state = reactive({ email: undefined, name: undefined })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // event.data is typed and validated
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormField>
    <UButton type="submit">Submit</UButton>
  </UForm>
</template>
```

### UFormField (replaces v2's UFormGroup)
Wraps form controls. Auto-receives validation errors from parent UForm by matching `name` prop.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | - | Must match schema/state key |
| `label` | `string` | - | Label text |
| `description` | `string` | - | Below label |
| `help` | `string` | - | Below input |
| `hint` | `string` | - | Right of label |
| `error` | `string \| boolean` | - | Manual error (auto-set by UForm) |
| `required` | `boolean` | `false` | Adds asterisk |
| `size` | Size | `'md'` | Proxied to child controls |

**Slots**: `default`, `label`, `hint`, `description`, `help`, `error`

### UInput
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | `'text'` | HTML input type |
| `placeholder` | `string` | - | Placeholder |
| `color` | Color | `'primary'` | Focus ring color |
| `variant` | `'outline' \| 'soft' \| 'subtle' \| 'ghost' \| 'none'` | `'outline'` | Style |
| `size` | Size | `'md'` | Size |
| `icon` / `leadingIcon` / `trailingIcon` | `string` | - | Icons |
| `loading` | `boolean` | `false` | Loading spinner |
| `disabled` / `readonly` | `boolean` | `false` | States |
| `avatar` | `AvatarProps` | - | Leading avatar |

**v-model**: `string | number | null`. **Slots**: `leading`, `default`, `trailing`. **Events**: `update:modelValue`, `blur`, `change`

### UTextarea
All UInput props plus: `rows` (default 3), `autoresize` (boolean), `maxrows` (number).

### USelect
Native-like dropdown. **v-model binds to the VALUE property**.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Options (strings, numbers, or objects) |
| `valueKey` | `string` | `'value'` | Object property for value |
| `labelKey` | `string` | `'label'` | Object property for display |
| `placeholder` | `string` | - | Empty state text |
| `multiple` | `boolean` | `false` | Multi-select |
| `content` | `object` | - | Popover positioning |

```vue
<USelect v-model="status" :items="['active', 'completed', 'cancelled']" />
<USelect v-model="unitId" :items="units" value-key="_id" label-key="name" />
```

### USelectMenu
Advanced searchable select. **v-model binds to the WHOLE OBJECT by default** (use `value-key` to bind to a property).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Options |
| `valueKey` | `string` | - | Bind to property instead of whole object |
| `labelKey` | `string` | `'label'` | Display property |
| `searchInput` | `object \| false` | - | Search config or false to hide |
| `ignoreFilter` | `boolean` | `false` | For server-side search |
| `filterFields` | `string[]` | `[labelKey]` | Fields to search |
| `createItem` | `boolean \| 'always'` | - | Allow creating new items |
| `virtualize` | `boolean` | - | Virtual scrolling |
| `multiple` | `boolean` | `false` | Multi-select |
| `clear` | `boolean` | `false` | Show clear button |

**v-model:search-term**: Controlled search text. **Events**: `update:modelValue`, `update:search-term`, `create`, `clear`

**When to use USelect vs USelectMenu:**
- **USelect**: Small static list (<20 items), no search needed, simple value binding
- **USelectMenu**: Need search/filter, create items, object binding, large lists, multi-select

### UInputNumber
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` / `max` / `step` | `number` | - | Range and step |
| `formatOptions` | `Intl.NumberFormatOptions` | - | Currency, percent, etc. |
| `increment` / `decrement` | `boolean \| ButtonProps` | `true` | +/- buttons |

```vue
<UInputNumber v-model="price" :format-options="{ style: 'currency', currency: 'USD' }" />
```

### UCheckbox
**v-model**: `boolean | 'indeterminate'`. Props: `label`, `description`, `color`, `variant` (`'list' | 'card'`), `indicator` (`'start' | 'end' | 'hidden'`).

### URadioGroup
**v-model**: value of selected item. Props: `items` (array), `valueKey`, `labelKey`, `orientation` (`'horizontal' | 'vertical'`), `variant` (`'list' | 'card' | 'table'`).

### USwitch
**v-model**: `boolean`. Props: `label`, `description`, `checkedIcon`, `uncheckedIcon`, `loading`.

### UColorPicker
**v-model**: `string` (color value). Props: `format` (`'hex' | 'rgb' | 'hsl'`), `size`.

### USlider
**v-model**: `number | number[]` (range). Props: `min`, `max`, `step`, `orientation`, `tooltip`.

### UPinInput
**v-model**: `string[]`. Props: `length`, `type` (`'text' | 'number'`), `mask`, `otp`. **Events**: `complete` (all filled).

### UFileUpload
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `'*'` | MIME types/extensions |
| `multiple` | `boolean` | `false` | Multi-file |
| `variant` | `'area' \| 'button'` | `'area'` | Visual style |
| `layout` | `'list' \| 'grid'` | `'grid'` | File preview layout |
| `dropzone` | `boolean` | `true` | Enable drag-drop |
| `preview` | `boolean` | `true` | Show file list |

**v-model**: `File | File[] | null`

---

## Table (TanStack)

UTable is built on TanStack Table. Import type: `import type { TableColumn } from '@nuxt/ui'`

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | - | Row data (**not** `rows`) |
| `columns` | `TableColumn<T>[]` | - | Column definitions |
| `loading` | `boolean` | `false` | Loading state |
| `loadingColor` | Color | - | Loading indicator color |
| `loadingAnimation` | `'carousel' \| 'swing' \| 'elastic'` | - | Animation |
| `empty` | `string` | - | Empty state text |
| `sticky` | `boolean \| 'header' \| 'footer'` | - | Sticky positioning |
| `virtualize` | `boolean` | - | Virtual scrolling (1000+ rows) |

**v-model State Props**: `globalFilter`, `columnFilters`, `sorting`, `rowSelection`, `expanded`, `pagination` (`{ pageIndex: number, pageSize: number }`), `columnVisibility`, `columnPinning`, `grouping`

**Options Props** (TanStack config): `paginationOptions`, `sortingOptions`, `globalFilterOptions`, `expandedOptions`, `rowSelectionOptions`, `groupingOptions`

### Column Definition
```ts
const columns: TableColumn<MyType>[] = [
  {
    accessorKey: 'name',          // Data property key
    // OR: accessorFn: (row) => row.firstName + ' ' + row.lastName,
    id: 'name',                   // Unique ID (auto-derived from accessorKey)
    header: 'Name',               // String or render function
    // header: ({ column }) => h(UButton, { onClick: () => column.toggleSorting() }, 'Name'),
    cell: ({ row }) => row.original.name,  // Cell render function
    enableSorting: true,
    meta: { class: { th: 'text-right', td: 'text-right font-mono' } }
  },
  { id: 'actions', cell: ({ row }) => h(UDropdownMenu, { items: getActions(row) }, ...) }
]
```

**Sortable Header Pattern** (used throughout this project):
```ts
header: ({ column }) => {
  const isSorted = column.getIsSorted()
  return h(UButton, {
    color: 'neutral', variant: 'ghost', label: 'Column Name',
    icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
    class: '-mx-2.5',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
  })
}
```

### Slots
| Slot | Props | Description |
|------|-------|-------------|
| `#[columnId]-header` | `{ column, header, table }` | Custom header per column |
| `#[columnId]-cell` | `{ row, cell, column, getValue, table }` | Custom cell per column |
| `#expanded` | `{ row }` | Expanded row content |
| `#empty` | - | Custom empty state |
| `#loading` | - | Custom loading state |

### Events
| Event | Signature | Description |
|-------|-----------|-------------|
| `@select` | `(e: Event, row: TableRow<T>) => void` | Row click |
| `@hover` | `(e: Event, row: TableRow<T> \| null) => void` | Row hover |

### Styling
```vue
<UTable
  :ui="{ root: '', base: 'min-w-full', thead: '', tbody: '', tr: 'cursor-pointer', th: 'px-4 py-3.5', td: 'p-4 text-sm', empty: 'py-6 text-center', loading: '' }"
/>
```

Per-row conditional styling:
```ts
const meta = { class: { tr: (row) => row.original.status === 'error' ? 'bg-error/10' : '' } }
```

### Table API Access
```vue
<UTable ref="table" ... />
<script setup>
const table = useTemplateRef('table')
// table.value?.tableApi?.getFilteredRowModel().rows.length
// table.value?.tableApi?.setPageIndex(0)
</script>
```

### Pagination Integration
```vue
<UTable ref="table" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }" />
<UPagination
  :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
  :items-per-page="table?.tableApi?.getState().pagination.pageSize"
  :total="table?.tableApi?.getFilteredRowModel().rows.length"
  @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
/>
```
Note: UPagination is 1-based, TanStack is 0-based.

### UPagination
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | - | Current page (v-model:page, 1-based) |
| `total` | `number` | `0` | Total items |
| `itemsPerPage` | `number` | `10` | Per page |
| `siblingCount` | `number` | `2` | Sibling buttons |
| `showControls` | `boolean` | `true` | Prev/next buttons |
| `showEdges` | `boolean` | `false` | First/last always shown |

---

## Overlay Components

### UModal
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title |
| `description` | `string` | - | Header description |
| `open` | `boolean` | - | v-model:open |
| `overlay` | `boolean` | `true` | Backdrop |
| `transition` | `boolean` | `true` | Animations |
| `fullscreen` | `boolean` | - | Full screen |
| `scrollable` | `boolean` | - | Scrollable content |
| `close` | `boolean \| ButtonProps` | `true` | Close button |
| `dismissible` | `boolean` | `true` | Click outside/Escape to close |

**Slots**: `default` (trigger), `content`, `header`, `title`, `description`, `actions`, `close`, `body`, `footer({ close })`
**Events**: `@update:open`, `@after:enter`, `@after:leave`

### USlideover
Same API as UModal plus: `side` prop (`'right' | 'top' | 'bottom' | 'left'`, default `'right'`), `inset` (boolean). **This is what GDC uses for Panel components.**

### UDrawer
Mobile-friendly swipeable panel (Vaul). Props: `direction` (`'top' | 'bottom' | 'left' | 'right'`, default `'bottom'`), `handle` (boolean, default `true`), `snapPoints`, `shouldScaleBackground`. **Events**: `@drag(percentage)`, `@release(open)`.

### UPopover
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'click' \| 'hover'` | `'click'` | Trigger mode |
| `content` | `object` | - | Positioning (align, side) |
| `arrow` | `boolean` | `false` | Show arrow |
| `openDelay` / `closeDelay` | `number` | `0` | Hover delays |

**Slots**: `default` (trigger), `content({ close })`

### UTooltip
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | Tooltip text |
| `kbds` | `string[]` | - | Keyboard shortcuts |
| `delayDuration` | `number` | - | Show delay |
| `disabled` | `boolean` | - | Disable |

**Slots**: `default` (trigger), `content`

### UDropdownMenu (replaces v2's UDropdown)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[] \| MenuItem[][]` | - | Items (nested arrays = groups with separators) |
| `size` | Size | `'md'` | Size |
| `content` | `object` | - | Positioning |

**MenuItem Interface**:
```ts
{
  label?: string, icon?: string, avatar?: AvatarProps,
  type?: 'link' | 'label' | 'separator' | 'checkbox',
  color?: Color, checked?: boolean, disabled?: boolean,
  kbds?: string[], children?: MenuItem[],  // Nested submenu
  onSelect?: (e: Event) => void,
  onUpdateChecked?: (checked: boolean) => void,
  to?: string, target?: string, slot?: string
}
```

**Slots**: `default` (trigger), `item`, `item-leading`, `item-label`, `item-trailing`, `content-top`, `content-bottom`

### UContextMenu
Same API as UDropdownMenu. Right-click trigger instead of button.

---

## Composables

### useOverlay()
Programmatically create/manage overlays. **Primary pattern in this project for Panels.**

```ts
const overlay = useOverlay()

// Create an overlay instance
const panel = overlay.create(PanelBatch)

// Open it (returns Promise that resolves when closed)
const result = await panel.open({ someProps: 'value' })

// Other methods
panel.close(returnValue?)  // Close and resolve Promise
panel.patch({ newProp: 'value' })  // Update props dynamically
```

**Global methods**: `overlay.closeAll()`, `overlay.isOpen(id)`, `overlay.unmount(id)`

**GDC Pattern - Panels**:
```ts
import { PanelBatch } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelBatch)
const openPanel = async () => await panel.open()
```

**GDC Pattern - Delete Confirm**:
```ts
const modal = overlay.create(ModalDeleteConfirm)
const confirmed = await modal.open({ entityName, entityLabel })
// Component emits 'close' with true/false to resolve the Promise
```

**Caveat**: Programmatic overlays only access injections from the `UApp` tree, NOT from page components. Pass data via props.

### useToast()
```ts
const toast = useToast()

// Add toast
toast.add({
  title: 'Saved',
  description: 'Optional details',
  icon: 'i-lucide-check-circle',
  color: 'success',           // primary | secondary | success | info | warning | error | neutral
  duration: 5000,             // Auto-dismiss ms (0 = persistent)
  actions: [{ label: 'Undo', variant: 'outline', onClick: () => undoAction() }],
  close: true,                // Show close button
  progress: true,             // Show countdown bar
})

// Other methods
toast.update(id, { title: 'Updated' })
toast.remove(id)
toast.clear()
```

**GDC Store Pattern**:
```ts
toast.add({ title: 'Item created', color: 'success', icon: 'i-lucide-check-circle' })
toast.add({ title: 'Failed to save', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' })
```

**Toaster Config** (on UApp): `<UApp :toaster="{ position: 'bottom-right', duration: 5000, max: 5 }">`

### defineShortcuts()
Declarative keyboard shortcuts (auto-imported).
```ts
defineShortcuts({
  'meta_k': () => openCommandPalette(),     // Cmd/Ctrl+K
  '?': () => toggleHelp(),                   // Single key
  'g-d': () => navigateTo('/dashboard'),     // Sequence: g then d
  escape: { handler: () => close(), usingInput: true },  // Works in inputs
})
```

**Modifiers**: `meta` (Cmd/Ctrl), `ctrl`, `shift`. **Sequence separator**: `-`. **Combo separator**: `_`.
**`usingInput`**: `false` (default, skip inputs), `true` (fire in any input), `'inputName'` (specific input).

### useCommandPalette()
```ts
const { open } = useCommandPalette()
open()  // Opens the command palette
```

---

## Navigation Components

### UTabs
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | - | Tab items |
| `modelValue` | `string \| number` | - | Active tab (v-model) |
| `color` | Color | `'primary'` | Color |
| `variant` | `'pill' \| 'link'` | `'pill'` | Style |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `content` | `boolean` | `true` | Render content panels |
| `unmountOnHide` | `boolean` | `true` | Unmount inactive panels |

**TabItem**: `{ label, icon?, avatar?, badge?, content?, value?, disabled?, slot? }`

### UBreadcrumb
```vue
<UBreadcrumb :items="[
  { label: 'Admin', to: '/admin', icon: 'i-lucide-home' },
  { label: 'Items', to: '/admin/items' },
  { label: 'Edit Item' }
]" />
```

### UNavigationMenu
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItem[] \| NavItem[][]` | - | Nested arrays = groups |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `collapsed` | `boolean` | - | Icon-only mode |
| `highlight` | `boolean` | - | Active item border |

**NavItem**: `{ label, icon?, avatar?, badge?, chip?, to?, children?: NavChild[], disabled?, defaultOpen? }`

### UStepper
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `StepperItem[]` | - | Steps |
| `modelValue` | `string \| number` | - | Active step |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `linear` | `boolean` | `true` | Require sequential |

**StepperItem**: `{ title, description?, content?, icon?, value?, disabled? }`
**Expose**: `next()`, `prev()`, `hasNext`, `hasPrev`

### UCommandPalette
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `groups` | `CommandPaletteGroup[]` | - | Item groups |
| `placeholder` | `string` | - | Search placeholder |
| `searchTerm` | `string` | - | v-model:search-term |
| `loading` | `boolean` | - | Loading state |
| `close` | `boolean \| ButtonProps` | - | Close button |
| `input` | `boolean \| InputProps` | `true` | Search input |
| `fuse` | `object` | - | Fuse.js config |
| `virtualize` | `boolean` | - | Large lists |

**Group**: `{ id: string, label?, items, ignoreFilter?: boolean, postFilter?, slot? }`
**Item**: `{ label, icon?, avatar?, kbds?, children?, onSelect?, to?, disabled?, slot? }`

```vue
<UModal v-model:open="open" :ui="{ content: 'p-0' }">
  <template #content>
    <UCommandPalette :groups="groups" @update:open="open = $event" close />
  </template>
</UModal>
```

---

## Data Display Components

### UButton
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Button text |
| `icon` | `string` | - | Icon |
| `leadingIcon` / `trailingIcon` | `string` | - | Positioned icons |
| `color` | Color | `'primary'` | Color |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle' \| 'ghost' \| 'link'` | `'solid'` | Style |
| `size` | Size | `'md'` | Size |
| `loading` | `boolean` | `false` | Loading spinner |
| `disabled` | `boolean` | `false` | Disabled |
| `block` | `boolean` | `false` | Full width |
| `square` | `boolean` | `false` | Equal padding |
| `to` | `string` | - | NuxtLink |

**Slots**: `leading`, `default`, `trailing`. **ui slots**: `base`, `label`, `leadingIcon`, `trailingIcon`

### UBadge
| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | - |
| `color` | Color | `'primary'` |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'soft'` |
| `size` | Size | `'md'` |

### UCard
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title |
| `description` | `string` | - | Header description |
| `variant` | `'outline' \| 'soft' \| 'subtle' \| 'ghost' \| 'naked'` | `'outline'` | Style |

**Slots**: `header`, `title`, `description`, `default` (body), `footer`

### UAlert
| Prop | Type | Default |
|------|------|---------|
| `title` | `string` | - |
| `description` | `string` | - |
| `icon` | `string` | - |
| `color` | Color | `'primary'` |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'solid'` |
| `actions` | `ButtonProps[]` | - |
| `close` | `boolean \| ButtonProps` | - |

### UAvatar
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image URL |
| `alt` | `string` | - | Alt text (initials extracted for fallback) |
| `icon` | `string` | - | Fallback icon |
| `text` | `string` | - | Fallback text |
| `size` | `'3xs' - '3xl'` | `'md'` | Size |
| `chip` | `boolean \| ChipProps` | - | Status indicator |

**Fallback order**: Image > Icon > Text > Initials from alt

### UChip
Small badge overlaid on another component.
```vue
<UChip :text="count" :show="count > 0" color="error" size="sm">
  <UButton icon="i-lucide-bell" variant="ghost" />
</UChip>
```

### UAccordion
| Prop | Type | Default |
|------|------|---------|
| `items` | `AccordionItem[]` | - |
| `type` | `'single' \| 'multiple'` | `'single'` |
| `collapsible` | `boolean` | `true` |

**AccordionItem**: `{ label, icon?, content?, value?, disabled?, slot? }`

### UProgress / UMeter
Progress: `modelValue` (0-100), `max`, `color`, `size`, `animation`. Shows determinate/indeterminate.
Meter: `modelValue`, `min`, `max`, `low`, `high`, `optimum`, `color`, `size`.

### UEmpty
```vue
<UEmpty title="No items" description="Create one to get started" icon="i-lucide-package"
  :actions="[{ label: 'Add Item', icon: 'i-lucide-plus' }]" />
```

### UCalendar
Uses `@internationalized/date`. Props: `modelValue`, `range` (boolean), `multiple` (boolean), `numberOfMonths`, `minValue`, `maxValue`, `isDateDisabled`, `isDateUnavailable`.

### UCarousel
Props: `items`, `arrows`, `dots`, `orientation`, `loop`, `autoplay`, `fade`. Powered by Embla Carousel.

### USkeleton
Loading placeholder. Props: `class` (apply dimensions). `<USkeleton class="h-8 w-48 rounded-md" />`

### USeparator
Visual divider. Props: `orientation` (`'horizontal' | 'vertical'`), `type` (`'solid' | 'dashed' | 'dotted'`), `color`, `label`, `icon`, `avatar`.

### UKbd
Keyboard shortcut display. `<UKbd value="meta" /> <UKbd value="K" />`

### UCollapsible
Expandable section. Props: `open` (v-model:open), `disabled`. Slots: `default` (trigger), `content`.

### UTimeline
Vertical timeline. Props: `items` (TimelineItem[]), `color`, `size`. Item: `{ title, description, icon, color, dot?, content? }`.

### UTree
Hierarchical tree. Props: `items`, `valueKey`, `labelKey`, `color`, `size`, `multiple` (selection), `expanded` (v-model).

---

## Layout Components

### UApp
**Required** root wrapper. Provides Toaster, Tooltip provider, and overlay container.
```vue
<UApp :toaster="{ position: 'bottom-right', duration: 5000 }">
  <NuxtPage />
</UApp>
```

### UContainer
Centers and constrains content width. `<UContainer>...</UContainer>`

### ULink
Enhanced NuxtLink wrapper. Props: `to`, `active`, `exact`, `activeClass`, `inactiveClass`, `disabled`, `external`, `target`, `prefetch`.

### UIcon
```vue
<UIcon name="i-lucide-home" class="size-5" />
```

---

## Complete Component Index

**Layout (7)**: UApp, UContainer, UError, UFooter, UHeader, UMain, UTheme
**Element (16)**: UAlert, UAvatar, UAvatarGroup, UBadge, UBanner, UButton, UCalendar, UCard, UChip, UCollapsible, UFieldGroup, UIcon, UKbd, UProgress, USeparator, USkeleton
**Form (19)**: UCheckbox, UCheckboxGroup, UColorPicker, UFileUpload, UForm, UFormField, UInput, UInputDate, UInputMenu, UInputNumber, UInputTags, UInputTime, UPinInput, URadioGroup, USelect, USelectMenu, USlider, USwitch, UTextarea
**Data (9)**: UAccordion, UCarousel, UEmpty, UMarquee, UScrollArea, UTable, UTimeline, UTree, UUser
**Navigation (8)**: UBreadcrumb, UCommandPalette, UFooterColumns, ULink, UNavigationMenu, UPagination, UStepper, UTabs
**Overlay (8)**: UContextMenu, UDrawer, UDropdownMenu, UModal, UPopover, USlideover, UToast, UTooltip

**Total: 67 core components** (+ 38 Pro components for dashboard/page/content)

---

## Key Differences from v2/v3

| v2 | v3 | v4 | Notes |
|----|-----|-----|-------|
| `UDropdown` | `UDropdownMenu` | `UDropdownMenu` | Different item structure |
| `color="gray"` | `color="neutral"` | `color="neutral"` | Renamed color |
| `UFormGroup` | `UFormField` | `UFormField` | Renamed |
| - | `UButtonGroup` | `UFieldGroup` | Renamed in v4 |
| - | `UDivider` | `USeparator` | Renamed in v4 |
| UTable (simple key/label) | UTable (TanStack accessorKey/cell/header) | Same | Complete rewrite in v3 |
| `rows` prop | `data` prop | `data` prop | Table data prop renamed |
| `@select(row)` | `@select(event, row)` | Same | Event added as first arg |
| `ui` prop (nested objects) | `ui` prop (slot-based classes) | Same | Simplified |
| Headless UI | Reka UI | Reka UI | Underlying primitives |
| Manual icon install | Iconify via @nuxt/icon | Same | Auto-configured |
| `tailwind.config.ts` | `@theme` in CSS | Same | Tailwind v4 |

### v4 New Features
- **`virtualize` prop**: Available on UTable, USelectMenu, UCommandPalette for virtual scrolling with large datasets
- **`scrollable` on UModal**: Enables scrollable modal content
- **`inset` on USlideover**: Inset panel positioning
- **UFormField `orientation`**: Control label/input layout
- **New components**: UInputDate, UInputTime, UScrollArea, UEditor
- **useOverlay enhancements**: `closeAll()`, `patch(id, props)`, `unmount(id)`, `isOpen(id)`
- **Built-in `useFileUpload` composable**: Nuxt UI v4 ships its own `useFileUpload`; project's custom Cloudinary uploader renamed to `useCloudinaryUpload`

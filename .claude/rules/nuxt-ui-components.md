---
paths:
  - "components/**/*.vue"
  - "pages/**/*.vue"
  - "layouts/**/*.vue"
---

# Nuxt UI v4 Quick Reference

Full reference at `.claude/NUXT_UI_REFERENCE.md`. Key points:

## Component Library (v4.4.0+)
- **67+ core components** across 6 categories: Layout, Element, Form, Data, Navigation, Overlay
- Built on **Reka UI** primitives (not Headless UI), **Tailwind CSS v4**, **Iconify** icons
- Every component accepts a `ui` prop for per-instance style overrides (slot-based Tailwind classes)

## v2 to v3/v4 Breaking Changes
- `UDropdown` -> `UDropdownMenu` (different item structure)
- `UFormGroup` -> `UFormField`
- `UButtonGroup` -> `UFieldGroup` (v3->v4)
- `UDivider` -> `USeparator` (v3->v4)
- `color="gray"` -> `color="neutral"`
- UTable: `rows` -> `data`, columns use TanStack `accessorKey`/`cell`/`header`
- UTable `@select`: signature is `(event, row)` not `(row)`
- Underlying primitives: Headless UI -> Reka UI
- Built-in `useFileUpload` composable (project's custom one renamed to `useCloudinaryUpload`)

## Forms (Yup Integration)
- `UForm` wraps fields, accepts `:schema` (Yup), `:state` (reactive), `@submit`
- `UFormField` (not UFormGroup) wraps inputs, `name` prop must match schema key
- `USelect` v-model binds to **value**; `USelectMenu` v-model binds to **whole object** (use `value-key` for property binding)

## Tables (TanStack)
- `import type { TableColumn } from '@nuxt/ui'`
- Columns use `accessorKey`, `header` (string or render fn), `cell` (render fn)
- State via v-model: `global-filter`, `pagination` (`{pageIndex, pageSize}`), `sorting`, `row-selection`, `expanded`
- Pagination needs `getPaginationRowModel()` from `@tanstack/vue-table`
- Row click: `@select="(e, row) => router.push(...)"` with `:ui="{ tr: 'cursor-pointer' }"`

## Overlays & Composables
- **useOverlay()**: `overlay.create(Component)` -> `await panel.open(props)` -> resolves on `emit('close', value)`
- **useToast()**: `toast.add({ title, color, icon, description?, actions?, duration? })`
- **defineShortcuts()**: `{ 'meta_k': handler, 'g-d': handler }` (combos with `_`, sequences with `-`)
- **UModal/USlideover/UDrawer**: All share slots `content`, `header`, `body`, `footer({ close })`

## Theming
- Semantic colors: primary, secondary, success, info, warning, error, neutral
- Configure in `app.config.ts`: `ui.colors.primary = 'amber'`
- Design tokens as CSS vars: `--ui-bg`, `--ui-text`, `--ui-border` (+ muted/elevated/accented/inverted variants)
- Icons: `i-{collection}-{name}` format (e.g., `i-lucide-home`)

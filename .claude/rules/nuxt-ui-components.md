---
paths:
  - "components/**/*.vue"
  - "pages/**/*.vue"
  - "layouts/**/*.vue"
---

# Nuxt UI v4 Quick Reference

For detailed reference, use `/nuxt-ui [topic]` skill. Topics: `forms`, `table`, `overlays`, `composables`, `navigation`, `display`, `layout`, `theming`, `best-practices`.

## Critical Rules (v4.5.1)

- **67+ core components** on Reka UI primitives, Tailwind CSS v4, Iconify icons
- Every component accepts a `ui` prop for per-instance style overrides (slot-based Tailwind classes)
- **UFormGroup** does NOT exist — use `UFormField`
- **UDropdown** does NOT exist — use `UDropdownMenu`
- **UButtonGroup** does NOT exist — use `UFieldGroup`
- **UDivider** does NOT exist — use `USeparator`
- **`color="gray"`** is invalid — use `color="neutral"`
- UTable uses `data` prop (NOT `rows`), columns use TanStack `accessorKey`/`cell`/`header`
- UTable `@select` signature: `(event, row)` not `(row)`
- `USelect` v-model binds to **value**; `USelectMenu` v-model binds to **whole object** (use `value-key` for property)
- `useFileUpload` is built-in to Nuxt UI — GDC's custom one is `useCloudinaryUpload`
- UPagination is 1-based, TanStack Table is 0-based

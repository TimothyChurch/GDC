# Nuxt UI v4 — Layout Components

## UApp

**Required** root wrapper. Provides Toaster, TooltipProvider, and OverlayProvider.

```vue
<UApp
  :toaster="{ position: 'bottom-right', duration: 5000, max: 5, expand: false }"
  :tooltip="{ delayDuration: 0, content: {} }"
  locale="en"
>
  <NuxtPage />
</UApp>
```

---

## UContainer

Centers and constrains content width.
```vue
<UContainer>...</UContainer>
```

---

## ULink

Enhanced NuxtLink wrapper.

| Prop | Type | Default |
|------|------|---------|
| `to` / `href` | `string \| object` | - |
| `active` | `boolean` | - |
| `exact` | `boolean` | - |
| `exactQuery` | `boolean \| 'partial'` | - |
| `exactHash` | `boolean` | - |
| `activeClass` / `inactiveClass` / `exactActiveClass` | `string` | - |
| `disabled` | `boolean` | - |
| `external` | `boolean` | - |
| `target` | `string` | - |
| `rel` | `string` | `'noopener noreferrer'` (external) |
| `prefetch` | `boolean` | - |
| `replace` | `boolean` | - |
| `viewTransition` | `boolean` | - |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |

Renders `<a>` when `to` is provided, `<button>` otherwise.

---

## UIcon

```vue
<UIcon name="i-lucide-home" class="size-5" />
```

---

## UFieldGroup

Groups multiple form elements together (replaces v3's UButtonGroup).

| Prop | Type | Default |
|------|------|---------|
| `size` | Size | `'md'` |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |

Compatible with: Button, Input, InputMenu, Select, SelectMenu, Tooltip, DropdownMenu, Badge.

---

## UToast

Individual toast notification component (used internally by Toaster, see `ref-composables.md` for `useToast()`).

| Prop | Type | Default |
|------|------|---------|
| `title` | `StringOrVNode` | - |
| `description` | `StringOrVNode` | - |
| `icon` | `string` | - |
| `avatar` | `AvatarProps` | - |
| `color` | Color | `'primary'` |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `close` | `boolean \| ButtonProps` | `true` |
| `closeIcon` | `string` | `'i-lucide-x'` |
| `actions` | `ButtonProps[]` | - |
| `progress` | `boolean \| ProgressProps` | `true` |
| `type` | `'foreground' \| 'background'` | - |
| `duration` | `number` | - |

**Slots**: `leading`, `title`, `description`, `actions`, `close`

---

## Other Layout Components

- **UError**: Error display component
- **UFooter**: Page footer
- **UHeader**: Page header
- **UMain**: Main content area
- **UTheme**: Scoped theme wrapper (override colors for subtree)

# Nuxt UI v4 — Navigation Components

## UTabs

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | - | Tab items |
| `modelValue` | `string \| number` | `'0'` | Active tab (v-model) |
| `defaultValue` | `string \| number` | `'0'` | Initial active tab |
| `color` | Color | `'primary'` | Color |
| `variant` | `'pill' \| 'link'` | `'pill'` | Style |
| `size` | Size | `'md'` | Size |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `content` | `boolean` | `true` | Render content panels |
| `unmountOnHide` | `boolean` | `true` | Unmount inactive panels |
| `activationMode` | `'automatic' \| 'manual'` | - | Tab activation mode |
| `valueKey` | `string` | `'value'` | Item value property |
| `labelKey` | `string` | `'label'` | Item label property |

**TabItem**: `{ label, icon?, avatar?, badge?: string | number | BadgeProps, content?, value?, disabled?, slot?, class?, ui? }`

**Slots**: `leading`, `default`, `trailing`, `content({ item })`, `list-leading`, `list-trailing`, `#{item.slot}({ item })`
**Events**: `update:modelValue`
**Expose**: `triggersRef: Ref<ComponentPublicInstance[]>`

---

## UBreadcrumb

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | - | Breadcrumb items |
| `separatorIcon` | `string` | `'i-lucide-chevron-right'` | Separator icon |
| `labelKey` | `string` | `'label'` | Label property |

**BreadcrumbItem**: `{ label?, icon?, avatar?, to?, target?, slot?, class?, ui? }`

A `span` is rendered instead of a link when `to` is not defined.

**Slots**: `item`, `item-leading`, `item-label`, `item-trailing`, `separator`, `#{item.slot}`, `#{item.slot}-leading/label/trailing`

```vue
<UBreadcrumb :items="[
  { label: 'Admin', to: '/admin', icon: 'i-lucide-home' },
  { label: 'Items', to: '/admin/items' },
  { label: 'Edit Item' }
]" />
```

---

## UNavigationMenu

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItem[] \| NavItem[][]` | - | Nested arrays = groups |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `modelValue` | `any` | - | Active item (v-model) |
| `color` | Color | `'primary'` | Color |
| `variant` | `'pill' \| 'link'` | `'pill'` | Style |
| `highlight` | `boolean` | - | Active item border |
| `highlightColor` | Color | - | Border color |
| `collapsed` | `boolean` | - | Icon-only mode (vertical only) |
| `trailingIcon` | `string` | `'i-lucide-chevron-down'` | Expandable icon |
| `externalIcon` | `any` | `true` | External link icon |
| `type` | `'single' \| 'multiple'` | `'multiple'` | Vertical accordion type |
| `collapsible` | `boolean` | `true` | Re-click to close (type=single) |
| `contentOrientation` | `'horizontal' \| 'vertical'` | - | Horizontal content layout |
| `arrow` | `boolean` | - | Animated arrow |
| `unmountOnHide` | `boolean` | `true` | Unmount hidden content |
| `tooltip` | `boolean \| TooltipProps` | - | Tooltips (collapsed mode) |
| `popover` | `boolean \| PopoverProps` | - | Popovers (collapsed mode) |
| `delayDuration` | `number` | `0` | Tooltip delay |
| `disabled` | `boolean` | - | Disable |

**NavItem**: `{ label, icon?, avatar?, badge?: string | number | BadgeProps, chip?, tooltip?, popover?, trailingIcon?, type?: 'label' | 'trigger' | 'link', defaultOpen?, open?, value?, disabled?, slot?, onSelect?, children?: NavChild[], to?, target?, class?, ui? }`

**NavChild**: `{ label, description?, icon?, onSelect?, to?, target?, class? }`

**Slots**: `item`, `item-leading`, `item-label`, `item-trailing`, `item-content`, `list-leading`, `list-trailing`, `#{item.slot}`
**Events**: `update:modelValue`

---

## UStepper

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `StepperItem[]` | - | Steps |
| `modelValue` | `string \| number` | - | Active step (v-model) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `color` | Color | `'primary'` | Color |
| `size` | Size | `'md'` | Size |
| `linear` | `boolean` | `true` | Require sequential |
| `disabled` | `boolean` | - | Disable |

**StepperItem**: `{ title?, description?, content?, icon?, value?, disabled?, slot?, class?, ui? }`

**Slots**: `indicator`, `wrapper`, `title`, `description`, `content({ item })`, `#{item.slot}({ item })`
**Events**: `next(value)`, `prev(value)`, `update:modelValue`
**Expose**: `next()`, `prev()`, `hasNext: Ref<boolean>`, `hasPrev: Ref<boolean>`

---

## UCommandPalette

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `groups` | `CommandPaletteGroup[]` | - | Item groups |
| `placeholder` | `string` | - | Search placeholder |
| `searchTerm` | `string` | - | v-model:search-term |
| `modelValue` | `any` | - | v-model (selected) |
| `multiple` | `boolean` | - | Multi-select |
| `loading` | `boolean` | - | Loading state |
| `autofocus` | `boolean` | `true` | Auto-focus input |
| `close` | `boolean \| ButtonProps` | - | Close button |
| `back` | `boolean \| ButtonProps` | `true` | Back button (submenus) |
| `input` | `boolean \| InputProps` | `true` | Search input |
| `icon` | `string` | `'i-lucide-search'` | Search icon |
| `selectedIcon` | `string` | `'i-lucide-check'` | Selected icon |
| `fuse` | `object` | `{ ignoreLocation: true, threshold: 0.1, keys: ['label', 'suffix'], resultLimit: 12, matchAllWhenSearchEmpty: true }` | Fuse.js config |
| `size` | Size | `'md'` | Size |
| `valueKey` | `string` | - | Bind to property |
| `labelKey` | `string` | `'label'` | Label property |
| `preserveGroupOrder` | `boolean` | `false` | Keep group order when filtering |
| `virtualize` | `boolean \| config` | - | Large lists (flattens groups) |
| `highlightOnHover` | `boolean` | `true` | Hover highlights |
| `selectionBehavior` | `'replace' \| 'toggle'` | - | Selection mode |

**Group**: `{ id: string, label?, items, ignoreFilter?: boolean, postFilter?: (searchTerm, items) => T[], highlightedIcon?, slot? }`
**Item**: `{ prefix?, label, suffix?, icon?, avatar?, chip?, kbds?, children?, onSelect?, placeholder?, active?, loading?, disabled?, slot?, class?, ui?, to?, target? }`

**Slots**: `footer`, `empty`, `back`, `close`, `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `#{group.slot}`
**Events**: `update:modelValue`, `update:searchTerm`, `update:open`, `highlight({ ref, value })`, `entryFocus`, `leave`

### Usage in Modal

```vue
<UModal v-model:open="open" :ui="{ content: 'p-0' }">
  <template #content>
    <UCommandPalette :groups="groups" @update:open="open = $event" close />
  </template>
</UModal>
```

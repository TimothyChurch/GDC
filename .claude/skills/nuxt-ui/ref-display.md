# Nuxt UI v4 — Data Display Components

## UButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Button text |
| `icon` | `string` | - | Icon |
| `leadingIcon` / `trailingIcon` | `string` | - | Positioned icons |
| `leading` / `trailing` | `boolean` | - | Show icon position |
| `avatar` | `AvatarProps` | - | Avatar display |
| `color` | Color | `'primary'` | Color |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle' \| 'ghost' \| 'link'` | `'solid'` | Style |
| `size` | Size | `'md'` | Size |
| `loading` | `boolean` | `false` | Loading spinner |
| `loadingAuto` | `boolean` | - | Auto-loading based on @click Promise state |
| `loadingIcon` | `string` | `'i-lucide-loader-circle'` | Loading icon |
| `disabled` | `boolean` | `false` | Disabled |
| `block` | `boolean` | `false` | Full width |
| `square` | `boolean` | `false` | Equal padding |
| `type` | `'button' \| 'submit' \| 'reset'` | - | Button type |
| `to` / `href` | `string \| RouteLocation` | - | Navigation target |
| `target` | `string` | - | Link target |
| `active` | `boolean` | - | Force active state |
| `activeColor` / `activeVariant` | Color / Variant | - | Active state styling |
| `replace` | `boolean` | - | Use router.replace |
| `external` | `boolean` | - | Force external link |
| `prefetch` | `boolean` | - | Enable prefetching |
| `autofocus` | `boolean` | - | Focus on mount |

**Slots**: `leading`, `default`, `trailing`
**Events**: `@click` (supports void or Promise<void>)

**Size table**:
| Size | Padding | Icon | Avatar |
|------|---------|------|--------|
| xs | px-2 py-1 | size-4 | 3xs |
| sm | px-2.5 py-1.5 | size-4 | 3xs |
| md | px-2.5 py-1.5 | size-5 | 2xs |
| lg | px-3 py-2 | size-5 | 2xs |
| xl | px-3 py-2 | size-6 | xs |

---

## UBadge

| Prop | Type | Default |
|------|------|---------|
| `label` | `string \| number` | - |
| `color` | Color | `'primary'` |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'solid'` |
| `size` | Size | `'md'` |
| `icon` | `string` | - |
| `avatar` | `AvatarProps` | - |
| `square` | `boolean` | - |

**Slots**: `leading`, `default`, `trailing`

---

## UCard

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'outline'` |

**Slots**: `header`, `default` (body), `footer`

---

## UAlert

| Prop | Type | Default |
|------|------|---------|
| `title` | `string` | - |
| `description` | `string` | - |
| `icon` | `string` | - |
| `avatar` | `AvatarProps` | - |
| `color` | Color | `'primary'` |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'solid'` |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `actions` | `ButtonProps[]` | - |
| `close` | `boolean \| ButtonProps` | - |
| `closeIcon` | `string` | `'i-lucide-x'` |

**Slots**: `leading`, `title`, `description`, `actions`, `close`
**Events**: `@update:open(boolean)`

---

## UAvatar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image URL |
| `alt` | `string` | - | Alt text (initials extracted for fallback) |
| `icon` | `string` | - | Fallback icon |
| `text` | `string` | - | Fallback text |
| `size` | `'3xs' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'md'` | Size |
| `chip` | `boolean \| ChipProps` | - | Status indicator |
| `loading` | `'lazy' \| 'eager'` | - | Image loading |

**Fallback order**: Image > Icon > Text > Initials from alt

Uses `<NuxtImg>` when `@nuxt/image` is installed.

---

## UAvatarGroup

| Prop | Type | Default |
|------|------|---------|
| `size` | AvatarSize | `'md'` |
| `max` | `string \| number` | - |

---

## UChip

Small badge overlaid on another component.

| Prop | Type | Default |
|------|------|---------|
| `text` | `string \| number` | - |
| `color` | Color | `'primary'` |
| `size` | `'3xs' - '3xl'` | `'md'` |
| `position` | `'top-right' \| 'bottom-right' \| 'top-left' \| 'bottom-left'` | `'top-right'` |
| `inset` | `boolean` | `false` |
| `standalone` | `boolean` | `false` |
| `show` | `boolean` | `true` |

**Slots**: `default`, `content`

```vue
<UChip :text="count" :show="count > 0" color="error" size="sm">
  <UButton icon="i-lucide-bell" variant="ghost" />
</UChip>
```

---

## UAccordion

| Prop | Type | Default |
|------|------|---------|
| `items` | `AccordionItem[]` | - |
| `type` | `'single' \| 'multiple'` | `'single'` |
| `collapsible` | `boolean` | `true` |
| `modelValue` | `string \| string[]` | - |
| `defaultValue` | `string \| string[]` | - |
| `trailingIcon` | `string` | `'i-lucide-chevron-down'` |
| `unmountOnHide` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |

**AccordionItem**: `{ label, icon?, trailingIcon?, content?, value?, disabled?, slot?, class?, ui? }`

**Slots**: `default`, `leading`, `trailing`, `content({ item })`, `body({ item })`, `#{item.slot}({ item })`
**Events**: `update:modelValue`

---

## UCalendar

Uses `@internationalized/date`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `CalendarDate \| DateRange \| DateValue[]` | `null` | v-model |
| `range` | `boolean` | `false` | Date range mode |
| `multiple` | `boolean` | `false` | Multi-select mode |
| `color` | Color | `'primary'` | Color |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'solid'` | Style |
| `size` | Size | `'md'` | Size |
| `monthControls` | `boolean` | `true` | Month navigation |
| `yearControls` | `boolean` | `true` | Year navigation |
| `weekNumbers` | `boolean` | `false` | Show week numbers |
| `fixedWeeks` | `boolean` | `true` | Always 6 weeks |
| `numberOfMonths` | `number` | `1` | Months displayed |
| `minValue` / `maxValue` | `DateValue` | - | Date constraints |
| `isDateDisabled` | `Matcher` | - | Disable specific dates |
| `isDateUnavailable` | `Matcher` | - | Mark unavailable |
| `preventDeselect` | `boolean` | `false` | Prevent deselection |
| `maximumDays` | `number` | - | Max days in range |

**Slots**: `heading`, `day({ day })`, `week-day`

---

## UCarousel

Powered by Embla Carousel.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Slide data |
| `arrows` | `boolean` | `false` | Show nav arrows |
| `dots` | `boolean` | `false` | Show indicators |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction |
| `loop` | `boolean` | `false` | Infinite loop |
| `autoplay` | `boolean \| AutoplayOptions` | `false` | Auto-advance |
| `autoScroll` | `boolean \| AutoScrollOptions` | `false` | Continuous scroll |
| `fade` | `boolean \| FadeOptions` | `false` | Fade transitions |
| `align` | `AlignmentOptionType` | `'center'` | Slide alignment |
| `slidesToScroll` | `number` | `1` | Slides per step |
| `dragFree` | `boolean` | `false` | Free-form dragging |
| `breakpoints` | `object` | `{}` | Responsive config |

**Slots**: `default({ item })`
**Events**: `@select(selectedIndex)`
**Expose**: `emblaRef`, `emblaApi`

---

## UProgress

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number \| null` | `null` | Value (null = indeterminate) |
| `max` | `number \| any[]` | - | Maximum (array for steps) |
| `status` | `boolean` | `false` | Show value display |
| `inverted` | `boolean` | `false` | Invert display |
| `size` | `'2xs' - '2xl'` | `'md'` | Bar thickness |
| `color` | Color | `'primary'` | Color |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction |
| `animation` | `'carousel' \| 'carousel-inverse' \| 'swing' \| 'elastic'` | `'carousel'` | Indeterminate animation |

**Slots**: `status`

---

## USkeleton

Loading placeholder.
```vue
<USkeleton class="h-8 w-48 rounded-md" />
```

---

## USeparator

| Prop | Type | Default |
|------|------|---------|
| `label` | `string` | - |
| `icon` | `string` | - |
| `avatar` | `AvatarProps` | - |
| `color` | Color | `'neutral'` |
| `size` | Size | `'xs'` |
| `type` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `decorative` | `boolean` | - |

---

## UKbd

| Prop | Type | Default |
|------|------|---------|
| `value` | `string` | - |
| `color` | Color | `'neutral'` |
| `variant` | `'outline' \| 'soft' \| 'subtle' \| 'solid'` | `'outline'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |

Special key: `meta` displays as Cmd on macOS, Ctrl elsewhere.

---

## UCollapsible

| Prop | Type | Default |
|------|------|---------|
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | - |
| `disabled` | `boolean` | - |
| `unmountOnHide` | `boolean` | `true` |

**Slots**: `default` (trigger), `content`
**Events**: `update:open(boolean)`

---

## UTree

Hierarchical tree component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeItem[]` | - | Hierarchical data |
| `modelValue` | `TreeItem \| TreeItem[]` | - | Selected (v-model) |
| `expanded` | `string[]` | - | Expanded keys (v-model:expanded) |
| `getKey` | `(item) => string` | - | Unique key function |
| `labelKey` | `string` | `'label'` | Label property |
| `color` | Color | `'primary'` | Focus ring color |
| `multiple` | `boolean` | `false` | Multi-selection |
| `virtualize` | `boolean \| config` | `false` | Virtual scrolling |
| `selectionBehavior` | `'replace' \| 'toggle'` | `'replace'` | Selection mode |
| `propagateSelect` | `boolean` | `false` | Select descendants |
| `bubbleSelect` | `boolean` | `false` | Update parent on child select |
| `trailingIcon` | `string` | `'i-lucide-chevron-down'` | Expandable icon |

**TreeItem**: `{ label?, icon?, trailingIcon?, defaultExpanded?, disabled?, slot?, children?: TreeItem[], onToggle?, onSelect? }`

**Slots**: `item-wrapper`, `item`, `item-leading({ selected, indeterminate, handleSelect })`, `item-label`, `item-trailing`
**Events**: `update:modelValue`, `update:expanded`, `@select(TreeItemSelectEvent)`, `@toggle(TreeItemToggleEvent)`

---

## UTimeline

Vertical timeline.

Props: `items` (TimelineItem[]), `color`, `size`.
Item: `{ title, description, icon, color, dot?, content? }`

---

## UEmpty

```vue
<UEmpty
  title="No items"
  description="Create one to get started"
  icon="i-lucide-package"
  :actions="[{ label: 'Add Item', icon: 'i-lucide-plus' }]"
/>
```

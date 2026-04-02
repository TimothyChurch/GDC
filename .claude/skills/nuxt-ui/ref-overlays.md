# Nuxt UI v4 — Overlay Components

## UModal

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title |
| `description` | `string` | - | Header description |
| `open` | `boolean` | - | v-model:open |
| `defaultOpen` | `boolean` | - | Initial state |
| `overlay` | `boolean` | `true` | Backdrop |
| `transition` | `boolean` | `true` | Animations |
| `fullscreen` | `boolean` | - | Full screen |
| `scrollable` | `boolean` | `false` | Scrollable content (v4.2+, incompatible with `modal: false`) |
| `close` | `boolean \| ButtonProps` | `true` | Close button |
| `closeIcon` | `string` | `'i-lucide-x'` | Close icon |
| `dismissible` | `boolean` | `true` | Click outside/Escape to close |
| `modal` | `boolean` | `true` | Block outside interaction |
| `portal` | `string \| boolean \| HTMLElement` | `true` | Portal rendering |

**Slots**: `default` (trigger), `content`, `header`, `title`, `description`, `actions`, `close`, `body`, `footer({ close })`
**Events**: `@update:open`, `@close:prevent`, `@after:enter`, `@after:leave`

Supports nested modals, command palette integration, non-modal mode (`modal: false` auto-disables overlay).

---

## USlideover

Same API as UModal plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'right' \| 'top' \| 'bottom' \| 'left'` | `'right'` | Slide direction |
| `inset` | `boolean` | - | Inset from screen edges |

**Slots**: `default` (trigger), `content`, `header`, `title`, `description`, `body`, `footer`, `actions`, `close`
**Events**: `@update:open`, `@close:prevent`, `@after:enter`, `@after:leave`

**GDC Usage**: This is what GDC uses for Panel components via `useOverlay()`.

---

## UDrawer

Mobile-friendly swipeable panel (powered by Vaul).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title |
| `description` | `string` | - | Header description |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Slide direction |
| `handle` | `boolean` | `true` | Draggable handle |
| `handleOnly` | `boolean` | `false` | Only draggable by handle |
| `overlay` | `boolean` | `true` | Backdrop |
| `inset` | `boolean` | `false` | Inset from edges |
| `nested` | `boolean` | `false` | Nested drawer |
| `modal` | `boolean` | `true` | Block outside interaction |
| `dismissible` | `boolean` | `true` | Close on click outside/Escape |
| `fixed` | `boolean` | `false` | Don't move with keyboard |
| `shouldScaleBackground` | `boolean` | - | Scale background (needs `data-vaul-drawer-wrapper`) |
| `snapPoints` | `(string \| number)[]` | - | Snap positions (% or px) |
| `activeSnapPoint` | `string \| number` | - | Current snap point |
| `closeThreshold` | `number` | - | Swipe distance ratio to close (0-1) |
| `scrollLockTimeout` | `number` | - | Non-draggable duration after scroll |
| `open` / `defaultOpen` | `boolean` | - | Open state |

**Slots**: `default` (trigger), `content`, `header`, `title`, `description`, `body`, `footer`
**Events**: `@update:open`, `@close`, `@drag(percentageDragged)`, `@close:prevent`, `@release(open)`, `@update:activeSnapPoint`, `@animationEnd(open)`

---

## UPopover

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'click' \| 'hover'` | `'click'` | Trigger mode |
| `content` | `PopoverContentProps` | - | Positioning (align, side) |
| `arrow` | `boolean \| PopoverArrowProps` | `false` | Show arrow |
| `portal` | `boolean` | `true` | Portal rendering |
| `reference` | `ReferenceElement` | - | Custom anchor element |
| `dismissible` | `boolean` | `true` | Close on outside click/Escape |
| `open` / `defaultOpen` | `boolean` | - | Open state |
| `modal` | `boolean` | `false` | Block outside interaction |
| `openDelay` / `closeDelay` | `number` | `0` | Hover delays (ms) |

**Slots**: `default` (trigger), `content({ close })` (close only in click mode), `anchor` (click mode only)
**Events**: `@update:open`, `@close:prevent`

**Note**: Hover mode uses Reka UI's HoverCard internally.

---

## UTooltip

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | Tooltip text |
| `kbds` | `string[] \| KbdProps[]` | - | Keyboard shortcuts |
| `content` | `TooltipContentProps` | - | Positioning |
| `arrow` | `boolean \| TooltipArrowProps` | - | Show arrow |
| `portal` | `boolean` | `true` | Portal rendering |
| `reference` | `ReferenceElement` | - | Positioning reference |
| `delayDuration` | `number` | - | Show delay (0 = instant) |
| `disableHoverableContent` | `boolean` | - | Prevent hovering tooltip content |
| `disabled` | `boolean` | - | Disable tooltip |
| `ignoreNonKeyboardFocus` | `boolean` | - | Only open on keyboard focus |
| `open` / `defaultOpen` | `boolean` | - | Open state |

**Slots**: `default` (trigger), `content`
**Events**: `@update:open`

**Requires**: App wrapper (provides TooltipProvider). Global config via App's `tooltip` prop.

---

## UDropdownMenu (replaces v2's UDropdown)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[] \| MenuItem[][]` | - | Items (nested arrays = groups with separators) |
| `size` | Size | `'md'` | Size |
| `content` | `object` | - | Positioning (align, side) |
| `arrow` | `boolean \| object` | - | Show arrow |
| `portal` | `boolean` | `true` | Portal rendering |
| `modal` | `boolean` | `true` | Block outside interaction |
| `disabled` | `boolean` | - | Disable |
| `open` / `defaultOpen` | `boolean` | - | Open state |
| `filter` | `boolean \| InputProps` | `false` | Enable filter input |
| `filterFields` | `string[]` | `[labelKey]` | Filter search fields |
| `ignoreFilter` | `boolean` | - | Disable internal filtering |
| `searchTerm` | `string` | - | v-model:search-term |
| `labelKey` | `string` | `'label'` | Label property |
| `checkedIcon` | `string` | - | Checked icon |
| `externalIcon` | `any` | `true` | External link icon (false to hide) |

**MenuItem Interface**:
```ts
{
  label?: string, icon?: string, avatar?: AvatarProps, description?: string,
  type?: 'link' | 'label' | 'separator' | 'checkbox',
  color?: Color, checked?: boolean, disabled?: boolean,
  kbds?: string[] | KbdProps[], children?: MenuItem[] | MenuItem[][],
  onSelect?: (e: Event) => void,
  onUpdateChecked?: (checked: boolean) => void,
  to?: string, target?: string, slot?: string, class?: any, ui?: object,
  filter?: boolean | InputProps, filterFields?: string[], ignoreFilter?: boolean
}
```

**Slots**: `default` (trigger), `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `content-top`, `content-bottom`, `empty`, `#{item.slot}`, `#{item.slot}-leading/label/trailing`
**Events**: `@update:open`, `@update:searchTerm`

**Content width matching**: Use `w-(--reka-dropdown-menu-trigger-width)` class on content.

**Keyboard shortcut extraction**: `extractShortcuts()` converts menu `kbds` to `defineShortcuts`-compatible format.

---

## UContextMenu

Same API as UDropdownMenu but triggered by right-click. Additional prop: `pressOpenDelay` (number).

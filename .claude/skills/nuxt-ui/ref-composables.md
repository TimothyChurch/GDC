# Nuxt UI v4 — Composables

## useOverlay()

Programmatically create/manage overlays. Created using `createSharedComposable` (shared state across app).

```ts
const overlay = useOverlay()

// Create an overlay instance
const panel = overlay.create(LazyPanelBatch, {
  autoOpen: false,          // Open immediately (default: false)
  props: {},                // Initial props
  destroyOnClose: false     // Remove from memory when closed (default: false)
})

// Open it (returns Promise that resolves when component emits 'close')
const result = await panel.open({ someProps: 'value' })

// Other instance methods
panel.close(returnValue?)   // Close and resolve Promise
panel.patch({ newProp: 'value' })  // Update props dynamically
```

### Global Methods

```ts
overlay.open(id, props?)     // Open by ID
overlay.close(id, value?)    // Close by ID
overlay.closeAll()           // Close all overlays
overlay.patch(id, props)     // Update by ID
overlay.unmount(id)          // Remove from DOM
overlay.isOpen(id)           // Check if open (returns boolean)
overlay.overlays              // List all created overlays
```

### GDC Pattern — Panels

```ts
import { PanelBatch } from '#components'
const overlay = useOverlay()
const panel = overlay.create(PanelBatch)
const openPanel = async () => await panel.open()
```

### GDC Pattern — Delete Confirm

```ts
const modal = overlay.create(ModalDeleteConfirm)
const confirmed = await modal.open({ entityName, entityLabel })
// Component emits 'close' with true/false to resolve the Promise
```

### Confirm Dialog Pattern

```ts
export const useConfirmDialog = () => {
  const overlay = useOverlay()
  return (options) => {
    const modal = overlay.create(ConfirmDialog, {
      destroyOnClose: true,
      props: options
    })
    return modal.open()
  }
}
```

**Caveat**: Programmatic overlays only access injections from the `UApp` tree, NOT from page components. Pass data via props.

---

## useToast()

```ts
const toast = useToast()

// Add toast (max 5 concurrent, oldest removed automatically)
toast.add({
  id: 'custom-id',           // Auto-generated if omitted
  title: 'Saved',
  description: 'Optional details',
  icon: 'i-lucide-check-circle',
  avatar: { src: '...' },
  color: 'success',           // primary | secondary | success | info | warning | error | neutral
  orientation: 'vertical',    // 'vertical' | 'horizontal' (default: vertical)
  duration: 5000,              // Auto-dismiss ms
  actions: [{ label: 'Undo', variant: 'outline', onClick: () => undoAction() }],
  close: true,                 // Show close button
  closeIcon: 'i-lucide-x',
  progress: true,              // Show countdown bar
  click: () => {},             // Click handler
  change: (open) => {},        // Open/close state handler
})

// Other methods
toast.update(id, { title: 'Updated' })
toast.remove(id)
toast.clear()
toast.toasts  // Reactive Ref<Toast[]>
```

### Deduplication (v4.5+)

Using matching `id` values pulses existing toast instead of creating new.

### GDC Store Pattern

```ts
toast.add({ title: 'Item created', color: 'success', icon: 'i-lucide-check-circle' })
toast.add({ title: 'Failed to save', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' })
```

### Toaster Config (on UApp)

```vue
<UApp :toaster="{ position: 'bottom-right', duration: 5000, max: 5, expand: false }">
```

---

## defineShortcuts()

Declarative keyboard shortcuts (auto-imported).

```ts
defineShortcuts({
  'meta_k': () => openCommandPalette(),     // Cmd/Ctrl+K
  '?': () => toggleHelp(),                   // Single key
  'g-d': () => navigateTo('/dashboard'),     // Sequence: g then d
  escape: { handler: () => close(), usingInput: true },  // Works in inputs
})
```

### Key Syntax

- **Single keys**: `'a'`, `'b'`, `'1'`, `'?'`
- **Combinations**: underscore separator — `'meta_k'`, `'ctrl_shift_f'`
- **Sequences**: hyphen separator — `'g-d'`
- **Modifiers**: `meta` (Cmd on macOS, Ctrl elsewhere), `ctrl` (always Ctrl), `shift`
- **Special keys**: `escape`, `enter`, `arrowleft`, `arrowright`, `arrowup`, `arrowdown`
- All keys must be lowercase

### usingInput Option

`false` (default — skip inputs), `true` (fire in any input), `'inputName'` (specific input by name).

### Options

```ts
defineShortcuts(config, {
  chainDelay: number,         // ms between chained keys
  usingPhysicalKeys: boolean  // false (default): e.key | true: e.code (layout-agnostic)
})
```

### extractShortcuts

Utility to auto-extract shortcuts from menu item `kbds` for `defineShortcuts`:
```ts
const shortcuts = extractShortcuts(menuItems)
defineShortcuts(shortcuts)
```

---

## useCommandPalette()

```ts
const { open } = useCommandPalette()
open()  // Opens the command palette
```

See Navigation reference (`ref-navigation.md`) for UCommandPalette component details.

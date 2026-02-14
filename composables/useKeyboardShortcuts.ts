export function useKeyboardShortcuts() {
  const router = useRouter()
  const { open: openCommandPalette } = useCommandPalette()
  const overlay = useOverlay()
  const showHelp = useState('shortcutHelpOpen', () => false)

  const shortcuts = [
    { keys: ['Ctrl+K', 'Cmd+K'], label: 'Command Palette', group: 'General' },
    { keys: ['?'], label: 'Show Shortcuts', group: 'General' },
    { keys: ['Escape'], label: 'Close Dialog', group: 'General' },
    { keys: ['g d'], label: 'Go to Dashboard', group: 'Navigation' },
    { keys: ['g b'], label: 'Go to Batches', group: 'Navigation' },
    { keys: ['g r'], label: 'Go to Recipes', group: 'Navigation' },
    { keys: ['g v'], label: 'Go to Vessels', group: 'Navigation' },
    { keys: ['g p'], label: 'Go to Production', group: 'Navigation' },
    { keys: ['g o'], label: 'Go to Bottles', group: 'Navigation' },
    { keys: ['g i'], label: 'Go to Items', group: 'Navigation' },
    { keys: ['g c'], label: 'Go to Contacts', group: 'Navigation' },
    { keys: ['g t'], label: 'Go to Reports', group: 'Navigation' },
    { keys: ['n b'], label: 'New Batch', group: 'Actions' },
    { keys: ['n p'], label: 'New Production', group: 'Actions' },
    { keys: ['n o'], label: 'New Purchase Order', group: 'Actions' },
  ]

  // Track sequence state
  let pendingKey = ''
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null

  function clearPending() {
    pendingKey = ''
    if (pendingTimeout) {
      clearTimeout(pendingTimeout)
      pendingTimeout = null
    }
  }

  function isInputFocused(): boolean {
    const el = document.activeElement
    if (!el) return false
    const tag = el.tagName.toLowerCase()
    return tag === 'input' || tag === 'textarea' || tag === 'select' || (el as HTMLElement).isContentEditable
  }

  async function openPanel(name: string) {
    const components: Record<string, any> = {
      PanelBatch: resolveComponent('PanelBatch'),
      PanelProduction: resolveComponent('PanelProduction'),
      PanelPurchaseOrder: resolveComponent('PanelPurchaseOrder'),
    }
    const comp = components[name]
    if (comp) {
      const panel = overlay.create(comp)
      await panel.open()
    }
  }

  const navigationMap: Record<string, string> = {
    'd': '/admin/dashboard',
    'b': '/admin/batch',
    'r': '/admin/recipes',
    'v': '/admin/vessels',
    'p': '/admin/production',
    'o': '/admin/bottles',
    'i': '/admin/items',
    'c': '/admin/contacts',
    't': '/admin/reports',
  }

  const actionMap: Record<string, string> = {
    'b': 'PanelBatch',
    'p': 'PanelProduction',
    'o': 'PanelPurchaseOrder',
  }

  function handleKeydown(e: KeyboardEvent) {
    // Don't interfere with input fields
    if (isInputFocused()) return

    // Don't interfere with modifier combinations (except Cmd/Ctrl+K which is handled by command palette)
    if (e.metaKey || e.ctrlKey || e.altKey) return

    const key = e.key.toLowerCase()

    // ? for help
    if (key === '?' || (e.shiftKey && key === '/')) {
      e.preventDefault()
      showHelp.value = !showHelp.value
      clearPending()
      return
    }

    // Escape to close help
    if (key === 'escape') {
      if (showHelp.value) {
        showHelp.value = false
        e.preventDefault()
      }
      clearPending()
      return
    }

    // Handle second key in sequence
    if (pendingKey === 'g' && navigationMap[key]) {
      e.preventDefault()
      router.push(navigationMap[key])
      clearPending()
      return
    }

    if (pendingKey === 'n' && actionMap[key]) {
      e.preventDefault()
      openPanel(actionMap[key])
      clearPending()
      return
    }

    // Start sequence
    if (key === 'g' || key === 'n') {
      clearPending()
      pendingKey = key
      pendingTimeout = setTimeout(clearPending, 800)
      return
    }

    clearPending()
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    clearPending()
  })

  return { shortcuts, showHelp }
}

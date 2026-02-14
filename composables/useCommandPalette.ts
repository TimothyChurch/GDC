export function useCommandPalette() {
  const isOpen = useState('commandPaletteOpen', () => false)

  const open = () => { isOpen.value = true }
  const close = () => { isOpen.value = false }

  return { isOpen, open, close }
}

import { useDebounceFn } from '@vueuse/core'
import type { Ref } from 'vue'

interface DraftOptions<T> {
  /** Stable name for the panel — combined with id to form the storage key. */
  key: string
  /** Entity id (e.g. _id). Falsy means "new" — drafts are scoped to a single 'new' slot per panel. */
  id: () => string | null | undefined
  /** Reactive data object. Watched deeply; deep-merged on restore. */
  data: Ref<T>
  /**
   * Optional whitelist of top-level fields to include in the draft. Defaults to every key on `data`.
   * Useful when the data object carries fields you don't want to persist (e.g. server timestamps).
   */
  fields?: (keyof T)[]
  /** Persist immediately after load instead of waiting for first user input. Default: false. */
  primeOnLoad?: boolean
}

const STORAGE_PREFIX = 'gdc:panelDraft:'

function makeKey(key: string, id: string | null | undefined): string {
  return `${STORAGE_PREFIX}${key}:${id || 'new'}`
}

function pick<T extends object>(obj: T, fields?: (keyof T)[]): Partial<T> {
  if (!fields || fields.length === 0) return obj as Partial<T>
  const out: Partial<T> = {}
  for (const f of fields) out[f] = obj[f]
  return out
}

/**
 * Persist a panel's working data to localStorage so it survives accidental closes,
 * page refreshes, and tab swaps. Restores on mount when the same entity is re-opened.
 *
 * Returns `isDirty` (data differs from the snapshot taken on mount) and a `clearDraft`
 * helper to call after a successful save.
 */
export function usePanelDraft<T extends object>(opts: DraftOptions<T>) {
  const isDirty = ref(false)
  const restoredAt = ref<Date | null>(null)
  const initialSnapshot = ref<string>('')

  const storageKey = computed(() => makeKey(opts.key, opts.id()))

  function saveNow() {
    if (!import.meta.client) return
    try {
      const payload = pick(opts.data.value, opts.fields)
      window.localStorage.setItem(storageKey.value, JSON.stringify(payload))
    } catch {
      // localStorage can be disabled, full, or unavailable — never block the UI.
    }
  }

  const debouncedSave = useDebounceFn(saveNow, 500)

  function clearDraft() {
    if (!import.meta.client) return
    try {
      window.localStorage.removeItem(storageKey.value)
    } catch {}
    isDirty.value = false
    restoredAt.value = null
    initialSnapshot.value = JSON.stringify(opts.data.value)
  }

  function restoreIfPresent(): boolean {
    if (!import.meta.client) return false
    try {
      const raw = window.localStorage.getItem(storageKey.value)
      if (!raw) return false
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        Object.assign(opts.data.value, parsed)
        restoredAt.value = new Date()
        return true
      }
    } catch {}
    return false
  }

  onMounted(() => {
    initialSnapshot.value = JSON.stringify(opts.data.value)
    const restored = restoreIfPresent()
    if (restored) isDirty.value = true
    if (opts.primeOnLoad) saveNow()
  })

  watch(
    opts.data,
    () => {
      const current = JSON.stringify(opts.data.value)
      isDirty.value = current !== initialSnapshot.value
      if (isDirty.value) debouncedSave()
    },
    { deep: true }
  )

  // Persist on tab close as a last resort.
  onMounted(() => {
    if (!import.meta.client) return
    const handler = () => {
      if (isDirty.value) saveNow()
    }
    window.addEventListener('beforeunload', handler)
    onBeforeUnmount(() => window.removeEventListener('beforeunload', handler))
  })

  return { isDirty, restoredAt, clearDraft, saveNow }
}

interface UseFormPanelOptions<T> {
  source: () => T
  onSave: (data: T) => Promise<void>
  onClose: () => void
  /**
   * Opt into localStorage draft persistence. The draft survives accidental closes,
   * page refreshes, and tab swaps; it is cleared after a successful save.
   */
  draft?: {
    /** Stable name for the panel (e.g. 'PanelProduction'). */
    key: string
    /** Reactive entity id — the draft is scoped to this id. */
    id: () => string | null | undefined
    /** Optional whitelist of top-level fields to persist. */
    fields?: (keyof T)[]
  }
}

export function useFormPanel<T extends Record<string, any>>(options: UseFormPanelOptions<T>) {
  const snapshot = structuredClone(toRaw(options.source()))
  const localData = ref<T>(structuredClone(snapshot)) as Ref<T>
  const saving = ref(false)

  const isDirty = computed(() => {
    return JSON.stringify(localData.value) !== JSON.stringify(snapshot)
  })

  const draft = options.draft
    ? usePanelDraft<T>({
        key: options.draft.key,
        id: options.draft.id,
        data: localData,
        fields: options.draft.fields,
      })
    : null

  const draftRestoredAt = computed(() => draft?.restoredAt.value || null)

  const save = async () => {
    saving.value = true
    try {
      await options.onSave(localData.value)
      draft?.clearDraft()
      options.onClose()
    } catch (e) {
      // error handling is done in the store's updateX method via toast
    } finally {
      saving.value = false
    }
  }

  const cancel = () => {
    options.onClose()
  }

  function discardDraft() {
    draft?.clearDraft()
    localData.value = structuredClone(snapshot)
  }

  return { localData, isDirty, saving, save, cancel, draftRestoredAt, discardDraft }
}

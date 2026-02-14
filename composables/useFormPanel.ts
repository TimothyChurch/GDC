interface UseFormPanelOptions<T> {
  source: () => T
  onSave: (data: T) => Promise<void>
  onClose: () => void
}

export function useFormPanel<T extends Record<string, any>>(options: UseFormPanelOptions<T>) {
  const snapshot = JSON.parse(JSON.stringify(options.source()))
  const localData = ref<T>(JSON.parse(JSON.stringify(snapshot))) as Ref<T>
  const saving = ref(false)

  const isDirty = computed(() => {
    return JSON.stringify(localData.value) !== JSON.stringify(snapshot)
  })

  const save = async () => {
    saving.value = true
    try {
      await options.onSave(localData.value)
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

  return { localData, isDirty, saving, save, cancel }
}

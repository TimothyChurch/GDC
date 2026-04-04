import { toRaw, ref, computed } from 'vue';

function useFormPanel(options) {
  const snapshot = structuredClone(toRaw(options.source()));
  const localData = ref(structuredClone(snapshot));
  const saving = ref(false);
  const isDirty = computed(() => {
    return JSON.stringify(localData.value) !== JSON.stringify(snapshot);
  });
  const save = async () => {
    saving.value = true;
    try {
      await options.onSave(localData.value);
      options.onClose();
    } catch (e) {
    } finally {
      saving.value = false;
    }
  };
  const cancel = () => {
    options.onClose();
  };
  return { localData, isDirty, saving, save, cancel };
}

export { useFormPanel as u };
//# sourceMappingURL=useFormPanel-DspW7Iuy.mjs.map

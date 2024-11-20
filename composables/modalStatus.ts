// Delete Modal State & Toggle
export const deleteModal = ref(false);
export const toggleDeleteModal = () => (deleteModal.value = !deleteModal.value);
// Form Modal State, Toggle, & Component
export const formModal = ref(false);
export const toggleFormModal = () => (formModal.value = !formModal.value);
export const formSelection = ref();

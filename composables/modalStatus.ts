// Form Modal State, Toggle, & Component
export const formModalStatus = ref(false);
export const toggleFormModal = () =>
  (formModalStatus.value = !formModalStatus.value);
export const formSelection = ref();
// Calculator Modal
export const calculatorModalStatus = ref(false);
export const toggleCalculatorModal = () =>
  (calculatorModalStatus.value = !calculatorModalStatus.value);

export const cocktailModalOpen = ref(false);

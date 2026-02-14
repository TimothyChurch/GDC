// Calculator Modal
export const calculatorModalStatus = ref(false);
export const toggleCalculatorModal = () =>
  (calculatorModalStatus.value = !calculatorModalStatus.value);

export const cocktailModalOpen = ref(false);

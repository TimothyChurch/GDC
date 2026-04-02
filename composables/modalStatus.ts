// Calculator Modal
export const useCalculatorModal = () => {
  const calculatorModalStatus = useState('calculatorModalStatus', () => false);
  const toggleCalculatorModal = () => {
    calculatorModalStatus.value = !calculatorModalStatus.value;
  };
  return { calculatorModalStatus, toggleCalculatorModal };
};

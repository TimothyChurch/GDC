export const useAgeVerification = () => {
  const ageVerified = useState('ageVerified', () => false);

  if (import.meta.client) {
    ageVerified.value = localStorage.getItem('ageVerified') === 'true';
    watch(ageVerified, (val) => {
      localStorage.setItem('ageVerified', String(val));
    });
  }

  return { ageVerified };
};

// Derived from STAGE_DISPLAY in batchPipeline.ts — single source of truth
export const BATCH_STAGES = ALL_STAGES.map((name) => ({
  name,
  icon: STAGE_DISPLAY[name].icon,
  color: STAGE_DISPLAY[name].color,
}));

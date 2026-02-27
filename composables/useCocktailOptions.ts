const STORAGE_KEY = 'gdc-cocktail-options';

const defaults = {
  glassware: ['Highball', 'Lowball', 'Martini', 'Mug', 'Shot glass', 'Glencairn'],
  menus: ['main', 'seasonal', 'shots', 'off menu'],
  units: ['oz', 'ml', 'dash', 'barspoon', 'each'],
};

export const useCocktailOptions = () => {
  // SSR-safe shared state via useState
  const options = useState('cocktailOptions', () => structuredClone(defaults));

  // Hydrate from localStorage on the client
  if (import.meta.client) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        options.value = { ...structuredClone(defaults), ...parsed };
      } catch {
        // Corrupted data -- ignore and use defaults
      }
    }
  }

  const persist = () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options.value));
    }
  };

  // --- Glassware ---
  const addGlassware = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || options.value.glassware.includes(trimmed)) return;
    options.value.glassware.push(trimmed);
    persist();
  };
  const removeGlassware = (name: string) => {
    options.value.glassware = options.value.glassware.filter((g) => g !== name);
    persist();
  };

  // --- Menu ---
  const addMenu = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed || options.value.menus.includes(trimmed)) return;
    options.value.menus.push(trimmed);
    persist();
  };
  const removeMenu = (name: string) => {
    options.value.menus = options.value.menus.filter((m) => m !== name);
    persist();
  };

  // --- Units ---
  const addUnit = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || options.value.units.includes(trimmed)) return;
    options.value.units.push(trimmed);
    persist();
  };
  const removeUnit = (name: string) => {
    options.value.units = options.value.units.filter((u) => u !== name);
    persist();
  };

  // --- Reset ---
  const resetToDefaults = () => {
    options.value = structuredClone(defaults);
    persist();
  };

  return {
    glasswareOptions: computed(() => options.value.glassware),
    menuOptions: computed(() => options.value.menus),
    unitOptions: computed(() => options.value.units),
    addGlassware,
    removeGlassware,
    addMenu,
    removeMenu,
    addUnit,
    removeUnit,
    resetToDefaults,
  };
};

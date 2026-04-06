import { J as useState } from './server.mjs';
import { computed } from 'vue';

const defaults = {
  glassware: ["Highball", "Lowball", "Martini", "Mug", "Shot glass", "Glencairn"],
  menus: ["main", "seasonal", "shots", "off menu"],
  units: ["oz", "ml", "dash", "barspoon", "each"]
};
const useCocktailOptions = () => {
  const options = useState("cocktailOptions", () => structuredClone(defaults));
  const addGlassware = (name) => {
    const trimmed = name.trim();
    if (!trimmed || options.value.glassware.includes(trimmed)) return;
    options.value.glassware.push(trimmed);
  };
  const removeGlassware = (name) => {
    options.value.glassware = options.value.glassware.filter((g) => g !== name);
  };
  const addMenu = (name) => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed || options.value.menus.includes(trimmed)) return;
    options.value.menus.push(trimmed);
  };
  const removeMenu = (name) => {
    options.value.menus = options.value.menus.filter((m) => m !== name);
  };
  const addUnit = (name) => {
    const trimmed = name.trim();
    if (!trimmed || options.value.units.includes(trimmed)) return;
    options.value.units.push(trimmed);
  };
  const removeUnit = (name) => {
    options.value.units = options.value.units.filter((u) => u !== name);
  };
  const resetToDefaults = () => {
    options.value = structuredClone(defaults);
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
    resetToDefaults
  };
};

export { useCocktailOptions as u };
//# sourceMappingURL=useCocktailOptions-VOIIdi_i.mjs.map

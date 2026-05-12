export interface InventoryCategoryDef {
  key: string;
  label: string;
  category: string;
  icon: string;
  description: string;
}

export interface SettingsTheme {
  primaryColor: string;
}

export interface SettingsDistillery {
  name: string;
  address: string;
  permitNumbers: {
    ttb: string;
    tabc: string;
  };
}

export type SettingsVolumeUnit = 'gallon' | 'liter' | 'milliliter' | 'fluid_ounce';
export type SettingsStrengthUnit = 'abv' | 'proof';
export type SettingsTemperatureUnit = 'fahrenheit' | 'celsius';
export type SettingsWeightUnit = 'pound' | 'kilogram' | 'ounce' | 'gram';

export interface SettingsUnits {
  volume: SettingsVolumeUnit;
  strength: SettingsStrengthUnit;
  temperature: SettingsTemperatureUnit;
  weight: SettingsWeightUnit;
}

/** Production-projection defaults used by utils/grainBill.ts. All values are
 * whole-number percentages (0-100). Recipes may override any of these. */
export interface SettingsProduction {
  /** % of theoretical sugars extracted from grain. Default 75. */
  mashEfficiency: number;
  /** % of fermentable sugars converted to alcohol. Default 80. */
  fermentationAttenuation: number;
  /** % of wash proof gallons recovered post-distillation. Default 80. */
  distillationYield: number;
}

export interface Settings {
  _id: string;
  itemCategories: InventoryCategoryDef[];
  barrelAgeDefaults: Record<string, number>;
  theme: SettingsTheme;
  distillery: SettingsDistillery;
  units: SettingsUnits;
  production: SettingsProduction;
  /** Names of one-time migrations already applied. Append-only; gates the
   * server/api/{batch,recipe}/*-migration routes against double-runs. */
  migrationsRun?: string[];
  createdAt?: string;
  updatedAt?: string;
}

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

export interface Settings {
  _id: string;
  itemCategories: InventoryCategoryDef[];
  barrelAgeDefaults: Record<string, number>;
  theme: SettingsTheme;
  distillery: SettingsDistillery;
  createdAt?: string;
  updatedAt?: string;
}

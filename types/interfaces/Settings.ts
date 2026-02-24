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
  itemCategories: string[];
  barrelAgeDefaults: Record<string, number>;
  theme: SettingsTheme;
  distillery: SettingsDistillery;
  createdAt?: string;
  updatedAt?: string;
}

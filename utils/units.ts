export const allUnits = [
  "fl oz",
  "cup",
  "gallon",
  "oz",
  "lb",
  "g",
  "kg",
  "mL",
  "L",
  "bottle",
  "each",
  "count",
  "12oz can",
];

export const volumeUnits = ["fl oz", "cup", "gallon", "mL", "L", "12oz can"];

export const weightUnits = ["oz", "lb", "g", "kg"];

export const countUntis = ["each", "count", "bottle", "cap", "label"];

export const UNIT_LABEL_OPTIONS = [
  'bag', 'box', 'bottle', 'case', 'drum', 'pail', 'sack', 'carton', 'tote',
]

/**
 * Format a total quantity with unit packaging info.
 * Returns e.g. "1,000 lb (20 bags)" when unitSize is set, or "1,000 lb" when not.
 */
export function formatWithUnits(
  total: number,
  item: { unitSize?: number; unitLabel?: string; inventoryUnit?: string },
): string {
  const unit = item.inventoryUnit || ''
  const base = `${total.toLocaleString()} ${unit}`.trim()
  if (item.unitSize && item.unitSize > 0 && item.unitLabel) {
    const count = Math.round((total / item.unitSize) * 100) / 100
    const label = count === 1 ? item.unitLabel : `${item.unitLabel}s`
    return `${base} (${count.toLocaleString()} ${label})`
  }
  return base
}

export const itemInventoryTypes = computed(() => {
  const itemStore = useItemStore();
  const filteredItems = itemStore.items.filter((item) => item.type);
  const allTypes: string[] = [];
  filteredItems.forEach((item) => {
    if (item.type && !allTypes.includes(item.type)) {
      allTypes.push(item.type);
    }
  });
  allTypes.push("Bottle");
  return allTypes.sort((a, b) => a.localeCompare(b));
});

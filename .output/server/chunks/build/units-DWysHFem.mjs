import { computed } from 'vue';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';

const allUnits = [
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
  "12oz can"
];
const volumeUnits = ["fl oz", "cup", "gallon", "mL", "L", "12oz can"];
const weightUnits = ["oz", "lb", "g", "kg"];
function formatWithUnits(total, item) {
  const unit = item.inventoryUnit || "";
  const base = `${total.toLocaleString()} ${unit}`.trim();
  if (item.unitSize && item.unitSize > 0 && item.unitLabel) {
    const count = Math.round(total / item.unitSize * 100) / 100;
    const label = count === 1 ? item.unitLabel : `${item.unitLabel}s`;
    return `${base} (${count.toLocaleString()} ${label})`;
  }
  return base;
}
function formatInventoryQuantity(record, item) {
  const recUnitSize = record.unitSize;
  const unit = record.unitSizeUnit || item.inventoryUnit || "";
  if (recUnitSize && recUnitSize > 0) {
    const total = record.quantity * recUnitSize;
    const label = item.unitLabel ? record.quantity === 1 ? item.unitLabel : `${item.unitLabel}s` : "";
    const parts = [`${record.quantity}`, "×", `${recUnitSize} ${unit}`.trim()];
    if (label) parts.push(label);
    parts.push("=", `${total.toLocaleString()} ${unit}`.trim());
    return parts.join(" ");
  }
  return formatWithUnits(record.quantity, item);
}
const itemInventoryTypes = computed(() => {
  const itemStore = useItemStore();
  const filteredItems = itemStore.items.filter((item) => item.type);
  const allTypes = [];
  filteredItems.forEach((item) => {
    if (item.type && !allTypes.includes(item.type)) {
      allTypes.push(item.type);
    }
  });
  allTypes.push("Bottle");
  return allTypes.sort((a, b) => a.localeCompare(b));
});

export { formatInventoryQuantity as a, allUnits as b, formatWithUnits as f, itemInventoryTypes as i, volumeUnits as v, weightUnits as w };
//# sourceMappingURL=units-DWysHFem.mjs.map

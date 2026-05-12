import { computed, type ComputedRef } from "vue";
import {
  buildFermentablesFromRecipe,
  calcGrainDisplacement,
  projectAll,
  toGallons,
  type ExtractType,
  type ProjectAllOutput,
  type BulkSpiritInput,
} from "../utils/grainBill";
import { useItemStore } from "../stores/useItemStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { useBulkSpiritStore } from "../stores/useBulkSpiritStore";

interface RecipeInput {
  volume?: number;
  volumeUnit?: string;
  items?: Array<{ _id: string; amount: number; unit: string }>;
  bulkSpirits?: Array<{ bulkSpirit: string; volume: number; volumeUnit: string }>;
  mashEfficiency?: number;
  attenuation?: number;
  distillationYield?: number;
  grainIn?: boolean;
}

/**
 * Reactive grain-bill projection for a recipe (client-side, for live preview).
 * Reads items from useItemStore + production defaults from useSettingsStore.
 * Pure recompute on any reactive change.
 */
export function useGrainBillCalculator(
  recipeRef: ComputedRef<RecipeInput | null | undefined> | (() => RecipeInput | null | undefined),
) {
  const itemStore = useItemStore();
  const settingsStore = useSettingsStore();
  const bulkSpiritStore = useBulkSpiritStore();

  const recipe = computed(() =>
    typeof recipeRef === "function" ? recipeRef() : recipeRef.value,
  );

  const effectiveSettings = computed(() => {
    const p: any = settingsStore.production ?? {};
    return {
      mashEfficiency: typeof p.mashEfficiency === "number" ? p.mashEfficiency : 75,
      fermentationAttenuation: typeof p.fermentationAttenuation === "number" ? p.fermentationAttenuation : 80,
      distillationYield: typeof p.distillationYield === "number" ? p.distillationYield : 80,
    };
  });

  const emptyProjection = (): ProjectAllOutput => ({
    og: 1,
    fg: 1,
    washAbv: 0,
    washVolGal: 0,
    fermentableLb: 0,
    totalPoints: 0,
    washInputPG: 0,
    bulkSpiritVolGal: 0,
    bulkSpiritAbv: 0,
    bulkSpiritPG: 0,
    projectedPG: 0,
    grainDisplacementGal: 0,
    effectiveWashVolGal: 0,
  });

  const projection = computed<ProjectAllOutput>(() => {
    const r = recipe.value;
    if (!r) return emptyProjection();

    const hasItems = (r.items?.length ?? 0) > 0;
    const hasBulkSpirits = (r.bulkSpirits?.length ?? 0) > 0;
    if (!hasItems && !hasBulkSpirits) return emptyProjection();

    // Fermentables (grain bill)
    let fermentables: ReturnType<typeof buildFermentablesFromRecipe> = [];
    let grainDisplacementGal = 0;
    if (hasItems && r.items) {
      const lookup = new Map<
        string,
        { ppg?: number; extractType?: ExtractType; fermentable?: boolean; displacement?: number }
      >();
      for (const it of itemStore.items as any[]) {
        lookup.set(String(it._id), {
          ppg: it.ppg,
          extractType: it.extractType as ExtractType | undefined,
          fermentable: it.fermentable,
          displacement: it.displacement,
        });
      }
      const normalizedItems = r.items.map((i) => ({
        _id: String(i._id),
        amount: i.amount,
        unit: i.unit,
      }));
      fermentables = buildFermentablesFromRecipe(normalizedItems, lookup);
      grainDisplacementGal = calcGrainDisplacement(normalizedItems, lookup);
    }

    // Bulk spirits (gin / redistillation)
    const bulkSpiritInputs: BulkSpiritInput[] = [];
    if (hasBulkSpirits && r.bulkSpirits) {
      for (const ref of r.bulkSpirits) {
        if (!ref?.bulkSpirit || !ref?.volume) continue;
        const bs = bulkSpiritStore.getBulkSpiritById(ref.bulkSpirit);
        const abv = bs?.abv;
        if (!abv) continue;
        bulkSpiritInputs.push({
          volumeGal: toGallons(ref.volume, ref.volumeUnit || "gallon"),
          abv,
        });
      }
    }

    const settings = effectiveSettings.value;
    return projectAll({
      fermentables,
      bulkSpirits: bulkSpiritInputs,
      washVolume: r.volume ?? 0,
      washVolumeUnit: r.volumeUnit ?? "gallon",
      mashEfficiencyPct: r.mashEfficiency ?? settings.mashEfficiency,
      attenuationPct: r.attenuation ?? settings.fermentationAttenuation,
      distillationYieldPct: r.distillationYield ?? settings.distillationYield,
      grainIn: !!r.grainIn,
      grainDisplacementGal,
    });
  });

  const usingDefaults = computed(() => {
    const r = recipe.value;
    return {
      mashEfficiency: r?.mashEfficiency == null,
      attenuation: r?.attenuation == null,
      distillationYield: r?.distillationYield == null,
    };
  });

  return {
    projection,
    effectiveSettings,
    usingDefaults,
  };
}

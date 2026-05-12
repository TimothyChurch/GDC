<script setup lang="ts">
import type { Recipe } from "../../types/interfaces/Recipe";

const props = defineProps<{
  recipe: Partial<Recipe>;
}>();

const emit = defineEmits<{
  "update:recipe": [Partial<Recipe>];
}>();

const recipeRef = computed(() => props.recipe);
const { projection, effectiveSettings, usingDefaults } = useGrainBillCalculator(recipeRef);

const showOverrides = ref(false);

function fmt(n: number, digits = 3) {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}
function fmt2(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}
function fmtPct(n: number) {
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : "—";
}

function setOverride(key: "mashEfficiency" | "attenuation" | "distillationYield", value: number | null) {
  emit("update:recipe", { ...props.recipe, [key]: value ?? undefined });
}

function clearOverride(key: "mashEfficiency" | "attenuation" | "distillationYield") {
  const next = { ...props.recipe };
  delete (next as any)[key];
  emit("update:recipe", next);
}
</script>

<template>
  <div class="rounded border border-white/10 bg-black/20 p-3 text-sm">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold text-parchment text-sm tracking-wide uppercase">
        Projected Wash & Output
      </h3>
      <UButton
        size="xs"
        variant="ghost"
        :icon="showOverrides ? 'i-lucide-chevron-up' : 'i-lucide-sliders-horizontal'"
        :label="showOverrides ? 'Hide' : 'Overrides'"
        @click="showOverrides = !showOverrides"
      />
    </div>

    <div
      v-if="projection.fermentableLb <= 0 && projection.bulkSpiritPG <= 0"
      class="text-parchment/60 italic"
    >
      Add fermentable ingredients (with PPG set on the Item) or bulk spirits to see projections.
    </div>

    <div v-else class="space-y-3">
      <!-- Grain wash projection -->
      <div
        v-if="projection.fermentableLb > 0"
        class="grid grid-cols-2 gap-x-4 gap-y-1 text-parchment/90"
      >
        <div class="col-span-2 text-xs uppercase tracking-wider text-amber-300/70">
          Grain wash
        </div>
        <div class="text-parchment/60">Wash volume</div>
        <div>{{ fmt2(projection.washVolGal) }} gal</div>

        <template v-if="props.recipe.grainIn && projection.grainDisplacementGal > 0">
          <div class="text-parchment/60">Grain displacement</div>
          <div>−{{ fmt2(projection.grainDisplacementGal) }} gal</div>

          <div class="text-parchment/60">Effective liquid</div>
          <div class="text-amber-300">{{ fmt2(projection.effectiveWashVolGal) }} gal</div>
        </template>

        <div class="text-parchment/60">Original Gravity</div>
        <div>{{ fmt(projection.og) }}</div>

        <div class="text-parchment/60">Final Gravity</div>
        <div>{{ fmt(projection.fg) }}</div>

        <div class="text-parchment/60">Wash ABV</div>
        <div>{{ fmtPct(projection.washAbv) }}</div>

        <div class="text-parchment/60">Fermentable bill</div>
        <div>{{ fmt2(projection.fermentableLb) }} lb</div>

        <div class="text-parchment/60">Wash input</div>
        <div>{{ fmt2(projection.washInputPG) }} PG</div>
      </div>

      <!-- Bulk-spirit projection (gin / redistillation) -->
      <div
        v-if="projection.bulkSpiritPG > 0"
        class="grid grid-cols-2 gap-x-4 gap-y-1 text-parchment/90"
      >
        <div class="col-span-2 text-xs uppercase tracking-wider text-amber-300/70">
          Bulk-spirit charge
        </div>
        <div class="text-parchment/60">Input volume</div>
        <div>{{ fmt2(projection.bulkSpiritVolGal) }} gal</div>

        <div class="text-parchment/60">Avg input ABV</div>
        <div>{{ fmtPct(projection.bulkSpiritAbv) }}</div>

        <div class="text-parchment/60">Input PG</div>
        <div>{{ fmt2(projection.bulkSpiritPG) }} PG</div>
      </div>

      <!-- Combined output -->
      <div
        class="grid grid-cols-2 gap-x-4 gap-y-1 text-parchment pt-2 border-t border-white/10"
      >
        <div class="text-parchment/60 font-semibold">Projected output</div>
        <div class="font-semibold text-amber-300">
          {{ fmt2(projection.projectedPG) }} PG
        </div>
        <div
          v-if="projection.fermentableLb > 0 && projection.bulkSpiritPG > 0"
          class="col-span-2 text-xs text-parchment/50 italic"
        >
          (combined wash + bulk spirit charge after distillation yield)
        </div>
      </div>
    </div>

    <div v-if="showOverrides" class="mt-3 pt-3 border-t border-white/10 space-y-2">
      <p class="text-xs text-parchment/60">
        Leave blank to inherit from Settings → Production
        ({{ effectiveSettings.mashEfficiency }}% / {{ effectiveSettings.fermentationAttenuation }}% / {{ effectiveSettings.distillationYield }}%).
      </p>

      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="text-xs text-parchment/60 block mb-1">
            Mash Eff.
            <span v-if="usingDefaults.mashEfficiency" class="text-parchment/40">(default)</span>
          </label>
          <UInput
            type="number"
            size="xs"
            min="0"
            max="100"
            :model-value="props.recipe.mashEfficiency ?? null"
            placeholder="—"
            @update:model-value="(v: any) => v === '' || v == null ? clearOverride('mashEfficiency') : setOverride('mashEfficiency', Number(v))"
          />
        </div>
        <div>
          <label class="text-xs text-parchment/60 block mb-1">
            Attenuation
            <span v-if="usingDefaults.attenuation" class="text-parchment/40">(default)</span>
          </label>
          <UInput
            type="number"
            size="xs"
            min="0"
            max="100"
            :model-value="props.recipe.attenuation ?? null"
            placeholder="—"
            @update:model-value="(v: any) => v === '' || v == null ? clearOverride('attenuation') : setOverride('attenuation', Number(v))"
          />
        </div>
        <div>
          <label class="text-xs text-parchment/60 block mb-1">
            Dist. Yield
            <span v-if="usingDefaults.distillationYield" class="text-parchment/40">(default)</span>
          </label>
          <UInput
            type="number"
            size="xs"
            min="0"
            max="100"
            :model-value="props.recipe.distillationYield ?? null"
            placeholder="—"
            @update:model-value="(v: any) => v === '' || v == null ? clearOverride('distillationYield') : setOverride('distillationYield', Number(v))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

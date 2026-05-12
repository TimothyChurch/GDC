<script setup lang="ts">
import {
  projectGravity,
  projectFG,
  projectWashAbv,
  projectDistillationPG,
} from "~/utils/grainBill";
import type { SettingsProduction } from "~/types/interfaces/Settings";

const settingsStore = useSettingsStore();

const local = ref<SettingsProduction>({
  mashEfficiency: 75,
  fermentationAttenuation: 80,
  distillationYield: 80,
});

function reset() {
  const p = settingsStore.production;
  local.value = {
    mashEfficiency: p.mashEfficiency ?? 75,
    fermentationAttenuation: p.fermentationAttenuation ?? 80,
    distillationYield: p.distillationYield ?? 80,
  };
}
reset();
watch(() => settingsStore.production, reset, { deep: true });

async function save() {
  await settingsStore.updateSettings({ production: { ...local.value } });
}

const seeding = ref(false);
const seedResult = ref<{
  matchedCount?: number;
  unmatchedCount?: number;
  matched?: Array<{ name: string; ppg: number; extractType: string }>;
  unmatched?: string[];
  alreadyApplied?: boolean;
} | null>(null);

const toast = useToast();

async function seedGrainDefaults() {
  seeding.value = true;
  seedResult.value = null;
  try {
    const result: any = await $fetch("/api/item/seed-grain-defaults", { method: "POST" });
    seedResult.value = result;
    if (result.alreadyApplied) {
      toast.add({
        title: "Already applied",
        description: "Grain defaults were seeded earlier.",
        color: "warning",
        icon: "i-lucide-info",
      });
    } else {
      toast.add({
        title: "Grain defaults seeded",
        description: `Matched ${result.matchedCount} items; ${result.unmatchedCount} unmatched.`,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    }
  } catch (err: any) {
    toast.add({
      title: "Seeding failed",
      description: err?.statusMessage || err?.message || "Unknown error",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    seeding.value = false;
  }
}

// Live preview using a representative bourbon-style mash:
// 50 lb 2-row malt + 50 lb flaked corn in 100 gal
const preview = computed(() => {
  const fermentables = [
    { weightLb: 50, ppg: 37, extractType: "malted_grain" as const },
    { weightLb: 50, ppg: 39, extractType: "flaked_grain" as const },
  ];
  const { og } = projectGravity(fermentables, 100, local.value.mashEfficiency);
  const fg = projectFG(og, local.value.fermentationAttenuation);
  const washAbv = projectWashAbv(og, fg);
  const pg = projectDistillationPG(100, washAbv, local.value.distillationYield);
  return { og, fg, washAbv, pg };
});

function fmt(n: number, digits = 3) {
  return Number.isFinite(n) ? n.toFixed(digits) : "—";
}
function fmt2(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-6 mt-4">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">
        Production Defaults
      </h3>
      <p class="text-sm text-parchment/60 mt-1">
        Defaults used for grain-bill projections — projected OG, FG, wash ABV,
        and proof gallons on every recipe. Recipes may override any value
        per-recipe.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <UFormField
        label="Mash Efficiency"
        help="% of theoretical sugars extracted from grain"
      >
        <UInput
          v-model.number="local.mashEfficiency"
          type="number"
          min="0"
          max="100"
          step="1"
        >
          <template #trailing>
            <span class="text-parchment/60 text-sm">%</span>
          </template>
        </UInput>
      </UFormField>

      <UFormField
        label="Yeast Attenuation"
        help="% of fermentable sugars converted to alcohol"
      >
        <UInput
          v-model.number="local.fermentationAttenuation"
          type="number"
          min="0"
          max="100"
          step="1"
        >
          <template #trailing>
            <span class="text-parchment/60 text-sm">%</span>
          </template>
        </UInput>
      </UFormField>

      <UFormField
        label="Distillation Yield"
        help="% of wash proof gallons recovered"
      >
        <UInput
          v-model.number="local.distillationYield"
          type="number"
          min="0"
          max="100"
          step="1"
        >
          <template #trailing>
            <span class="text-parchment/60 text-sm">%</span>
          </template>
        </UInput>
      </UFormField>
    </div>

    <div class="mt-6 rounded border border-amber-500/30 bg-amber-500/5 p-4">
      <div class="text-sm font-semibold text-parchment/90 mb-2">
        Live preview — 100 gal wash, 50 lb 2-row + 50 lb flaked corn
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        <div>
          <div class="text-parchment/60 text-xs">OG</div>
          <div class="text-parchment">{{ fmt(preview.og) }}</div>
        </div>
        <div>
          <div class="text-parchment/60 text-xs">FG</div>
          <div class="text-parchment">{{ fmt(preview.fg) }}</div>
        </div>
        <div>
          <div class="text-parchment/60 text-xs">Wash ABV</div>
          <div class="text-parchment">{{ fmt2(preview.washAbv) }}%</div>
        </div>
        <div>
          <div class="text-parchment/60 text-xs">Output PG</div>
          <div class="text-parchment">{{ fmt2(preview.pg) }}</div>
        </div>
      </div>
    </div>

    <div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
      <div class="flex items-center gap-2">
        <UButton label="Reset" variant="ghost" color="neutral" @click="reset" />
        <UButton
          label="Save Production Settings"
          icon="i-lucide-save"
          color="primary"
          :loading="settingsStore.saving"
          @click="save"
        />
      </div>
    </div>

    <!-- Grain Defaults Seeder -->
    <div class="mt-6 pt-6 border-t border-brown/20">
      <div class="mb-3">
        <h4 class="text-sm font-semibold text-parchment">
          Seed Grain Defaults
        </h4>
        <p class="text-xs text-parchment/60 mt-1">
          One-time admin migration: matches every Item under "Base Ingredient"
          against the built-in grain reference (2-row, flaked corn, cane sugar,
          etc.) and fills in PPG, extract type, and fermentable flag where
          missing. Items with existing PPG values are skipped.
        </p>
      </div>

      <UButton
        label="Run Backfill"
        icon="i-lucide-wheat"
        variant="soft"
        color="warning"
        :loading="seeding"
        @click="seedGrainDefaults"
      />

      <div v-if="seedResult" class="mt-4 rounded border border-white/10 bg-black/20 p-3 text-sm space-y-2">
        <div v-if="seedResult.alreadyApplied" class="text-amber-300">
          Already applied in a previous session.
        </div>
        <template v-else>
          <div class="text-parchment/90">
            Matched <b>{{ seedResult.matchedCount }}</b> items;
            <b>{{ seedResult.unmatchedCount }}</b> unmatched.
          </div>
          <details v-if="seedResult.matched?.length" class="text-xs text-parchment/70">
            <summary class="cursor-pointer hover:text-parchment">
              Show matched items
            </summary>
            <ul class="mt-2 space-y-0.5 pl-4 list-disc">
              <li v-for="m in seedResult.matched" :key="m.name">
                {{ m.name }} → PPG {{ m.ppg }} ({{ m.extractType }})
              </li>
            </ul>
          </details>
          <details v-if="seedResult.unmatched?.length" class="text-xs text-parchment/70">
            <summary class="cursor-pointer hover:text-parchment">
              Show unmatched items (need manual entry)
            </summary>
            <ul class="mt-2 space-y-0.5 pl-4 list-disc">
              <li v-for="name in seedResult.unmatched" :key="name">
                {{ name }}
              </li>
            </ul>
          </details>
        </template>
      </div>
    </div>
  </div>
</template>

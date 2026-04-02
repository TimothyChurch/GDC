<script setup lang="ts">
const props = defineProps<{ bulkSpiritId: string }>();

const bulkSpiritStore = useBulkSpiritStore();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

const bs = computed(() => bulkSpiritStore.getBulkSpiritById(props.bulkSpiritId));

function batchLabel(batchId: string): string {
  const batch = batchStore.getBatchById(batchId);
  if (!batch) return batchId;
  const recipe = recipeStore.getRecipeById(batch.recipe);
  return recipe?.name ? `${recipe.name} #${batch.batchNumber || batch._id.slice(-4)}` : `Batch #${batch.batchNumber || batch._id.slice(-4)}`;
}

function shortUnit(unit: string) {
  return unit.replace(/gallon/i, 'gal').replace(/liter/i, 'L');
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Combine deposits and withdrawals into a chronological ledger
const ledgerEntries = computed(() => {
  if (!bs.value) return [];
  const entries: Array<{
    type: 'deposit' | 'withdrawal';
    date: Date | string;
    batch: string;
    volume: number;
    volumeUnit: string;
    abv: number;
    proofGallons: number;
    value: number;
    costPerProofGallon: number;
  }> = [];
  for (const d of bs.value.deposits || []) {
    entries.push({ type: 'deposit', ...d });
  }
  for (const w of bs.value.withdrawals || []) {
    entries.push({ type: 'withdrawal', ...w });
  }
  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});
</script>

<template>
  <div v-if="bs">
    <h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-3">
      {{ bs.name }} — Ledger
    </h3>
    <div v-if="ledgerEntries.length === 0" class="text-sm text-parchment/50">
      No transactions yet.
    </div>
    <div v-else class="space-y-1.5">
      <div
        v-for="(entry, idx) in ledgerEntries"
        :key="idx"
        class="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
        :class="entry.type === 'deposit'
          ? 'border-green-500/20 bg-green-500/5'
          : 'border-orange-500/20 bg-orange-500/5'"
      >
        <UIcon
          :name="entry.type === 'deposit' ? 'i-lucide-arrow-down-to-line' : 'i-lucide-arrow-up-from-line'"
          :class="entry.type === 'deposit' ? 'text-green-400' : 'text-orange-400'"
        />
        <span class="text-parchment/50 w-24 shrink-0">{{ formatDate(entry.date) }}</span>
        <span class="text-parchment truncate flex-1">{{ batchLabel(entry.batch) }}</span>
        <span class="text-parchment/70 w-24 text-right">
          {{ entry.type === 'deposit' ? '+' : '-' }}{{ entry.volume.toFixed(1) }} {{ shortUnit(entry.volumeUnit) }}
        </span>
        <span class="text-parchment/70 w-20 text-right">{{ entry.proofGallons.toFixed(2) }} PG</span>
        <span class="w-24 text-right" :class="entry.type === 'deposit' ? 'text-green-400' : 'text-orange-400'">
          {{ entry.type === 'deposit' ? '+' : '-' }}{{ Dollar.format(entry.value) }}
        </span>
      </div>
    </div>
  </div>
</template>

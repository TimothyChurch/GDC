<script setup lang="ts">
const vesselStore = useVesselStore();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();

interface VesselGroup {
  title: string;
  icon: string;
  color: string;
  vessels: any[];
  type: string;
}

const vesselGroups = computed<VesselGroup[]>(() => [
  {
    title: 'Mash Tuns',
    icon: 'i-lucide-flame',
    color: 'text-orange-400',
    vessels: vesselStore.mashTuns,
    type: 'mash-tun',
  },
  {
    title: 'Fermenters',
    icon: 'i-lucide-beaker',
    color: 'text-yellow-400',
    vessels: vesselStore.fermenters,
    type: 'fermenter',
  },
  {
    title: 'Stills',
    icon: 'i-lucide-flask-conical',
    color: 'text-copper',
    vessels: vesselStore.stills,
    type: 'still',
  },
  {
    title: 'Tanks',
    icon: 'i-lucide-warehouse',
    color: 'text-purple-400',
    vessels: vesselStore.tanks,
    type: 'tank',
  },
]);

const filledBarrels = computed(() =>
  vesselStore.barrels.filter((b) => b.contents && b.contents.length > 0)
);
const emptyBarrels = computed(() =>
  vesselStore.barrels.filter((b) => !b.contents || b.contents.length === 0)
);

const getContentLabel = (vessel: any) => {
  if (!vessel.contents || vessel.contents.length === 0) return null;
  const content = vessel.contents[0];
  const batch = batchStore.getBatchById(content.batch);
  const recipeName = batch ? recipeStore.getRecipeById(batch.recipe)?.name : null;
  return recipeName || 'Unknown';
};

const getVesselVolume = (vessel: any) => {
  if (!vessel.contents || vessel.contents.length === 0) return null;
  const totalVol = vessel.contents.reduce((sum: number, c: any) => sum + (c.volume || 0), 0);
  const unit = vessel.contents[0]?.volumeUnit || 'gal';
  return `${totalVol} ${unit}`;
};

const hasContents = (vessel: any) => vessel.contents && vessel.contents.length > 0;
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Vessel Status</h2>
        <p class="text-xs text-parchment/60 mt-0.5">
          {{ vesselStore.vessels.length }} total vessels
        </p>
      </div>
      <NuxtLink
        to="/admin/vessels"
        class="text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      >
        View All
        <UIcon name="i-lucide-arrow-right" class="text-sm" />
      </NuxtLink>
    </div>

    <!-- Vessel groups -->
    <div class="space-y-4">
      <div v-for="group in vesselGroups" :key="group.type">
        <div class="flex items-center gap-2 mb-2">
          <UIcon :name="group.icon" :class="['text-sm', group.color]" />
          <span class="text-xs font-semibold uppercase tracking-wider text-parchment/50">
            {{ group.title }}
            <span class="text-parchment/50">({{ group.vessels.length }})</span>
          </span>
        </div>
        <div v-if="group.vessels.length === 0" class="text-xs text-parchment/20 pl-5 pb-2">
          None configured
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="vessel in group.vessels"
            :key="vessel._id"
            :class="[
              'rounded-lg border px-3 py-2 flex items-center justify-between',
              hasContents(vessel)
                ? 'bg-brown/20 border-brown/30'
                : 'bg-brown/5 border-brown/15',
            ]"
          >
            <div class="min-w-0">
              <div class="text-sm text-parchment font-medium truncate">{{ vessel.name }}</div>
              <div v-if="hasContents(vessel)" class="text-xs text-copper truncate">
                {{ getContentLabel(vessel) }}
              </div>
              <div v-else class="text-xs text-parchment/25">Empty</div>
            </div>
            <div v-if="hasContents(vessel)" class="text-xs text-parchment/50 shrink-0 ml-2">
              {{ getVesselVolume(vessel) }}
            </div>
            <div
              v-else
              class="w-2 h-2 rounded-full bg-parchment/15 shrink-0 ml-2"
            />
          </div>
        </div>
      </div>

      <!-- Barrels section -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-lucide-cylinder" class="text-sm text-amber" />
          <span class="text-xs font-semibold uppercase tracking-wider text-parchment/50">
            Barrels
            <span class="text-parchment/50">({{ vesselStore.barrels.length }})</span>
          </span>
        </div>
        <div v-if="vesselStore.barrels.length === 0" class="text-xs text-parchment/20 pl-5 pb-2">
          None configured
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <div class="flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-lg px-3 py-1.5">
            <div class="w-2 h-2 rounded-full bg-amber" />
            <span class="text-xs text-parchment/70">
              {{ filledBarrels.length }} filled
            </span>
          </div>
          <div class="flex items-center gap-2 bg-brown/10 border border-brown/20 rounded-lg px-3 py-1.5">
            <div class="w-2 h-2 rounded-full bg-parchment/20" />
            <span class="text-xs text-parchment/60">
              {{ emptyBarrels.length }} empty
            </span>
          </div>
        </div>
        <!-- Show filled barrel details -->
        <div v-if="filledBarrels.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <div
            v-for="barrel in filledBarrels.slice(0, 6)"
            :key="barrel._id"
            class="rounded-lg border bg-brown/20 border-brown/30 px-3 py-2"
          >
            <div class="text-sm text-parchment font-medium truncate">{{ barrel.name }}</div>
            <div v-for="content in barrel.contents" :key="content.batch" class="text-xs text-copper truncate">
              {{ getContentLabel(barrel) }} - {{ content.volume }} {{ content.volumeUnit }}
            </div>
          </div>
          <div
            v-if="filledBarrels.length > 6"
            class="text-xs text-parchment/50 flex items-center px-3"
          >
            +{{ filledBarrels.length - 6 }} more barrels
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { volumeUnits } from '~/utils/units';
import { convertUnitRatio } from '~/utils/conversions';

const emit = defineEmits<{ close: [boolean] }>();

const vesselStore = useVesselStore();
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const toast = useToast();

const sourceId = ref('');
const destId = ref('');
const transferMode = ref<'full' | 'partial'>('full');
const transferVolume = ref(0);
const transferUnit = ref('gallon');
const loading = ref(false);

const sourceVessel = computed(() =>
  sourceId.value ? vesselStore.getVesselById(sourceId.value) : undefined
);

const sourceContents = computed(() => {
  if (!sourceVessel.value?.contents?.length) return [];
  return sourceVessel.value.contents.map(c => {
    const batch = batchStore.getBatchById(c.batch);
    const recipe = batch?.recipe ? recipeStore.getRecipeById(batch.recipe) : undefined;
    return {
      name: recipe?.name || 'Unknown',
      volume: c.volume,
      volumeUnit: c.volumeUnit,
      abv: c.abv,
      value: c.value,
    };
  });
});

const totalSourceVolume = computed(() => {
  const contents = sourceVessel.value?.contents;
  if (!contents?.length) return 0;
  return contents.reduce(
    (acc, c) => acc + c.volume * convertUnitRatio(c.volumeUnit, transferUnit.value), 0
  );
});

const estimatedTransferValue = computed(() => {
  if (totalSourceVolume.value <= 0 || transferVolume.value <= 0) return 0;
  const totalValue = sourceVessel.value?.contents?.reduce((acc, c) => acc + c.value, 0) || 0;
  const ratio = transferVolume.value / totalSourceVolume.value;
  return totalValue * Math.min(ratio, 1);
});

const availableDestinations = computed(() =>
  vesselStore.vessels.filter(v => v._id !== sourceId.value)
);

const vesselOptions = computed(() =>
  vesselStore.vessels.map(v => ({ label: v.name, value: v._id }))
);

const destOptions = computed(() =>
  availableDestinations.value.map(v => ({ label: v.name, value: v._id }))
);

const doTransfer = async () => {
  if (!sourceId.value || !destId.value) return;
  loading.value = true;
  try {
    if (transferMode.value === 'full') {
      await vesselStore.fullTransfer(sourceId.value, destId.value);
    } else {
      await vesselStore.transferBatch(sourceId.value, destId.value, {
        volume: transferVolume.value,
        volumeUnit: transferUnit.value,
        abv: sourceVessel.value?.current?.abv || 0,
        value: estimatedTransferValue.value,
      });
    }
    sourceId.value = '';
    destId.value = '';
    transferVolume.value = 0;
  } catch (error: unknown) {
    toast.add({ title: 'Transfer failed', description: getErrorMessage(error), color: 'error', icon: 'i-lucide-alert-circle' });
  } finally {
    loading.value = false;
  }
};

const cancel = () => emit('close', true);
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Vessel Transfer</h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-5">
          <!-- Source -->
          <UFormField label="Source Vessel">
            <USelect v-model="sourceId" :items="vesselOptions" placeholder="Select source..." value-key="value" />
          </UFormField>

          <!-- Source contents -->
          <div v-if="sourceContents.length > 0" class="bg-brown/10 rounded-lg border border-brown/20 p-3">
            <div class="text-xs font-semibold text-parchment/60 uppercase tracking-wider mb-2">Contents</div>
            <div v-for="(item, i) in sourceContents" :key="i" class="flex justify-between text-xs text-parchment/70 py-1">
              <span>{{ item.name }}</span>
              <span>{{ item.volume }} {{ item.volumeUnit }} / {{ item.abv }}% / {{ Dollar.format(item.value) }}</span>
            </div>
          </div>
          <div v-else-if="sourceId" class="text-xs text-parchment/50 py-2">Source vessel is empty</div>

          <!-- Destination -->
          <UFormField label="Destination Vessel">
            <USelect v-model="destId" :items="destOptions" placeholder="Select destination..." value-key="value" />
          </UFormField>

          <!-- Transfer mode -->
          <div class="flex gap-2">
            <UButton
              :variant="transferMode === 'full' ? 'solid' : 'outline'"
              @click="transferMode = 'full'"
              class="flex-1"
            >
              Full Transfer
            </UButton>
            <UButton
              :variant="transferMode === 'partial' ? 'solid' : 'outline'"
              @click="transferMode = 'partial'"
              class="flex-1"
            >
              Partial Transfer
            </UButton>
          </div>

          <!-- Partial transfer inputs -->
          <div v-if="transferMode === 'partial'" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Volume">
                <UInput v-model="transferVolume" type="number" min="0" :max="totalSourceVolume" />
              </UFormField>
              <UFormField label="Unit">
                <USelect v-model="transferUnit" :items="volumeUnits" />
              </UFormField>
            </div>
            <div class="text-xs text-parchment/50">
              Estimated value: {{ Dollar.format(estimatedTransferValue) }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
          <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
          <UButton
            @click="doTransfer"
            :loading="loading"
            :disabled="!sourceId || !destId || (transferMode === 'partial' && transferVolume <= 0)"
          >
            Transfer
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

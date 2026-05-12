<script setup lang="ts">
import * as yup from 'yup';

const emit = defineEmits<{ close: [boolean] }>();

const bulkSpiritStore = useBulkSpiritStore();
const vesselStore = useVesselStore();

const schema = yup.object({
  name: yup.string().required('Name is required'),
  spiritClass: yup.string().required('Spirit class is required'),
});

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => bulkSpiritStore.bulkSpirit,
  draft: { key: 'PanelBulkSpirit', id: () => bulkSpiritStore.bulkSpirit._id },
  async onSave(data) {
    Object.assign(bulkSpiritStore.bulkSpirit, data);
    await bulkSpiritStore.saveItem();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const tankOptions = computed(() =>
  vesselStore.tanks.map((t) => ({ label: t.name, value: t._id })),
);

const spiritClassOptions = [
  'Neutral',
  'Whiskey',
  'Bourbon',
  'Rum',
  'Gin Base',
  'Brandy',
  'Other',
];
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Bulk Spirit' : 'Edit Bulk Spirit' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <UFormField label="Name" name="name">
              <UInput v-model="localData.name" placeholder="e.g. Neutral Spirit" class="w-full" />
            </UFormField>
            <UFormField label="Spirit Class" name="spiritClass">
              <USelectMenu
                v-model="localData.spiritClass"
                :items="spiritClassOptions"
                placeholder="Select class"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Storage Vessel">
              <USelectMenu
                v-model="localData.vessel"
                :items="tankOptions"
                value-key="value"
                placeholder="Select tank (optional)"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Notes">
              <UTextarea v-model="localData.notes" placeholder="Optional notes" />
            </UFormField>

            <!-- Read-only stats for existing entries -->
            <template v-if="!isNew">
              <div class="border-t border-white/10 pt-4 space-y-2">
                <div class="text-xs text-parchment/60 uppercase tracking-wider">Current Inventory</div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-parchment/50">Volume:</span>
                    <span class="text-parchment ml-1">{{ localData.volume?.toFixed(1) }} {{ localData.volumeUnit }}</span>
                  </div>
                  <div>
                    <span class="text-parchment/50">ABV:</span>
                    <span class="text-parchment ml-1">{{ localData.abv?.toFixed(1) }}%</span>
                  </div>
                  <div>
                    <span class="text-parchment/50">Proof Gallons:</span>
                    <span class="text-parchment ml-1">{{ localData.proofGallons?.toFixed(2) }}</span>
                  </div>
                  <div>
                    <span class="text-parchment/50">Cost/PG:</span>
                    <span class="text-gold ml-1">{{ Dollar.format(localData.costPerProofGallon || 0) }}</span>
                  </div>
                  <div class="col-span-2">
                    <span class="text-parchment/50">Total Value:</span>
                    <span class="text-gold ml-1">{{ Dollar.format(localData.totalValue || 0) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
            <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
            <UButton type="submit" :loading="saving" :disabled="!isDirty">
              {{ isNew ? 'Create' : 'Save' }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>

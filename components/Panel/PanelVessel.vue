<script setup lang="ts">
import { getBarrelAgeDefault } from '~/composables/definitions'

const emit = defineEmits<{ close: [boolean] }>();

const vesselStore = useVesselStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => vesselStore.vessel,
  async onSave(data) {
    Object.assign(vesselStore.vessel, data);
    await vesselStore.updateVessel();
  },
  onClose: () => emit("close", true),
});

const isNew = !localData.value._id;

const vesselTypes = computed(() => {
  const types = ["Mash Tun", "Fermenter", "Still", "Tank", "Barrel"];
  vesselStore.vessels.forEach((vessel) => {
    if (!types.includes(vessel.type)) types.push(vessel.type);
  });
  return types.sort((a, b) => a.localeCompare(b));
});

const barrelSizes = BARREL_SIZES;
const charLevels = CHAR_LEVELS;

const sizeDefault = computed(() => getBarrelAgeDefault(localData.value.barrel?.size));
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-white/10"
        >
          <h2
            class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"
          >
            {{ isNew ? "New Vessel" : "Edit Vessel" }}
          </h2>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            @click="cancel"
          />
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput v-model="localData.name" placeholder="Vessel name" />
          </UFormField>
          <UFormField label="Type">
            <USelectMenu
              v-model="localData.type"
              :items="vesselTypes"
              placeholder="Type"
              creatable
              searchable
              class="w-full"
            />
          </UFormField>
          <UFormField label="Weight">
            <BaseQuantityInput
              v-model:value="localData.stats.weight"
              v-model:unit="localData.stats.weightUnit"
              :unit-options="weightUnits"
            />
          </UFormField>
          <UFormField label="Capacity">
            <BaseQuantityInput
              v-model:value="localData.stats.volume"
              v-model:unit="localData.stats.volumeUnit"
              :unit-options="volumeUnits"
            />
          </UFormField>
          <template v-if="localData.type === 'Barrel'">
            <UFormField label="Barrel Size">
              <USelect
                v-model="localData.barrel.size"
                :items="barrelSizes"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Char Level">
              <USelect
                v-model="localData.barrel.char"
                :items="charLevels"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Cost">
              <UInput
                v-model="localData.barrel.cost"
                type="number"
                icon="i-lucide-dollar-sign"
              />
            </UFormField>
            <div class="flex items-center justify-between">
              <UFormField label="Used Barrel">
                <template #description>
                  <span class="text-xs text-parchment/50">Mark as previously used (auto-set when emptied)</span>
                </template>
              </UFormField>
              <USwitch v-model="localData.isUsed" />
            </div>
            <UFormField v-if="localData.isUsed" label="Previous Contents">
              <UInput
                v-model="localData.previousContents"
                placeholder="e.g. Bourbon, Rum, Wine"
              />
            </UFormField>
            <UFormField label="Target Age (months)">
              <UInput
                v-model.number="localData.targetAge"
                type="number"
                :placeholder="sizeDefault ? `Default: ${sizeDefault}` : 'e.g. 24'"
              />
              <template #description>
                <span class="text-xs text-parchment/50">
                  <template v-if="localData.targetAge">Custom override</template>
                  <template v-else-if="sizeDefault">Will use size default ({{ sizeDefault }} mo)</template>
                  <template v-else>No default for this barrel size</template>
                </span>
              </template>
            </UFormField>
          </template>
        </div>
        <div
          class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"
        >
          <UButton color="neutral" variant="outline" @click="cancel"
            >Cancel</UButton
          >
          <UButton @click="save" :loading="saving" :disabled="!isDirty">
            {{ isNew ? "Create" : "Save" }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

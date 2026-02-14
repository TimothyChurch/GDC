<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const vesselStore = useVesselStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => vesselStore.vessel,
  async onSave(data) {
    Object.assign(vesselStore.vessel, data);
    await vesselStore.updateVessel();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const vesselTypes = computed(() => {
  const types = ['Mash Tun', 'Fermenter', 'Still', 'Tank', 'Barrel'];
  vesselStore.vessels.forEach((vessel) => {
    if (!types.includes(vessel.type)) types.push(vessel.type);
  });
  return types.sort((a, b) => a.localeCompare(b));
});

const barrelSizes = ['5 Gallon', '10 Gallon', '15 Gallon', '30 Gallon', '53 Gallon'];
const charLevels = ['Char 1', 'Char 2', 'Char 3', 'Char 4', 'Char 5'];
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Vessel' : 'Edit Vessel' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="Name">
            <UInput v-model="localData.name" placeholder="Vessel name" />
          </UFormField>
          <UFormField label="Type">
            <USelectMenu
              v-model="localData.type"
              :options="vesselTypes"
              placeholder="Type"
              creatable
              searchable
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Weight">
              <UInput v-model="localData.stats.weight" type="number" />
            </UFormField>
            <UFormField label="Weight Unit">
              <USelect v-model="localData.stats.weightUnit" :options="weightUnits" />
            </UFormField>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Capacity">
              <UInput v-model="localData.stats.volume" type="number" />
            </UFormField>
            <UFormField label="Volume Unit">
              <USelect v-model="localData.stats.volumeUnit" :options="volumeUnits" />
            </UFormField>
          </div>
          <template v-if="localData.type === 'Barrel'">
            <UFormField label="Barrel Size">
              <USelect v-model="localData.barrel.size" :options="barrelSizes" />
            </UFormField>
            <UFormField label="Char Level">
              <USelect v-model="localData.barrel.char" :options="charLevels" />
            </UFormField>
            <UFormField label="Cost">
              <UInput v-model="localData.barrel.cost" type="number" icon="i-lucide-dollar-sign" />
            </UFormField>
          </template>
        </div>
        <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
          <UButton color="neutral" variant="outline" @click="cancel">Cancel</UButton>
          <UButton @click="save" :loading="saving" :disabled="!isDirty">
            {{ isNew ? 'Create' : 'Save' }}
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>

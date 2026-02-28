<script setup lang="ts">
const settingsStore = useSettingsStore();

const localDistillery = ref({
  name: "",
  address: "",
  permitNumbers: { ttb: "", tabc: "" },
});

function resetDistillery() {
  localDistillery.value = structuredClone(toRaw(settingsStore.distillery));
}
resetDistillery();

watch(() => settingsStore.distillery, resetDistillery);

async function saveDistillery() {
  await settingsStore.updateSettings({ distillery: localDistillery.value });
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-6 mt-4">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Distillery Information</h3>
      <p class="text-sm text-parchment/60 mt-1">
        Business details used in reports and compliance documents.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Distillery Name" class="md:col-span-2">
        <UInput v-model="localDistillery.name" placeholder="Galveston Distilling Co" class="w-full" />
      </UFormField>

      <UFormField label="Address" class="md:col-span-2">
        <UTextarea v-model="localDistillery.address" placeholder="123 Main St, Galveston, TX 77550" :rows="2" class="w-full" />
      </UFormField>

      <UFormField label="TTB Permit Number">
        <UInput v-model="localDistillery.permitNumbers.ttb" placeholder="DSP-TX-XXXXX" class="w-full" />
      </UFormField>

      <UFormField label="TABC Permit Number">
        <UInput v-model="localDistillery.permitNumbers.tabc" placeholder="MB-XXXXXX" class="w-full" />
      </UFormField>
    </div>

    <!-- Save -->
    <div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
      <div class="flex items-center gap-2">
        <UButton label="Reset" variant="ghost" color="neutral" @click="resetDistillery" />
        <UButton label="Save Distillery Info" icon="i-lucide-save" color="primary" :loading="settingsStore.saving" @click="saveDistillery" />
      </div>
    </div>
  </div>
</template>

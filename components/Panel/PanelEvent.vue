<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();

const eventStore = useEventStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => eventStore.event,
  async onSave(data) {
    Object.assign(eventStore.event, data);
    await eventStore.updateEvent();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const typeOptions = ['Private Class', 'Private Event', 'Tasting'];
const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

// Resolve populated contact display
const contactDisplay = computed(() => {
  const c = localData.value as any;
  if (c._contactName) return c._contactName;
  // If contact is a populated object
  if (typeof c.contact === 'object' && c.contact) {
    const ct = c.contact as any;
    return ct.businessName || `${ct.firstName || ''} ${ct.lastName || ''}`.trim();
  }
  return '';
});

const contactEmail = computed(() => {
  const c = localData.value as any;
  if (typeof c.contact === 'object' && c.contact) {
    return (c.contact as any).email || '';
  }
  return '';
});
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Event' : 'Edit Event' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Contact display (read-only for existing events) -->
          <div v-if="contactDisplay" class="bg-brown/10 rounded-lg p-3 border border-brown/20">
            <span class="text-xs text-parchment/50 uppercase tracking-wider block mb-1">Contact</span>
            <div class="text-sm font-medium text-parchment">{{ contactDisplay }}</div>
            <div v-if="contactEmail" class="text-xs text-parchment/60">{{ contactEmail }}</div>
          </div>

          <UFormField label="Date">
            <UInput v-model="localData.date" type="date" />
          </UFormField>
          <UFormField label="Group Size">
            <UInput v-model.number="localData.groupSize" type="number" min="1" />
          </UFormField>
          <UFormField label="Type">
            <USelect v-model="localData.type" :items="typeOptions" />
          </UFormField>
          <UFormField label="Status">
            <USelect v-model="localData.status" :items="statusOptions" />
          </UFormField>
          <UFormField label="Capacity">
            <UInput v-model.number="localData.capacity" type="number" min="1" placeholder="Max seats (for public classes)" />
          </UFormField>
          <UFormField label="Notes">
            <UTextarea v-model="localData.notes" rows="3" placeholder="Additional notes..." />
          </UFormField>
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

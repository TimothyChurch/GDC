<script setup lang="ts">
import type { GDCEvent } from '~/types';

const props = defineProps<{
  contactId: string;
  contactName: string;
}>();

const emit = defineEmits<{
  close: [value: boolean];
}>();

const eventStore = useEventStore();
const toast = useToast();
const linking = ref(false);
const selectedEventId = ref('');

// Events not linked to any contact (or linked to a different contact)
const unlinkedEvents = computed(() =>
  eventStore.events
    .filter((e) => {
      const contactRef = typeof e.contact === 'object' && e.contact
        ? (e.contact as any)._id
        : e.contact;
      return !contactRef;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
);

const eventOptions = computed(() =>
  unlinkedEvents.value.map((e) => ({
    label: `${formatDate(e.date)} — ${e.type} (${e.status})`,
    value: e._id,
  })),
);

function formatDate(val: string): string {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

async function linkEvent() {
  if (!selectedEventId.value) return;
  linking.value = true;
  try {
    await $fetch(`/api/event/${selectedEventId.value}`, {
      method: 'PUT',
      body: { contact: props.contactId },
    });
    // Update local state
    const idx = eventStore.events.findIndex((e) => e._id === selectedEventId.value);
    if (idx !== -1) {
      eventStore.events[idx] = { ...eventStore.events[idx], contact: props.contactId };
    }
    toast.add({
      title: 'Event linked',
      description: `Event linked to ${props.contactName}`,
      color: 'success',
      icon: 'i-lucide-link',
    });
    emit('close', true);
  } catch {
    toast.add({
      title: 'Failed to link event',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    });
  } finally {
    linking.value = false;
  }
}
</script>

<template>
  <UModal @close="emit('close', false)">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-link" class="text-copper size-5" />
        <span>Link Existing Event</span>
      </div>
    </template>
    <template #body>
      <p class="text-sm text-parchment/70 mb-4">
        Select an unlinked event to associate with <strong>{{ contactName }}</strong>.
      </p>

      <UFormField v-if="eventOptions.length > 0" label="Event">
        <USelectMenu
          v-model="selectedEventId"
          :items="eventOptions"
          value-key="value"
          placeholder="Select an event..."
          searchable
          class="w-full"
        />
      </UFormField>

      <div v-else class="text-center py-4">
        <UIcon name="i-lucide-calendar-x" class="text-2xl text-parchment/20 mx-auto mb-2" />
        <p class="text-sm text-parchment/50">No unlinked events available</p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="emit('close', false)">Cancel</UButton>
        <UButton
          :disabled="!selectedEventId || eventOptions.length === 0"
          :loading="linking"
          @click="linkEvent"
        >
          Link Event
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Contact } from '~/types';

const props = defineProps<{
  /** Pre-selected customer to start with (optional) */
  preselectedId?: string;
}>();

const emit = defineEmits<{
  close: [value: boolean];
}>();

const contactStore = useContactStore();
const eventStore = useEventStore();

const customers = computed(() => contactStore.getCustomers());

const primaryId = ref(props.preselectedId || '');
const duplicateId = ref('');
const merging = ref(false);
const step = ref<'select' | 'preview'>('select');

const primary = computed(() => customers.value.find((c) => c._id === primaryId.value));
const duplicate = computed(() => customers.value.find((c) => c._id === duplicateId.value));

function displayName(c: Contact | undefined): string {
  if (!c) return '';
  return c.businessName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed';
}

// Filter options so you can't pick the same customer for both
const primaryOptions = computed(() =>
  customers.value
    .filter((c) => c._id !== duplicateId.value)
    .map((c) => ({ label: displayName(c), value: c._id, hint: c.email || '' })),
);

const duplicateOptions = computed(() =>
  customers.value
    .filter((c) => c._id !== primaryId.value)
    .map((c) => ({ label: displayName(c), value: c._id, hint: c.email || '' })),
);

// Preview: count what will be transferred
const duplicateEventCount = computed(() =>
  duplicateId.value ? eventStore.getEventsByContact(duplicateId.value).length : 0,
);

// Fields that would be filled from duplicate
const fieldsToFill = computed(() => {
  if (!primary.value || !duplicate.value) return [];
  const fields: { label: string; value: string }[] = [];
  const checks: { key: keyof Contact; label: string }[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'businessName', label: 'Business' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'website', label: 'Website' },
  ];
  for (const { key, label } of checks) {
    if (!primary.value[key] && duplicate.value[key]) {
      fields.push({ label, value: String(duplicate.value[key]) });
    }
  }
  return fields;
});

const canProceed = computed(() => primaryId.value && duplicateId.value && primaryId.value !== duplicateId.value);

function goToPreview() {
  step.value = 'preview';
}

function goBack() {
  step.value = 'select';
}

async function confirmMerge() {
  merging.value = true;
  try {
    await contactStore.mergeCustomers(primaryId.value, duplicateId.value);
    // Refresh events to reflect updated contact references
    await eventStore.getAll();
    emit('close', true);
  } catch {
    // Toast handled in store
  } finally {
    merging.value = false;
  }
}
</script>

<template>
  <UModal @close="emit('close', false)">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-merge" class="text-copper size-5" />
        <span>Merge Customers</span>
      </div>
    </template>
    <template #body>
      <!-- Step 1: Select customers -->
      <div v-if="step === 'select'" class="space-y-4">
        <p class="text-sm text-parchment/70">
          Select the primary customer to keep and the duplicate to merge into it.
          All events, messages, and records from the duplicate will be transferred to the primary.
        </p>

        <UFormField label="Keep (Primary)" required>
          <USelectMenu
            v-model="primaryId"
            :items="primaryOptions"
            value-key="value"
            placeholder="Select primary customer..."
            searchable
            class="w-full"
          />
        </UFormField>

        <UFormField label="Merge & Delete (Duplicate)" required>
          <USelectMenu
            v-model="duplicateId"
            :items="duplicateOptions"
            value-key="value"
            placeholder="Select duplicate customer..."
            searchable
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Step 2: Preview merge -->
      <div v-else class="space-y-4">
        <div class="bg-charcoal rounded-lg border border-brown/30 p-3">
          <div class="text-xs text-parchment/60 uppercase tracking-wider mb-2">Keeping</div>
          <div class="text-sm font-medium text-parchment">{{ displayName(primary) }}</div>
          <div v-if="primary?.email" class="text-xs text-parchment/50">{{ primary.email }}</div>
        </div>

        <div class="flex justify-center">
          <UIcon name="i-lucide-arrow-up" class="text-copper text-lg" />
        </div>

        <div class="bg-charcoal rounded-lg border border-red-500/30 p-3">
          <div class="text-xs text-red-400 uppercase tracking-wider mb-2">Merging & Deleting</div>
          <div class="text-sm font-medium text-parchment">{{ displayName(duplicate) }}</div>
          <div v-if="duplicate?.email" class="text-xs text-parchment/50">{{ duplicate.email }}</div>
        </div>

        <div class="bg-charcoal rounded-lg border border-brown/30 p-3 space-y-2">
          <div class="text-xs text-parchment/60 uppercase tracking-wider">What will happen</div>
          <ul class="text-sm text-parchment/80 space-y-1">
            <li v-if="duplicateEventCount > 0" class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="text-copper shrink-0" />
              {{ duplicateEventCount }} event(s) will be transferred
            </li>
            <li v-for="field in fieldsToFill" :key="field.label" class="flex items-center gap-2">
              <UIcon name="i-lucide-plus-circle" class="text-green-400 shrink-0" />
              {{ field.label }} will be filled: "{{ field.value }}"
            </li>
            <li v-if="duplicate?.newsletter && !primary?.newsletter" class="flex items-center gap-2">
              <UIcon name="i-lucide-mail" class="text-green-400 shrink-0" />
              Newsletter subscription will be preserved
            </li>
            <li v-if="duplicateEventCount === 0 && fieldsToFill.length === 0" class="text-parchment/50">
              No additional data to transfer (duplicate will simply be removed)
            </li>
          </ul>
        </div>

        <p class="text-xs text-red-400">
          This action cannot be undone. The duplicate customer record will be permanently deleted.
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton v-if="step === 'preview'" color="neutral" variant="outline" @click="goBack">Back</UButton>
        <UButton v-else color="neutral" variant="outline" @click="emit('close', false)">Cancel</UButton>

        <UButton
          v-if="step === 'select'"
          :disabled="!canProceed"
          @click="goToPreview"
        >
          Preview Merge
        </UButton>
        <UButton
          v-else
          color="error"
          :loading="merging"
          @click="confirmMerge"
        >
          Confirm Merge
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import * as yup from 'yup';

const emit = defineEmits<{ close: [boolean] }>();

const contactStore = useContactStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => contactStore.contact,
  async onSave(data) {
    Object.assign(contactStore.contact, data);
    await contactStore.updateContact(contactStore.contact);
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const typeOptions = CONTACT_TYPES;

const schema = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
  businessName: yup.string(),
  email: yup.string().email('Invalid email'),
  phone: yup.string(),
  type: yup.string(),
}).test('name-required', 'Either a name or business name is required', (value) =>
  !!(value.firstName || value.lastName || value.businessName)
);
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New Contact' : 'Edit Contact' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="First Name" name="firstName">
                <UInput v-model="localData.firstName" />
              </UFormField>
              <UFormField label="Last Name" name="lastName">
                <UInput v-model="localData.lastName" />
              </UFormField>
            </div>
            <UFormField label="Business Name" name="businessName">
              <UInput v-model="localData.businessName" />
            </UFormField>
            <UFormField label="Type" name="type">
              <USelect v-model="localData.type" :items="typeOptions" />
            </UFormField>
            <UFormField label="Website" name="website">
              <UInput v-model="localData.website" type="url" placeholder="https://" />
            </UFormField>
            <UFormField label="Address" name="address">
              <UInput v-model="localData.address" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Email" name="email">
                <UInput v-model="localData.email" type="email" />
              </UFormField>
              <UFormField label="Phone" name="phone">
                <UInput v-model="localData.phone" type="tel" />
              </UFormField>
            </div>
            <div class="flex items-center gap-3">
              <USwitch v-model="localData.newsletter" />
              <span class="text-sm text-parchment/80">Newsletter subscriber</span>
            </div>
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

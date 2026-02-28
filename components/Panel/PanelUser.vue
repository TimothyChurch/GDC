<script setup lang="ts">
import * as yup from 'yup';

const emit = defineEmits<{ close: [boolean] }>();

const userStore = useUserStore();

const { localData, isDirty, saving, save, cancel } = useFormPanel({
  source: () => userStore.user,
  async onSave(data) {
    Object.assign(userStore.user, data);
    await userStore.updateUser();
  },
  onClose: () => emit('close', true),
});

const isNew = !localData.value._id;

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: isNew
    ? yup.string().min(8, 'Min 8 characters').required('Password is required')
    : yup.string(),
});
</script>

<template>
  <USlideover side="right" :close="{ onClick: cancel }">
    <template #content>
      <div class="flex flex-col h-full w-full sm:max-w-lg">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">
            {{ isNew ? 'New User' : 'Edit User' }}
          </h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cancel" />
        </div>
        <UForm :schema="schema" :state="localData" @submit="save" class="flex flex-col flex-1 min-h-0">
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <UFormField label="First Name" name="firstName">
              <UInput v-model="localData.firstName" placeholder="First name" />
            </UFormField>
            <UFormField label="Last Name" name="lastName">
              <UInput v-model="localData.lastName" placeholder="Last name" />
            </UFormField>
            <UFormField label="Email" name="email" required>
              <UInput v-model="localData.email" type="email" placeholder="Email address" />
            </UFormField>
            <UFormField :label="isNew ? 'Password' : 'Password (leave blank to keep current)'" name="password" :required="isNew">
              <UInput
                v-model="localData.password"
                type="password"
                :placeholder="isNew ? 'Password' : 'Leave blank to keep current'"
              />
            </UFormField>
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

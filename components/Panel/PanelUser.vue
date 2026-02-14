<script setup lang="ts">
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
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <UFormField label="First Name">
            <UInput v-model="localData.firstName" placeholder="First name" />
          </UFormField>
          <UFormField label="Last Name">
            <UInput v-model="localData.lastName" placeholder="Last name" />
          </UFormField>
          <UFormField label="Email" required>
            <UInput v-model="localData.email" type="email" placeholder="Email address" />
          </UFormField>
          <UFormField :label="isNew ? 'Password' : 'Password (leave blank to keep current)'" :required="isNew">
            <UInput
              v-model="localData.password"
              type="password"
              :placeholder="isNew ? 'Password' : 'Leave blank to keep current'"
            />
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

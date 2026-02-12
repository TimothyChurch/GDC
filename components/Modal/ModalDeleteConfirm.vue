<script setup lang="ts">
const props = defineProps<{
  entityName: string;
  entityLabel?: string;
}>();

const emit = defineEmits<{
  close: [value: boolean];
}>();
</script>

<template>
  <UModal @close="emit('close', false)">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-alert-triangle" class="text-red-500 size-5" />
        <span>Delete {{ props.entityName }}</span>
      </div>
    </template>
    <template #body>
      <p>
        Are you sure you want to delete
        <strong v-if="props.entityLabel">{{ props.entityLabel }}</strong>
        <span v-else>this {{ props.entityName.toLowerCase() }}</span>?
      </p>
      <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="emit('close', false)">Cancel</UButton>
        <UButton color="error" @click="emit('close', true)">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>

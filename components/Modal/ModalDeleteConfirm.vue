<script setup lang="ts">
const props = withDefaults(defineProps<{
  entityName: string;
  entityLabel?: string;
  verb?: string;
  warningText?: string;
}>(), {
  verb: 'Delete',
  warningText: 'This action cannot be undone.',
});

const emit = defineEmits<{
  close: [value: boolean];
}>();

const verbLower = computed(() => props.verb.toLowerCase());
</script>

<template>
  <UModal @close="emit('close', false)">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-alert-triangle" class="text-red-500 size-5" />
        <span>{{ props.verb }} {{ props.entityName }}</span>
      </div>
    </template>
    <template #body>
      <p>
        Are you sure you want to {{ verbLower }}
        <strong v-if="props.entityLabel">{{ props.entityLabel }}</strong>
        <span v-else>this {{ props.entityName.toLowerCase() }}</span>?
      </p>
      <p class="text-sm text-neutral-500 mt-2">{{ props.warningText }}</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="emit('close', false)">Cancel</UButton>
        <UButton color="error" @click="emit('close', true)">{{ props.verb }}</UButton>
      </div>
    </template>
  </UModal>
</template>

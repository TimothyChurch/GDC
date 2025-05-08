<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #content>
      <div class="flex flex-col">
        <FormCocktail />
        <UButton @click="emit('close', false)">Close</UButton>
      </div>
    </template>
  </UModal>
</template>

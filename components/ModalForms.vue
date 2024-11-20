<script setup>
const isOpen = ref(formModal);
</script>

<template>
  <UModal v-model="isOpen">
    <UContainer class="py-4">
      <FormBottleAdd v-if="formSelection == 'FormBottleAdd'" />
      <FormBottleEdit v-if="formSelection == 'FormBottleEdit'" />
      <FormBottleInventory v-if="formSelection == 'FormBottleInventory'" />
    </UContainer>
  </UModal>
</template>

<script setup>
const isOpen = ref(formModalStatus);
</script>

<template>
  <UModal v-model="isOpen" class="p-3">
    <div class="p-3">
      <FormBottle v-if="formSelection == 'FormBottle'" />
      <FormContact v-if="formSelection == 'FormContact'" />
      <FormItem v-if="formSelection == 'FormItem'" />
      <FormRecipe v-if="formSelection == 'FormRecipe'" />
      <FormInventoryBase v-if="formSelection == 'FormInventoryBase'" />
      <FormPurchaseOrder v-if="formSelection == 'FormPurchaseOrder'" />
    </div>
  </UModal>
</template>

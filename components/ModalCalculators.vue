<script setup>
const { calculatorModalStatus, toggleCalculatorModal } = useCalculatorModal();
const isOpen = calculatorModalStatus;
</script>

<template>
  <div>
    <USlideover v-model:open="isOpen">
      <UButton color="neutral" variant="ghost" icon="i-heroicons-calculator" />
      <template #content>
        <Proofing class="w-full" />
        <UButton
          @click="toggleCalculatorModal"
          class="py-3 px-8 m-3 self-center"
          >Exit</UButton
        >
      </template>
    </USlideover>
  </div>
</template>

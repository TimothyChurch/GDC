<script setup>
const isOpen = ref(calculatorModalStatus);
</script>

<template>
  <div>
    <USlideover v-model="isOpen">
      <Proofing class="w-full" />
      <UButton @click="toggleCalculatorModal" class="py-3 px-8 m-3 self-center"
        >Exit</UButton
      >
    </USlideover>
  </div>
</template>

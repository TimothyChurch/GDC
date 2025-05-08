<script setup>
const bottleStore = useBottleStore();

const search = ref("");
</script>
<template>
  <div class="grid grid-cols-6 gap-2">
    <div v-for="bottle in bottleStore.bottles">
      <CardBottle :bottle="bottle" />
    </div>
  </div>
</template>

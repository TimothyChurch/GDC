<script setup>
const bottleStore = useBottleStore();

const search = ref("");
</script>
<template>
  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
    <div v-for="bottle in bottleStore.bottles">
      <CardBottle :bottle="bottle" />
    </div>
  </div>
</template>

<script setup lang="ts">
const showForm = ref(false);
</script>

<template>
  <div>
    <UButton @click="showForm = !showForm">Push me</UButton>
    <FormItem v-if="showForm" />
    <TableItems />
  </div>
</template>

<script setup>
import { format } from "date-fns";

const model = defineModel();
</script>

<template>
  <UPopover :popper="{ placement: 'bottom-start' }">
    <UButton
      icon="i-heroicons-calendar-days-20-solid"
      :label="format(new Date(model), 'd MMM, yyy')"
      @click="() => (model = new Date(model))" />

    <template #panel="{ close }">
      <DatePicker v-model="model" is-required @close="close" />
    </template>
  </UPopover>
</template>

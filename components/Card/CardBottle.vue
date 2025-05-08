<script setup lang="ts">
import type { Bottle } from "~/types/interfaces/Bottle";

defineProps<{
  bottle: Bottle;
}>();
</script>

<template>
  <UCard class="h-full bg-[var(--shadow)]">
    <template #header>
      <div class="flex justify-around items-center">
        <h3 class="text-lg font-semibold">{{ bottle.name }}</h3>
        <span class="text-lg font-bold">{{ Dollar.format(bottle.price) }}</span>
      </div>
    </template>
    <div>
      {{ bottle.class }}
      {{ bottle.type }}
    </div>
  </UCard>
</template>

<style scoped>
.u-card {
  display: flex;
  flex-direction: column;
}

.u-card__body {
  flex-grow: 1;
}
</style>

<script setup lang="ts">
const loadedAt = ref(new Date());

const formattedTime = computed(() =>
  loadedAt.value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
);

const formattedDate = computed(() =>
  loadedAt.value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
);

const refresh = () => {
  loadedAt.value = new Date();
};

defineExpose({ refresh });
</script>

<template>
  <div class="flex items-center gap-2 text-xs text-parchment/50 mb-4 print:hidden">
    <span class="relative flex h-2 w-2">
      <span class="absolute inline-flex h-full w-full rounded-full bg-green-400/40 animate-ping" />
      <span class="relative inline-flex rounded-full h-2 w-2 bg-green-400/70" />
    </span>
    <span>Live data — loaded {{ formattedDate }} at {{ formattedTime }}</span>
  </div>
</template>

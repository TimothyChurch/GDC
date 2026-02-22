<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}>();
</script>

<template>
  <div class="relative flex items-center justify-center overflow-hidden" style="min-height: 40vh">
    <NuxtImg
      v-if="backgroundImage"
      :src="backgroundImage"
      :alt="title"
      class="absolute inset-0 w-full h-full object-cover"
      loading="eager"
      fetchpriority="high"
      sizes="100vw"
      format="webp"
    />
    <div v-else class="absolute inset-0 bg-charcoal"></div>
    <div class="absolute inset-0 bg-espresso/60"></div>

    <div class="relative z-10 text-center px-6 py-16">
      <h1 class="font-[Cormorant_Garamond] text-4xl sm:text-5xl md:text-6xl font-bold text-parchment drop-shadow-lg">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-4 text-lg text-parchment/80 max-w-2xl mx-auto">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

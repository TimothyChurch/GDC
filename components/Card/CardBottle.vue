<script setup lang="ts">
import type { PublicBottle } from "~/types";

defineProps<{
  bottle: PublicBottle;
}>();
</script>

<template>
  <NuxtLink
    :to="`/bottles/${bottle._id}`"
    class="group block bg-cream dark:bg-charcoal rounded-lg overflow-hidden border border-gold/10 hover:border-gold/30 hover:shadow-lg transition-all duration-300"
  >
    <div class="aspect-[3/4] bg-charcoal/5 dark:bg-parchment/5 overflow-hidden flex items-center justify-center">
      <NuxtImg
        v-if="bottle.img"
        :src="bottle.img"
        :alt="bottle.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        sizes="sm:50vw lg:25vw"
        format="webp"
      />
      <Icon v-else name="carbon:wine-bottle" class="text-6xl text-brown/15 dark:text-parchment/15" />
    </div>

    <div class="p-4">
      <h3 class="font-[Cormorant_Garamond] text-lg font-bold leading-tight group-hover:text-gold transition-colors">
        {{ bottle.name }}
      </h3>

      <div class="flex flex-wrap gap-1.5 mt-2">
        <span v-if="bottle.class" class="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">
          {{ bottle.class }}
        </span>
        <span v-if="bottle.type && bottle.type !== 'N/A'" class="text-xs bg-copper/10 text-copper px-2 py-0.5 rounded-full">
          {{ bottle.type }}
        </span>
      </div>

      <div class="flex items-center justify-between mt-3">
        <span v-if="bottle.price" class="text-gold font-bold">
          {{ Dollar.format(bottle.price) }}
        </span>
        <span v-if="bottle.abv" class="text-xs text-brown/50 dark:text-parchment/50">
          {{ bottle.abv }}% ABV
        </span>
      </div>

      <div v-if="bottle.inStock === false" class="mt-2">
        <span class="text-xs text-red-400 font-semibold">Out of Stock</span>
      </div>
    </div>
  </NuxtLink>
</template>

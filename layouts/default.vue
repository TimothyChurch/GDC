<script setup>
// Load lightweight public stores for visitor-facing pages
onMounted(async () => {
  await Promise.all([
    usePublicBottleStore().ensureLoaded(),
    usePublicCocktailStore().ensureLoaded(),
  ]);
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-gold focus:text-espresso focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold">
      Skip to main content
    </a>
    <SiteHeader />
    <main id="main-content" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <LazyModalAge />
  </div>
</template>

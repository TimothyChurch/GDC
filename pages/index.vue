<script setup lang="ts">
useServerSeoMeta({
  title: 'Galveston Distilling Co | Handcrafted Texas Spirits',
  description: 'Small-batch spirits handcrafted on Galveston Island, Texas. Visit our tasting room, explore our spirits, and book cocktail classes.',
  ogTitle: 'Galveston Distilling Co | Handcrafted Texas Spirits',
  ogDescription: 'Small-batch spirits handcrafted on Galveston Island, Texas. Visit our tasting room, explore our spirits, and book cocktail classes.',
  ogImage: 'https://galvestondistilling.com/images/og-home.jpg',
  ogUrl: 'https://galvestondistilling.com',
});
</script>

<template>
  <div>
    <SiteHero />
    <LazySiteCategories />
    <LazySiteFeaturedSpirits />
    <LazySiteFeaturedCocktails />
    <LazySiteVisitCTA />
    <LazySiteNewsletter />
  </div>
</template>

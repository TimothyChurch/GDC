<script setup lang="ts">
useSeoMeta({
  title: 'Galveston Distilling Co | Handcrafted Texas Spirits',
  description: 'Small-batch spirits handcrafted on Galveston Island, Texas. Visit our tasting room, explore our spirits, and book cocktail classes.',
  ogTitle: 'Galveston Distilling Co | Handcrafted Texas Spirits',
  ogDescription: 'Small-batch spirits handcrafted on Galveston Island, Texas. Visit our tasting room, explore our spirits, and book cocktail classes.',
  ogImage: '/images/og-home.jpg',
  ogUrl: 'https://galvestondistilling.com',
});
</script>

<template>
  <div>
    <SiteHero />
    <SiteCategories />
    <SiteFeaturedSpirits />
    <SiteFeaturedCocktails />
    <SiteVisitCTA />
    <SiteNewsletter />
  </div>
</template>

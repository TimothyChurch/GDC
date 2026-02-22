<script setup lang="ts">
useHead({
  title: "Galveston Distilling Co",
  meta: [
    {
      name: "description",
      content: "Galveston Distilling Co — Handcrafted spirits from Galveston Island, Texas",
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: () => (preferredDark.value ? "/favicon-dark.svg" : "/favicon.svg"),
    },
  ],
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

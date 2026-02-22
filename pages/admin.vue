<script setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});

useSeoMeta({
  robots: 'noindex, nofollow',
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>

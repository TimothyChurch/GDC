<script setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});

if (import.meta.server) {
  useSeoMeta({
    robots: 'noindex, nofollow',
  });
}
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>

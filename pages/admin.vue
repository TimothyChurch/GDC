<script setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});

useServerSeoMeta({
  robots: 'noindex, nofollow',
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>

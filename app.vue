<script setup lang="ts">
import "./assets/css/main.css";
const { login } = useAuth();
login();

useHead({
  title: "Galveston Distilling Co",
  meta: [
    {
      name: "description",
      content: "Opinionated Vite Starter Template",
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
  <UApp class="flex w-screen h-screen font-sans">
    <NuxtLayout>
      <NuxtPage class="grow overflow-y-auto p-3" />
    </NuxtLayout>
  </UApp>
</template>

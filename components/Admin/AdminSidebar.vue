<script setup lang="ts">
const links = [
  {
    label: "Cocktails",
    to: "/admin/cocktails",
  },
  {
    label: "Bottles",
    to: "/admin/bottles",
  },
  {
    label: "Items",
    to: "/admin/items",
  },
  {
    label: "Main Site",
    to: "/",
  },
];
</script>

<template>
  <div class="w-80 max-w-80 p-3">
    <UNavigationMenu orientation="vertical" :items="links" />
  </div>
</template>

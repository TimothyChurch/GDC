<script setup lang="ts">
const links = [
  {
    label: "Profile",
    icon: "i-heroicons-home",
    to: "/admin",
  },
  {
    label: "Contacts",
    icon: "i-heroicons-home",
    to: "/admin/contacts",
  },
  {
    label: "items",
    icon: "i-heroicons-chart-bar",
    to: "/admin/items",
  },
  {
    label: "Recipe",
    icon: "i-heroicons-command-line",
    to: "/admin/recipe",
  },
];
</script>

<template>
  <div class="w-80 max-w-80 p-3"><UVerticalNavigation :links="links" /></div>
</template>

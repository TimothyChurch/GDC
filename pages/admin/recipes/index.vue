<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Recipes" subtitle="Spirit recipes and ingredient formulas" icon="i-lucide-book-open" />
    <TableRecipes />
  </div>
</template>

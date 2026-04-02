<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const tableRef = ref()
</script>

<template>
  <div>
    <AdminPageHeader title="Recipes" subtitle="Spirit recipes and ingredient formulas" icon="i-lucide-book-open">
      <template #actions>
        <UButton icon="i-lucide-plus" @click="tableRef?.newRecipe()">Add Recipe</UButton>
      </template>
    </AdminPageHeader>
    <TableRecipes ref="tableRef" />
  </div>
</template>

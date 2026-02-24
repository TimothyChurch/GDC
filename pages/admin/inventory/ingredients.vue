<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader
      title="Base Ingredients"
      subtitle="Grains, sugars, yeast, and primary fermentation ingredients"
      icon="i-lucide-wheat"
    >
      <template #actions>
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" size="sm" to="/admin/inventory">
          Back
        </UButton>
      </template>
    </AdminPageHeader>
    <TableInventoryCategory category="Base Ingredient" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader
      title="Botanicals"
      subtitle="Herbs, spices, citrus peels, and botanical flavorings"
      icon="i-lucide-leaf"
    >
      <template #actions>
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" size="sm" to="/admin/inventory">
          Back
        </UButton>
      </template>
    </AdminPageHeader>
    <TableInventoryCategory category="Botanical" />
  </div>
</template>

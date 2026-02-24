<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader
      title="Bottling Supplies"
      subtitle="Bottles, caps, labels, shrink wraps, and packaging materials"
      icon="i-lucide-wine"
    >
      <template #actions>
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" size="sm" to="/admin/inventory">
          Back
        </UButton>
      </template>
    </AdminPageHeader>
    <TableInventoryCategory category="Bottling" />
  </div>
</template>

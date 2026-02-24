<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader
      title="Other Supplies"
      subtitle="Cleaning supplies, lab supplies, and miscellaneous items"
      icon="i-lucide-box"
    >
      <template #actions>
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" size="sm" to="/admin/inventory">
          Back
        </UButton>
      </template>
    </AdminPageHeader>
    <TableInventoryCategory category="Other" />
  </div>
</template>

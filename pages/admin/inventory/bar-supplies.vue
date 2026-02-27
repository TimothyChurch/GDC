<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader
      title="Bar Supplies"
      subtitle="Mixers, garnishes, glassware, and bar tools"
      icon="i-lucide-cup"
    >
      <template #actions>
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" size="sm" to="/admin/inventory">
          Back
        </UButton>
      </template>
    </AdminPageHeader>
    <TableInventoryCategory category="Bar Supplies" />
  </div>
</template>

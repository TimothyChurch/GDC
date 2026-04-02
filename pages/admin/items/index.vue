<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const tableRef = ref()
</script>

<template>
  <div>
    <AdminPageHeader title="Items" subtitle="Raw materials, ingredients, and supplies" icon="i-lucide-package">
      <template #actions>
        <UButton icon="i-lucide-plus" @click="tableRef?.newItem()">Add Item</UButton>
      </template>
    </AdminPageHeader>
    <TableItems ref="tableRef" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const tableRef = ref()
</script>

<template>
  <div>
    <AdminPageHeader title="Production" subtitle="Track bottling runs and production records" icon="i-lucide-factory">
      <template #actions>
        <UButton icon="i-lucide-plus" @click="tableRef?.newItem()">Add Production</UButton>
      </template>
    </AdminPageHeader>
    <TableProductions ref="tableRef" />
  </div>
</template>

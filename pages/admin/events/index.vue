<script setup>
definePageMeta({ layout: 'admin' })

const tableRef = ref()
</script>

<template>
  <div>
    <AdminPageHeader title="Events" subtitle="Manage private classes, events, and tastings" icon="i-lucide-calendar">
      <template #actions>
        <UButton icon="i-lucide-plus" @click="tableRef?.addItem()">Add Event</UButton>
      </template>
    </AdminPageHeader>
    <TableEvents ref="tableRef" />
  </div>
</template>

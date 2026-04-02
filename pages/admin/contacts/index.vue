<script setup>
definePageMeta({ layout: 'admin' })

const tableRef = ref()
</script>

<template>
  <div>
    <AdminPageHeader title="Contacts" subtitle="Manage vendors, suppliers, and business contacts" icon="i-lucide-users">
      <template #actions>
        <UButton icon="i-lucide-plus" @click="tableRef?.addItem()">Add Contact</UButton>
      </template>
    </AdminPageHeader>
    <TableContacts ref="tableRef" />
  </div>
</template>

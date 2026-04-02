<script setup>
definePageMeta({ layout: 'admin' })

const tableRef = ref()
</script>

<template>
  <div>
    <AdminPageHeader title="Customers" subtitle="Manage customer contacts and their events" icon="i-lucide-heart-handshake">
      <template #actions>
        <UButton icon="i-lucide-plus" @click="tableRef?.addCustomer()">Add Customer</UButton>
      </template>
    </AdminPageHeader>
    <TableCustomers ref="tableRef" />
  </div>
</template>

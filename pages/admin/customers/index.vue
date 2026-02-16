<script setup>
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Customers" subtitle="Manage customer contacts and their events" icon="i-lucide-heart-handshake" />
    <TableCustomers />
  </div>
</template>

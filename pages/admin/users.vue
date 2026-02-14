<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Users" subtitle="Manage admin user accounts" icon="i-lucide-users-round" />
    <TableUsers />
  </div>
</template>

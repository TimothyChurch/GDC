<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const tableRef = ref()
</script>

<template>
  <div>
    <AdminPageHeader title="Users" subtitle="Manage admin user accounts" icon="i-lucide-users-round">
      <template #actions>
        <UButton icon="i-lucide-plus" @click="tableRef?.addUser()">Add User</UButton>
      </template>
    </AdminPageHeader>
    <TableUsers ref="tableRef" />
  </div>
</template>

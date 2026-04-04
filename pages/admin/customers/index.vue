<script setup>
import { LazyModalMergeCustomers } from '#components'

definePageMeta({ layout: 'admin' })

const tableRef = ref()
const overlay = useOverlay()
const mergeModal = overlay.create(LazyModalMergeCustomers)

const openMerge = async () => {
  await mergeModal.open()
}
</script>

<template>
  <div>
    <AdminPageHeader title="Customers" subtitle="Manage customer contacts and their events" icon="i-lucide-heart-handshake">
      <template #actions>
        <UButton icon="i-lucide-merge" variant="outline" color="neutral" @click="openMerge">Merge</UButton>
        <UButton icon="i-lucide-plus" @click="tableRef?.addCustomer()">Add Customer</UButton>
      </template>
    </AdminPageHeader>
    <TableCustomers ref="tableRef" />
  </div>
</template>

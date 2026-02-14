<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Inventory Report" subtitle="Stock levels, valuations, and alerts" icon="i-lucide-package">
      <template #actions>
        <UButton variant="outline" icon="i-lucide-printer" size="sm" class="print:hidden" @click="window.print()">Print</UButton>
        <NuxtLink to="/admin/reports">
          <UButton variant="outline" icon="i-lucide-arrow-left" size="sm">Back</UButton>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <ReportInventoryTable />
  </div>
</template>

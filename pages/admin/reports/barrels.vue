<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Barrel Aging Report" subtitle="Barrel inventory, aging progress, and warehouse analytics" icon="i-lucide-cylinder">
      <template #actions>
        <UButton variant="outline" icon="i-lucide-printer" size="sm" class="print:hidden" @click="window.print()">Print</UButton>
        <NuxtLink to="/admin/reports">
          <UButton variant="outline" icon="i-lucide-arrow-left" size="sm">Back</UButton>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <ReportBarrelAging />
  </div>
</template>

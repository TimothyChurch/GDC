<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>

<template>
  <div>
    <AdminPageHeader title="Cost Analysis" subtitle="Batch costs, recipe comparisons, and margins" icon="i-lucide-dollar-sign">
      <template #actions>
        <UButton variant="outline" icon="i-lucide-printer" size="sm" class="print:hidden" @click="window.print()">Print</UButton>
        <NuxtLink to="/admin/reports">
          <UButton variant="outline" icon="i-lucide-arrow-left" size="sm">Back</UButton>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <ReportCostBreakdown />
  </div>
</template>

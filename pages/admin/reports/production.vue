<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const productionsStore = useProductionStore()
const period = ref<'week' | 'month' | 'quarter' | 'year' | 'all'>('year')

const periods = [
  { label: '7 Days', value: 'week' },
  { label: '30 Days', value: 'month' },
  { label: '90 Days', value: 'quarter' },
  { label: '1 Year', value: 'year' },
  { label: 'All Time', value: 'all' },
]
</script>

<template>
  <div>
    <AdminPageHeader title="Production Report" subtitle="Bottle output, costs, and trends" icon="i-lucide-factory">
      <template #actions>
        <UButton variant="outline" icon="i-lucide-printer" size="sm" class="print:hidden" @click="window.print()">Print</UButton>
        <NuxtLink to="/admin/reports">
          <UButton variant="outline" icon="i-lucide-arrow-left" size="sm">Back</UButton>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <ReportShell />

    <!-- Period selector -->
    <div class="flex items-center gap-1.5 mb-6 bg-brown/15 rounded-lg p-1 border border-brown/20 w-fit">
      <UButton
        v-for="p in periods"
        :key="p.value"
        size="xs"
        :variant="period === p.value ? 'soft' : 'ghost'"
        :color="period === p.value ? 'primary' : 'neutral'"
        :label="p.label"
        @click="period = p.value as typeof period"
      />
    </div>

    <div v-if="productionsStore.loading" class="text-center py-12">
      <UIcon name="i-lucide-loader-2" class="text-2xl text-parchment/50 animate-spin mx-auto mb-2" />
      <p class="text-sm text-parchment/50">Loading production data...</p>
    </div>

    <ReportProductionChart
      v-else
      :productions="productionsStore.productions"
      :period="period"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const now = new Date()
const selectedMonth = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
)

const months = computed(() => {
  const result: { label: string; value: string }[] = []
  const d = new Date()
  for (let i = 0; i < 12; i++) {
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    result.push({
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: `${y}-${String(m).padStart(2, '0')}`,
    })
    d.setMonth(d.getMonth() - 1)
  }
  return result
})
</script>

<template>
  <div>
    <AdminPageHeader
      title="TABC Excise Tax Report"
      subtitle="Texas Distilled Spirits Excise Tax — Texas Tax Code § 201.43 ($2.40/wine gallon produced)"
      icon="i-lucide-landmark"
    >
      <template #actions>
        <UButton variant="outline" icon="i-lucide-printer" size="sm" class="print:hidden" @click="(window as any).print()">Print</UButton>
        <NuxtLink to="/admin/reports">
          <UButton variant="outline" icon="i-lucide-arrow-left" size="sm">Back</UButton>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <ReportShell :period="selectedMonth" />

    <!-- Month selector -->
    <div class="flex flex-wrap items-center gap-1.5 mb-6 bg-brown/15 rounded-lg p-1 border border-brown/20 w-fit print:hidden">
      <UButton
        v-for="m in months"
        :key="m.value"
        size="xs"
        :variant="selectedMonth === m.value ? 'soft' : 'ghost'"
        :color="selectedMonth === m.value ? 'primary' : 'neutral'"
        :label="m.label"
        @click="selectedMonth = m.value"
      />
    </div>

    <ReportTABCExciseTax :month="selectedMonth" />
  </div>
</template>

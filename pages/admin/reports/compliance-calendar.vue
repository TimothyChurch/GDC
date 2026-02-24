<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// TABC permit expiry — in a production app this would come from a settings store.
// Set to empty string to hide the permit renewal deadline until configured.
const tabcPermitExpiry = ref('')
</script>

<template>
  <div>
    <AdminPageHeader
      title="Compliance Calendar"
      subtitle="TTB and TABC filing deadlines — 90-day rolling window"
      icon="i-lucide-calendar-days"
    >
      <template #actions>
        <NuxtLink to="/admin/reports">
          <UButton variant="outline" icon="i-lucide-arrow-left" size="sm">Back</UButton>
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <!-- TABC permit date entry -->
    <div class="flex items-center gap-3 mb-6 bg-brown/10 rounded-lg p-3 border border-brown/20 w-fit print:hidden">
      <UIcon name="i-lucide-shield-check" class="text-amber-400 text-sm shrink-0" />
      <span class="text-xs text-parchment/60">TABC Permit Expiry Date:</span>
      <UInput
        v-model="tabcPermitExpiry"
        type="date"
        size="sm"
        placeholder="YYYY-MM-DD"
        class="w-40"
      />
      <span class="text-xs text-parchment/40">Optional — enables permit renewal deadline</span>
    </div>

    <ReportComplianceDeadlines :tabc-permit-expiry="tabcPermitExpiry || undefined" />
  </div>
</template>

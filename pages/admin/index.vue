<script setup lang="ts">
// Redirect admin root to dashboard
definePageMeta({
  layout: 'admin',
});

navigateTo('/admin/dashboard', { replace: true });
</script>

<template>
  <div class="flex items-center justify-center py-12">
    <div class="flex items-center gap-3 text-parchment/40">
      <UIcon name="i-lucide-loader-2" class="text-xl animate-spin text-gold" />
      <span class="text-sm">Redirecting to dashboard...</span>
    </div>
  </div>
</template>

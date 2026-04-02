<script setup lang="ts">
useServerSeoMeta({
  title: 'Payment Status | Galveston Distilling Co',
  robots: 'noindex, nofollow',
});

const route = useRoute();
const sessionId = route.query.session_id as string | undefined;

const { data, status: fetchStatus, error: fetchError } = await useAsyncData(
  `stripe-session-${sessionId}`,
  () => $fetch<{ status: string }>('/api/stripe/checkout-session', {
    params: { session_id: sessionId },
  }),
  { immediate: !!sessionId },
);

const status = computed<'loading' | 'complete' | 'open' | 'error'>(() => {
  if (!sessionId) return 'error';
  if (fetchStatus.value === 'pending') return 'loading';
  if (fetchError.value) return 'error';
  return (data.value?.status as 'complete' | 'open') || 'error';
});

const errorMessage = computed(() => {
  if (!sessionId) return 'No session ID provided.';
  if (fetchError.value) return fetchError.value?.data?.message || 'Unable to retrieve payment status.';
  return '';
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 py-12 px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <!-- Loading -->
      <div v-if="status === 'loading'" class="space-y-4">
        <UIcon name="i-lucide-loader-2" class="text-5xl animate-spin text-neutral-400" />
        <p class="text-neutral-600 dark:text-neutral-400">Checking payment status...</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'complete'" class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <UIcon name="i-lucide-check" class="text-3xl text-green-600" />
        </div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Payment Successful!</h1>
        <p class="text-neutral-600 dark:text-neutral-400">Thank you for your purchase. You will receive a confirmation email shortly.</p>
        <NuxtLink to="/">
          <UButton color="primary" variant="solid">Return to Home</UButton>
        </NuxtLink>
      </div>

      <!-- Pending -->
      <div v-else-if="status === 'open'" class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <UIcon name="i-lucide-clock" class="text-3xl text-yellow-600" />
        </div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Payment Pending</h1>
        <p class="text-neutral-600 dark:text-neutral-400">Your payment is being processed. Please check back shortly.</p>
        <NuxtLink to="/">
          <UButton color="primary" variant="soft">Return to Home</UButton>
        </NuxtLink>
      </div>

      <!-- Error -->
      <div v-else class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <UIcon name="i-lucide-alert-triangle" class="text-3xl text-red-600" />
        </div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Something Went Wrong</h1>
        <p class="text-neutral-600 dark:text-neutral-400">{{ errorMessage || 'We could not verify your payment. Please contact support.' }}</p>
        <NuxtLink to="/">
          <UButton color="primary" variant="soft">Return to Home</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

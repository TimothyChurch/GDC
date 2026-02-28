<script setup lang="ts">
useServerSeoMeta({
  title: 'Payment Status | Galveston Distilling Co',
  robots: 'noindex, nofollow',
});

const route = useRoute();
const sessionId = route.query.session_id as string | undefined;

const status = ref<'loading' | 'complete' | 'open' | 'error'>('loading');
const errorMessage = ref('');

onMounted(async () => {
  if (!sessionId) {
    status.value = 'error';
    errorMessage.value = 'No session ID provided.';
    return;
  }

  try {
    const data = await $fetch<{ status: string }>('/api/stripe/checkout-session', {
      params: { session_id: sessionId },
    });
    status.value = data.status as typeof status.value;
  } catch (e: any) {
    status.value = 'error';
    errorMessage.value = e?.data?.message || 'Unable to retrieve payment status.';
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <!-- Loading -->
      <div v-if="status === 'loading'" class="space-y-4">
        <UIcon name="i-lucide-loader-2" class="text-5xl animate-spin text-gray-400" />
        <p class="text-gray-600">Checking payment status...</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'complete'" class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <UIcon name="i-lucide-check" class="text-3xl text-green-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p class="text-gray-600">Thank you for your purchase. You will receive a confirmation email shortly.</p>
        <NuxtLink to="/">
          <UButton color="primary" variant="solid">Return to Home</UButton>
        </NuxtLink>
      </div>

      <!-- Pending -->
      <div v-else-if="status === 'open'" class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
          <UIcon name="i-lucide-clock" class="text-3xl text-yellow-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Payment Pending</h1>
        <p class="text-gray-600">Your payment is being processed. Please check back shortly.</p>
        <NuxtLink to="/">
          <UButton color="primary" variant="soft">Return to Home</UButton>
        </NuxtLink>
      </div>

      <!-- Error -->
      <div v-else class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <UIcon name="i-lucide-alert-triangle" class="text-3xl text-red-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Something Went Wrong</h1>
        <p class="text-gray-600">{{ errorMessage || 'We could not verify your payment. Please contact support.' }}</p>
        <NuxtLink to="/">
          <UButton color="primary" variant="soft">Return to Home</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

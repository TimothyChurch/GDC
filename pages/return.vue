<script setup lang="ts">
if (import.meta.server) {
  useSeoMeta({
    title: 'Payment Status | Galveston Distilling Co',
    robots: 'noindex, nofollow',
  });
}

interface ConfirmOrderResponse {
  status: string;
  amount: number;
  quantity: number;
  guest: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  } | null;
  origin: {
    type: string;
    id: string;
    label?: string;
  } | null;
}

const route = useRoute();
// Square appends orderId in production; in sandbox it may not, so fall back to sessionStorage
const orderId = (route.query.orderId as string)
  || (import.meta.client ? sessionStorage.getItem('square_order_id') : null)
  || undefined;
const transactionId = route.query.transactionId as string | undefined;

// Clean up stored orderId after reading
if (import.meta.client && orderId) {
  sessionStorage.removeItem('square_order_id');
}

const data = ref<ConfirmOrderResponse | null>(null);
const fetchError = ref<string | null>(null);
const polling = ref(!!orderId); // start in loading state if we have an orderId

const status = computed<'loading' | 'complete' | 'open' | 'error'>(() => {
  if (!orderId) return 'error';
  if (polling.value) return 'loading';
  if (fetchError.value) return 'error';
  const orderState = data.value?.status;
  if (orderState === 'COMPLETED') return 'complete';
  if (orderState === 'OPEN') return 'open';
  return 'error';
});

async function confirmOrder(): Promise<ConfirmOrderResponse> {
  return $fetch<ConfirmOrderResponse>('/api/square/confirm-order', {
    method: 'POST',
    body: { orderId },
  });
}

// Poll on client after hydration
onMounted(async () => {
  if (!orderId) return;

  const maxAttempts = 10;
  const delayMs = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await confirmOrder();
      data.value = result;
      if (result.status === 'COMPLETED') break;
      // Still OPEN — wait and retry
      await new Promise(r => setTimeout(r, delayMs));
    } catch (err: any) {
      fetchError.value = err?.data?.message || 'Unable to retrieve payment status.';
      break;
    }
  }
  polling.value = false;
});

const errorMessage = computed(() => {
  if (!orderId) return 'No order ID provided.';
  if (fetchError.value) return fetchError.value;
  return '';
});

function formatPrice(dollars: number) {
  return `$${dollars.toFixed(2)}`;
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-cream dark:bg-espresso py-12 px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <!-- Loading -->
      <div v-if="status === 'loading'" class="space-y-4">
        <UIcon name="i-lucide-loader-2" class="text-5xl animate-spin text-brown/40 dark:text-parchment/40" />
        <p class="text-brown/60 dark:text-parchment/60">Confirming your payment...</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'complete'" class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <UIcon name="i-lucide-check" class="text-3xl text-green-600" />
        </div>
        <h1 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment">Payment Successful!</h1>
        <p class="text-brown/60 dark:text-parchment/60">Thank you for your booking. A confirmation will be sent to your email.</p>

        <!-- Confirmation details -->
        <div v-if="data" class="bg-white dark:bg-charcoal rounded-xl border border-gold/10 p-6 text-left space-y-4 mt-4">
          <h3 class="font-[Cormorant_Garamond] text-lg font-bold text-brown dark:text-parchment border-b border-gold/10 pb-2">Booking Confirmation</h3>

          <div v-if="data.guest" class="flex justify-between items-center">
            <span class="text-sm text-brown/50 dark:text-parchment/50">Guest</span>
            <span class="font-medium text-brown dark:text-parchment">
              {{ data.guest.firstName }} {{ data.guest.lastName }}
            </span>
          </div>
          <div v-if="data.guest?.email" class="flex justify-between items-center">
            <span class="text-sm text-brown/50 dark:text-parchment/50">Email</span>
            <span class="text-sm text-brown/80 dark:text-parchment/80">{{ data.guest.email }}</span>
          </div>
          <div v-if="data.guest?.phone" class="flex justify-between items-center">
            <span class="text-sm text-brown/50 dark:text-parchment/50">Phone</span>
            <span class="text-sm text-brown/80 dark:text-parchment/80">{{ data.guest.phone }}</span>
          </div>
          <div v-if="data.quantity > 0" class="flex justify-between items-center">
            <span class="text-sm text-brown/50 dark:text-parchment/50">Guests</span>
            <span class="font-medium text-brown dark:text-parchment">{{ data.quantity }}</span>
          </div>
          <div v-if="data.origin?.label" class="flex justify-between items-start">
            <span class="text-sm text-brown/50 dark:text-parchment/50">Event</span>
            <span class="font-medium text-brown dark:text-parchment text-right max-w-[60%]">{{ data.origin.label }}</span>
          </div>

          <div v-if="data.amount" class="flex justify-between items-center pt-3 border-t border-gold/10">
            <span class="text-sm font-semibold text-brown dark:text-parchment">Total Paid</span>
            <span class="text-lg font-bold text-gold">{{ formatPrice(data.amount) }}</span>
          </div>

          <div v-if="transactionId" class="pt-2 border-t border-gold/10">
            <span class="text-xs text-brown/30 dark:text-parchment/30">Transaction: {{ transactionId }}</span>
          </div>
        </div>

        <NuxtLink to="/" class="inline-block mt-2">
          <UButton label="Return to Home" class="bg-gold text-espresso hover:bg-copper" />
        </NuxtLink>
      </div>

      <!-- Pending -->
      <div v-else-if="status === 'open'" class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
          <UIcon name="i-lucide-clock" class="text-3xl text-yellow-600" />
        </div>
        <h1 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment">Payment Pending</h1>
        <p class="text-brown/60 dark:text-parchment/60">Your payment is being processed. Please check back shortly.</p>
        <NuxtLink to="/" class="inline-block mt-2">
          <UButton label="Return to Home" variant="outline" class="border-gold text-gold hover:bg-gold/10" />
        </NuxtLink>
      </div>

      <!-- Error -->
      <div v-else class="space-y-4">
        <div class="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <UIcon name="i-lucide-alert-triangle" class="text-3xl text-red-600" />
        </div>
        <h1 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment">Something Went Wrong</h1>
        <p class="text-brown/60 dark:text-parchment/60">{{ errorMessage || 'We could not verify your payment. Please contact support.' }}</p>
        <NuxtLink to="/" class="inline-block mt-2">
          <UButton label="Return to Home" variant="outline" class="border-gold text-gold hover:bg-gold/10" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

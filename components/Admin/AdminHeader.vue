<script setup lang="ts">
const emit = defineEmits<{ toggleSidebar: [] }>();
const { logout } = useAuth();
const user = useCookie("user", {
  default: () => ({ email: "", authenticated: false, data: {} }),
});

const now = ref(new Date());
onMounted(() => {
  setInterval(() => {
    now.value = new Date();
  }, 60000);
});

const greeting = computed(() => {
  const hour = now.value.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
});

const formattedDate = computed(() => {
  return now.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});
</script>

<template>
  <header class="flex items-center justify-between px-4 lg:px-6 h-14 bg-charcoal border-b border-brown/50 shrink-0">
    <div class="flex items-center gap-3">
      <UButton
        class="lg:hidden"
        color="neutral"
        variant="ghost"
        icon="i-lucide-menu"
        size="lg"
        @click="emit('toggleSidebar')"
      />
      <NuxtLink to="/admin/dashboard" class="flex items-center gap-2">
        <img
          src="/images/Logo.png"
          alt="GDC"
          class="h-8 w-8 rounded"
        />
        <span class="hidden md:inline text-sm font-semibold text-parchment tracking-wide">
          GDC Operations
        </span>
      </NuxtLink>
    </div>

    <div class="hidden md:flex items-center text-xs text-copper/80">
      {{ formattedDate }}
    </div>

    <div class="flex items-center gap-2">
      <ModalCalculators />
      <div class="hidden sm:flex items-center gap-2 text-sm text-parchment/70">
        <UIcon name="i-lucide-user" class="text-copper" />
        <span>{{ user.email }}</span>
      </div>
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-log-out"
        class="text-parchment/60 hover:text-parchment"
        @click="logout"
      />
    </div>
  </header>
</template>

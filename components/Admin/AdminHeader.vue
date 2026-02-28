<script setup lang="ts">
const emit = defineEmits<{ toggleSidebar: [] }>();
const { user, logout } = useAuth();
const { open } = useCommandPalette();
const messageStore = useMessageStore();
const unreadCount = computed(() => messageStore.unreadCount);

const isMac = computed(() =>
  import.meta.client ? navigator?.userAgent?.includes('Mac') : false
);
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
        <NuxtImg
          src="/images/Logo.png"
          alt="GDC"
          class="h-8 w-8 rounded"
          width="32"
          height="32"
          format="webp"
        />
        <span class="hidden md:inline text-sm font-semibold text-parchment tracking-wide">
          GDC Operations
        </span>
      </NuxtLink>
    </div>

    <!-- Search trigger -->
    <button
      class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brown/30 bg-espresso/50 hover:bg-brown/20 hover:border-brown/50 transition-all duration-200 text-parchment/60 hover:text-parchment/60 cursor-pointer"
      @click="open()"
    >
      <UIcon name="i-lucide-search" class="text-sm" />
      <span class="text-xs">Search...</span>
      <div class="flex items-center gap-0.5 ml-4">
        <UKbd :value="isMac ? 'meta' : 'ctrl'" size="sm" />
        <UKbd value="K" size="sm" />
      </div>
    </button>
    <UButton
      class="md:hidden"
      color="neutral"
      variant="ghost"
      icon="i-lucide-search"
      size="sm"
      @click="open()"
    />

    <div class="flex items-center gap-2">
      <ModalCalculators />
      <NuxtLink to="/admin/inbox">
        <UChip :show="unreadCount > 0" :text="unreadCount" color="error" size="lg">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-bell"
            class="text-parchment/60 hover:text-parchment"
          />
        </UChip>
      </NuxtLink>
      <div class="hidden sm:flex items-center gap-2 text-sm text-parchment/70">
        <UIcon name="i-lucide-user" class="text-copper" />
        <span>{{ user?.email }}</span>
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

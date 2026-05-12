<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const showBack = computed(() => route.path !== '/floor')

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/floor')
}

onMounted(async () => {
  await Promise.all([
    useBatchStore().ensureLoaded(),
    useVesselStore().ensureLoaded(),
    useRecipeStore().ensureLoaded(),
    useItemStore().ensureLoaded(),
    useInventoryStore().ensureLoaded(),
  ])
})
</script>

<template>
  <div class="flex flex-col w-screen h-screen max-h-screen bg-espresso overflow-hidden">
    <!-- Top bar — minimal, glove-friendly -->
    <header class="flex items-center justify-between px-3 py-3 border-b border-brown/30 bg-charcoal shrink-0">
      <button
        v-if="showBack"
        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brown/20 text-parchment/80 hover:bg-brown/30 active:bg-brown/40 min-h-[44px]"
        @click="goBack"
      >
        <UIcon name="i-lucide-arrow-left" class="text-xl" />
        <span class="text-sm font-medium">Back</span>
      </button>
      <NuxtLink
        v-else
        to="/admin"
        class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brown/20 text-parchment/60 hover:bg-brown/30 min-h-[44px]"
      >
        <UIcon name="i-lucide-monitor" class="text-lg" />
        <span class="text-sm font-medium">Desktop</span>
      </NuxtLink>

      <div class="flex items-center gap-2 px-3 py-2 rounded-lg">
        <UIcon name="i-lucide-flame" class="text-gold text-xl" />
        <span class="text-base font-bold text-parchment font-[Cormorant_Garamond]">
          GDC Floor
        </span>
      </div>

      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-brown/10 text-parchment/60 min-h-[44px]">
        <UIcon name="i-lucide-user" class="text-base" />
        <span class="text-xs hidden sm:inline">{{ user?.firstName || user?.email }}</span>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto bg-espresso">
      <div class="max-w-3xl mx-auto p-4 sm:p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

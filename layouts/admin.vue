<script setup>
const route = useRoute();
const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);
const showBreadcrumbs = computed(() => route.path !== '/admin/dashboard' && route.path !== '/admin');

// Ensure all stores are loaded once when admin layout mounts
onMounted(async () => {
  await Promise.all([
    useBatchStore().ensureLoaded(),
    useBottleStore().ensureLoaded(),
    useCocktailStore().ensureLoaded(),
    useContactStore().ensureLoaded(),
    useInventoryStore().ensureLoaded(),
    useItemStore().ensureLoaded(),
    useProductionStore().ensureLoaded(),
    usePurchaseOrderStore().ensureLoaded(),
    useRecipeStore().ensureLoaded(),
    useVesselStore().ensureLoaded(),
    useEventStore().ensureLoaded(),
  ]);
});
</script>

<template>
  <div class="flex flex-col w-screen h-screen max-h-screen bg-espresso">
    <a href="#admin-main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-gold focus:text-espresso focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold">
      Skip to main content
    </a>
    <AdminHeader
      class="print:hidden"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />
    <div class="flex flex-grow overflow-y-hidden relative">
      <!-- Mobile overlay backdrop -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300"
        @click="sidebarOpen = false"
      />
      <AdminSidebar
        :sidebar-open="sidebarOpen"
        :collapsed="sidebarCollapsed"
        class="print:hidden"
        @close="sidebarOpen = false"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      />
      <div id="admin-main" class="overflow-y-auto flex-grow bg-espresso">
        <div class="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <AdminBreadcrumbs v-if="showBreadcrumbs" class="mb-4" />
          <slot />
        </div>
      </div>
    </div>
    <AdminCommandPalette />
    <AdminShortcutsHelp />
  </div>
</template>

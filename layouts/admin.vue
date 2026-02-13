<script setup>
const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);
</script>

<template>
  <div class="flex flex-col w-screen h-screen max-h-screen bg-espresso">
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
      <div class="overflow-y-auto flex-grow bg-espresso">
        <div class="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

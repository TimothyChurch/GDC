<script setup lang="ts">
defineProps<{
  sidebarOpen?: boolean;
  collapsed?: boolean;
}>();
const emit = defineEmits<{ close: []; toggleCollapse: [] }>();

const route = useRoute();

const productionLinks = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/admin/dashboard',
  },
  {
    label: 'Batches',
    icon: 'i-lucide-flask-conical',
    to: '/admin/batch',
  },
  {
    label: 'Recipes',
    icon: 'i-lucide-book-open',
    to: '/admin/recipes',
  },
  {
    label: 'Vessels',
    icon: 'i-lucide-container',
    to: '/admin/vessels',
  },
  {
    label: 'Production',
    icon: 'i-lucide-factory',
    to: '/admin/production',
  },
  {
    label: 'Proofing',
    icon: 'i-lucide-calculator',
    to: '/admin/proofing',
  },
];

const productLinks = [
  {
    label: 'Bottles',
    icon: 'i-lucide-wine',
    to: '/admin/bottles',
  },
  {
    label: 'Cocktails',
    icon: 'i-lucide-martini',
    to: '/admin/cocktails',
  },
  {
    label: 'Cheat Sheets',
    icon: 'i-lucide-file-text',
    to: '/admin/cocktails/grid',
  },
];

const inventoryLinks = [
  {
    label: 'Items',
    icon: 'i-lucide-package',
    to: '/admin/items',
  },
  {
    label: 'Bottle Inventory',
    icon: 'i-lucide-clipboard-list',
    to: '/admin/bottles/inventory',
  },
  {
    label: 'Purchase Orders',
    icon: 'i-lucide-receipt',
    to: '/admin/purchaseOrders',
  },
];

const adminLinks = [
  {
    label: 'Contacts',
    icon: 'i-lucide-users',
    to: '/admin/contacts',
  },
  {
    label: 'Controls',
    icon: 'i-lucide-settings',
    to: '/admin/controls',
  },
];

interface NavSection {
  title: string;
  links: { label: string; icon: string; to: string }[];
}

const sections: NavSection[] = [
  { title: 'Production', links: productionLinks },
  { title: 'Products', links: productLinks },
  { title: 'Inventory', links: inventoryLinks },
  { title: 'Admin', links: adminLinks },
];

const isActive = (to: string) => {
  return route.path === to || route.path.startsWith(to + '/');
};
</script>

<template>
  <nav
    :class="[
      'flex flex-col bg-charcoal border-r border-brown/30 overflow-y-auto overflow-x-hidden transition-all duration-300',
      'fixed inset-y-0 left-0 z-40 lg:static lg:z-auto',
      collapsed ? 'w-16' : 'w-64',
      sidebarOpen ? 'flex' : 'hidden lg:flex'
    ]"
  >
    <!-- Sidebar content -->
    <div class="flex flex-col gap-1 p-3 flex-grow">
      <template v-for="(section, sectionIdx) in sections" :key="section.title">
        <!-- Section divider (not before first section) -->
        <div v-if="sectionIdx > 0" class="my-2 border-t border-brown/20" />

        <!-- Section header -->
        <div
          v-if="!collapsed"
          class="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-copper/60"
        >
          {{ section.title }}
        </div>

        <!-- Nav links -->
        <NuxtLink
          v-for="link in section.links"
          :key="link.to"
          :to="link.to"
          :class="[
            'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
            isActive(link.to)
              ? 'bg-gold/15 text-gold border border-gold/20'
              : 'text-parchment/60 hover:text-parchment hover:bg-brown/30 border border-transparent',
            collapsed ? 'justify-center' : '',
          ]"
          @click="emit('close')"
        >
          <UIcon
            :name="link.icon"
            :class="[
              'shrink-0 text-lg transition-colors duration-200',
              isActive(link.to)
                ? 'text-gold'
                : 'text-parchment/40 group-hover:text-copper',
            ]"
          />
          <span v-if="!collapsed" class="truncate">{{ link.label }}</span>
        </NuxtLink>
      </template>
    </div>

    <!-- Bottom section -->
    <div class="p-3 border-t border-brown/20">
      <NuxtLink
        to="/"
        class="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-parchment/50 hover:text-parchment hover:bg-brown/30 transition-all duration-200"
        :class="collapsed ? 'justify-center' : ''"
      >
        <UIcon name="i-lucide-home" class="shrink-0 text-lg text-parchment/30 group-hover:text-copper" />
        <span v-if="!collapsed">Main Site</span>
      </NuxtLink>

      <!-- Collapse toggle (desktop only) -->
      <button
        class="hidden lg:flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg text-sm text-parchment/40 hover:text-parchment/70 hover:bg-brown/20 transition-all duration-200"
        :class="collapsed ? 'justify-center' : ''"
        @click="emit('toggleCollapse')"
      >
        <UIcon
          :name="collapsed ? 'i-lucide-chevrons-right' : 'i-lucide-chevrons-left'"
          class="shrink-0 text-lg"
        />
        <span v-if="!collapsed">Collapse</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  sidebarOpen?: boolean;
  collapsed?: boolean;
}>();
const emit = defineEmits<{ close: []; toggleCollapse: [] }>();

const route = useRoute();
const overlay = useOverlay();
const { activeBatches, pendingPOs, lowInventoryCount } = useSidebarBadges();

interface NavLink {
  label: string;
  icon: string;
  to: string;
  badge?: ComputedRef<number>;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const productionLinks: NavLink[] = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin/dashboard' },
  { label: 'Batches', icon: 'i-lucide-flask-conical', to: '/admin/batch', badge: activeBatches },
  { label: 'Recipes', icon: 'i-lucide-book-open', to: '/admin/recipes' },
  { label: 'Vessels', icon: 'i-lucide-container', to: '/admin/vessels' },
  { label: 'Barrels', icon: 'i-lucide-cylinder', to: '/admin/barrels' },
  { label: 'Production', icon: 'i-lucide-factory', to: '/admin/production' },
  { label: 'Proofing', icon: 'i-lucide-calculator', to: '/admin/proofing' },
];

const productLinks: NavLink[] = [
  { label: 'Bottles', icon: 'i-lucide-wine', to: '/admin/bottles' },
  { label: 'Cocktails', icon: 'i-lucide-martini', to: '/admin/cocktails' },
  { label: 'Cheat Sheets', icon: 'i-lucide-file-text', to: '/admin/cocktails/grid' },
];

const inventoryLinks: NavLink[] = [
  { label: 'Items', icon: 'i-lucide-package', to: '/admin/items', badge: lowInventoryCount },
  { label: 'Bottle Inventory', icon: 'i-lucide-clipboard-list', to: '/admin/bottles/inventory' },
  { label: 'Purchase Orders', icon: 'i-lucide-receipt', to: '/admin/purchaseOrders', badge: pendingPOs },
];

const reportLinks: NavLink[] = [
  { label: 'Reports', icon: 'i-lucide-bar-chart-3', to: '/admin/reports' },
];

const adminLinks: NavLink[] = [
  { label: 'Contacts', icon: 'i-lucide-users', to: '/admin/contacts' },
  { label: 'Users', icon: 'i-lucide-users-round', to: '/admin/users' },
  { label: 'Controls', icon: 'i-lucide-settings', to: '/admin/controls' },
];

const sections: NavSection[] = [
  { title: 'Production', links: productionLinks },
  { title: 'Products', links: productLinks },
  { title: 'Inventory', links: inventoryLinks },
  { title: 'Reports', links: reportLinks },
  { title: 'Admin', links: adminLinks },
];

const isActive = (to: string) => {
  return route.path === to || route.path.startsWith(to + '/');
};

// Quick-add actions
const quickActions = [
  { icon: 'i-lucide-flask-conical', label: 'Batch', panel: 'PanelBatch' },
  { icon: 'i-lucide-factory', label: 'Production', panel: 'PanelProduction' },
  { icon: 'i-lucide-receipt', label: 'PO', panel: 'PanelPurchaseOrder' },
];

async function openQuickAdd(panelName: string) {
  const components: Record<string, any> = {
    PanelBatch: resolveComponent('PanelBatch'),
    PanelProduction: resolveComponent('PanelProduction'),
    PanelPurchaseOrder: resolveComponent('PanelPurchaseOrder'),
  };
  const comp = components[panelName];
  if (comp) {
    const panel = overlay.create(comp);
    await panel.open();
  }
}
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
    <!-- Quick-add buttons -->
    <div v-if="!collapsed" class="flex items-center gap-1.5 px-3 pt-3 pb-1">
      <button
        v-for="action in quickActions"
        :key="action.panel"
        class="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium bg-brown/20 hover:bg-gold/15 text-parchment/50 hover:text-gold border border-transparent hover:border-gold/20 transition-all duration-200 cursor-pointer"
        :title="`New ${action.label}`"
        @click="openQuickAdd(action.panel)"
      >
        <UIcon :name="action.icon" class="text-sm" />
        <span>{{ action.label }}</span>
      </button>
    </div>
    <div v-else class="flex flex-col items-center gap-1 px-2 pt-3 pb-1">
      <button
        v-for="action in quickActions"
        :key="action.panel"
        class="w-10 h-8 flex items-center justify-center rounded-lg bg-brown/20 hover:bg-gold/15 text-parchment/50 hover:text-gold border border-transparent hover:border-gold/20 transition-all duration-200 cursor-pointer"
        :title="`New ${action.label}`"
        @click="openQuickAdd(action.panel)"
      >
        <UIcon name="i-lucide-plus" class="text-xs" />
      </button>
    </div>

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
          <div class="relative shrink-0">
            <UIcon
              :name="link.icon"
              :class="[
                'text-lg transition-colors duration-200',
                isActive(link.to)
                  ? 'text-gold'
                  : 'text-parchment/60 group-hover:text-copper',
              ]"
            />
            <!-- Collapsed badge dot -->
            <span
              v-if="collapsed && link.badge?.value"
              class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-copper"
            />
          </div>
          <span v-if="!collapsed" class="truncate">{{ link.label }}</span>
          <!-- Expanded badge pill -->
          <span
            v-if="!collapsed && link.badge?.value"
            class="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-copper/20 text-copper text-[10px] font-bold flex items-center justify-center"
          >
            {{ link.badge.value }}
          </span>
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
        <UIcon name="i-lucide-home" class="shrink-0 text-lg text-parchment/50 group-hover:text-copper" />
        <span v-if="!collapsed">Main Site</span>
      </NuxtLink>

      <!-- Collapse toggle (desktop only) -->
      <button
        class="hidden lg:flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg text-sm text-parchment/60 hover:text-parchment/70 hover:bg-brown/20 transition-all duration-200"
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

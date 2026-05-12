<script setup lang="ts">
defineProps<{
  sidebarOpen?: boolean;
  collapsed?: boolean;
}>();
const emit = defineEmits<{ close: []; toggleCollapse: [] }>();

const route = useRoute();
const overlay = useOverlay();
const {
  activeBatches,
  pendingPOs,
  lowInventoryCount,
  pendingEvents,
  totalCustomers,
  unreadMessages,
} = useSidebarBadges();

const { deadlines } = useComplianceDeadlines();
const complianceUrgentCount = computed(() =>
  deadlines.value.filter((d) =>
    d.urgency === 'overdue' || d.urgency === 'critical' || d.urgency === 'warning'
  ).length
);
const complianceWorstUrgency = computed(() => {
  if (deadlines.value.some((d) => d.urgency === 'overdue')) return 'overdue';
  if (deadlines.value.some((d) => d.urgency === 'critical')) return 'critical';
  if (deadlines.value.some((d) => d.urgency === 'warning')) return 'warning';
  return 'ok';
});

type BadgeTone = 'default' | 'warning' | 'critical' | 'overdue';

interface NavLink {
  label: string;
  icon: string;
  to: string;
  badge?: ComputedRef<number>;
  badgeTone?: ComputedRef<BadgeTone>;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const productionLinks: NavLink[] = [
  {
    label: "Overview",
    icon: "i-lucide-layout-grid",
    to: "/admin",
  },
  {
    label: "Dashboard",
    icon: "i-lucide-layout-dashboard",
    to: "/admin/dashboard",
  },
  { label: "Recipes", icon: "i-lucide-book-open", to: "/admin/recipes" },
  {
    label: "Batches",
    icon: "i-lucide-flask-conical",
    to: "/admin/batch",
    badge: activeBatches,
  },

  { label: "Vessels", icon: "i-lucide-container", to: "/admin/vessels" },
  { label: "Barrels", icon: "i-lucide-cylinder", to: "/admin/barrels" },
  { label: "Bulk Spirits", icon: "i-lucide-archive", to: "/admin/bulk-spirits" },
  { label: "Production", icon: "i-lucide-factory", to: "/admin/production" },
  { label: "Proofing", icon: "i-lucide-calculator", to: "/admin/proofing" },
];

const productLinks: NavLink[] = [
  { label: "Bottles", icon: "i-lucide-wine", to: "/admin/bottles" },
  { label: "Cocktails", icon: "i-lucide-martini", to: "/admin/cocktails" },
  {
    label: "Cheat Sheets",
    icon: "i-lucide-file-text",
    to: "/admin/cocktails/grid",
  },
];

const shoppingListCount = computed(() => {
  const itemStore = useItemStore();
  return itemStore.shoppingListItems.length;
});

const inventoryLinks: NavLink[] = [
  {
    label: "Inventory",
    icon: "i-lucide-warehouse",
    to: "/admin/inventory",
    badge: lowInventoryCount,
  },
  {
    label: "Shopping List",
    icon: "i-lucide-shopping-cart",
    to: "/admin/inventory/shopping-list",
    badge: shoppingListCount,
  },
  {
    label: "Count Inventory",
    icon: "i-lucide-clipboard-check",
    to: "/admin/inventory/input",
  },
  {
    label: "Items",
    icon: "i-lucide-package",
    to: "/admin/items",
  },
  {
    label: "Bottle Inventory",
    icon: "i-lucide-clipboard-list",
    to: "/admin/bottles/inventory",
  },
  {
    label: "Purchase Orders",
    icon: "i-lucide-receipt",
    to: "/admin/purchaseOrders",
    badge: pendingPOs,
  },
];

const reportLinks: NavLink[] = [
  {
    label: "Reports",
    icon: "i-lucide-bar-chart-3",
    to: "/admin/reports",
    badge: complianceUrgentCount,
    badgeTone: complianceWorstUrgency as unknown as ComputedRef<BadgeTone>,
  },
];

function badgeToneClasses(tone: BadgeTone | undefined): { pill: string; dot: string } {
  switch (tone) {
    case 'overdue':
      return { pill: 'bg-red-500/20 text-red-400', dot: 'bg-red-500' };
    case 'critical':
      return { pill: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-500' };
    case 'warning':
      return { pill: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-500' };
    default:
      return { pill: 'bg-copper/20 text-copper', dot: 'bg-copper' };
  }
}

const adminLinks: NavLink[] = [
  {
    label: "Inbox",
    icon: "i-lucide-inbox",
    to: "/admin/inbox",
    badge: unreadMessages,
  },
  {
    label: "Events",
    icon: "i-lucide-calendar",
    to: "/admin/events",
    badge: pendingEvents,
  },
  {
    label: "Customers",
    icon: "i-lucide-heart-handshake",
    to: "/admin/customers",
    badge: totalCustomers,
  },
  { label: "Contacts", icon: "i-lucide-users", to: "/admin/contacts" },
  { label: "Users", icon: "i-lucide-user-cog", to: "/admin/users" },
  { label: "Controls", icon: "i-lucide-sliders-horizontal", to: "/admin/controls" },
  { label: "Settings", icon: "i-lucide-settings", to: "/admin/settings" },
];

const sections: NavSection[] = [
  { title: "Production", links: productionLinks },
  { title: "Products", links: productLinks },
  { title: "Inventory", links: inventoryLinks },
  { title: "Reports", links: reportLinks },
  { title: "Admin", links: adminLinks },
];

const isActive = (to: string) => {
  // Exact-match only for the admin root, otherwise it would match every /admin/* route
  if (to === "/admin") return route.path === "/admin" || route.path === "/admin/";
  return route.path === to || route.path.startsWith(to + "/");
};

// Quick-add actions
const quickActions = [
  { icon: "i-lucide-flask-conical", label: "Batch", panel: "PanelBatch" },
  { icon: "i-lucide-factory", label: "Production", panel: "PanelProduction" },
  { icon: "i-lucide-receipt", label: "PO", panel: "PanelPurchaseOrder" },
];

async function openQuickAdd(panelName: string) {
  const components: Record<string, any> = {
    PanelBatch: resolveComponent("PanelBatch"),
    PanelProduction: resolveComponent("PanelProduction"),
    PanelPurchaseOrder: resolveComponent("PanelPurchaseOrder"),
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
      sidebarOpen ? 'flex' : 'hidden lg:flex',
    ]"
  >
    <!-- Quick-add buttons -->
    <div v-if="!collapsed" class="flex items-center gap-1.5 px-3 pt-3 pb-1">
      <UButton
        v-for="action in quickActions"
        :key="action.panel"
        :icon="action.icon"
        :label="action.label"
        variant="ghost"
        color="neutral"
        size="xs"
        class="flex-1 bg-brown/20 hover:bg-gold/15 text-parchment/50 hover:text-gold border border-transparent hover:border-gold/20 transition-all duration-200"
        :title="`New ${action.label}`"
        @click="openQuickAdd(action.panel)"
      />
    </div>
    <div v-else class="flex flex-col items-center gap-1 px-2 pt-3 pb-1">
      <UTooltip
        v-for="action in quickActions"
        :key="action.panel"
        :text="`New ${action.label}`"
        :delay-duration="200"
      >
        <UButton
          :icon="action.icon"
          variant="ghost"
          color="neutral"
          size="xs"
          square
          class="w-10 h-8 bg-brown/20 hover:bg-gold/15 text-parchment/50 hover:text-gold border border-transparent hover:border-gold/20 transition-all duration-200"
          :aria-label="`New ${action.label}`"
          @click="openQuickAdd(action.panel)"
        />
      </UTooltip>
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
              :class="[
                'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full',
                badgeToneClasses(link.badgeTone?.value).dot,
              ]"
            />
          </div>
          <span v-if="!collapsed" class="truncate">{{ link.label }}</span>
          <!-- Expanded badge pill -->
          <span
            v-if="!collapsed && link.badge?.value"
            :class="[
              'ml-auto min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
              badgeToneClasses(link.badgeTone?.value).pill,
            ]"
          >
            {{ link.badge.value }}
          </span>
        </NuxtLink>
      </template>
    </div>

    <!-- Bottom section -->
    <div class="p-3 border-t border-brown/20">
      <NuxtLink
        to="/floor"
        class="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-parchment/60 hover:text-parchment hover:bg-brown/30 transition-all duration-200"
        :class="collapsed ? 'justify-center' : ''"
        :title="collapsed ? 'Floor (tablet)' : ''"
      >
        <UIcon
          name="i-lucide-tablet"
          class="shrink-0 text-lg text-parchment/60 group-hover:text-gold"
        />
        <span v-if="!collapsed" class="flex-1">Floor</span>
        <span v-if="!collapsed" class="text-[9px] uppercase tracking-wider text-parchment/30">Tablet</span>
      </NuxtLink>
      <NuxtLink
        to="/"
        class="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-parchment/50 hover:text-parchment hover:bg-brown/30 transition-all duration-200"
        :class="collapsed ? 'justify-center' : ''"
      >
        <UIcon
          name="i-lucide-home"
          class="shrink-0 text-lg text-parchment/50 group-hover:text-copper"
        />
        <span v-if="!collapsed">Main Site</span>
      </NuxtLink>

      <!-- Collapse toggle (desktop only) -->
      <UButton
        :icon="collapsed ? 'i-lucide-chevrons-right' : 'i-lucide-chevrons-left'"
        :label="collapsed ? undefined : 'Collapse'"
        variant="ghost"
        color="neutral"
        size="sm"
        block
        class="hidden lg:flex mt-1 text-parchment/60 hover:text-parchment/70 hover:bg-brown/20 transition-all duration-200"
        :class="collapsed ? 'justify-center' : ''"
        @click="emit('toggleCollapse')"
      />
    </div>
  </nav>
</template>

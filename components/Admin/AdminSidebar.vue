<script setup lang="ts">
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
</script>

<template>
  <div class="w-80 max-w-80 p-3 flex flex-col gap-4">
    <div>
      <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 px-2">Production</h3>
      <UNavigationMenu orientation="vertical" :items="productionLinks" />
    </div>
    <div>
      <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 px-2">Products</h3>
      <UNavigationMenu orientation="vertical" :items="productLinks" />
    </div>
    <div>
      <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 px-2">Inventory</h3>
      <UNavigationMenu orientation="vertical" :items="inventoryLinks" />
    </div>
    <div>
      <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 px-2">Admin</h3>
      <UNavigationMenu orientation="vertical" :items="adminLinks" />
    </div>
    <UDivider />
    <UNavigationMenu orientation="vertical" :items="[{ label: 'Main Site', icon: 'i-lucide-home', to: '/' }]" />
  </div>
</template>

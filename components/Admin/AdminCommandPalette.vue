<script setup lang="ts">
const { isOpen, close } = useCommandPalette()
const router = useRouter()
const overlay = useOverlay()

const batchStore = useBatchStore()
const bottleStore = useBottleStore()
const recipeStore = useRecipeStore()
const itemStore = useItemStore()
const cocktailStore = useCocktailStore()
const contactStore = useContactStore()
const vesselStore = useVesselStore()
const purchaseOrderStore = usePurchaseOrderStore()

// Keyboard shortcut
const { meta, ctrl } = useMagicKeys()
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
})

const isMac = computed(() => navigator?.userAgent?.includes('Mac'))

// Navigation pages
const pages = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin/dashboard' },
  { label: 'Batches', icon: 'i-lucide-flask-conical', to: '/admin/batch' },
  { label: 'Recipes', icon: 'i-lucide-book-open', to: '/admin/recipes' },
  { label: 'Vessels', icon: 'i-lucide-container', to: '/admin/vessels' },
  { label: 'Production', icon: 'i-lucide-factory', to: '/admin/production' },
  { label: 'Proofing', icon: 'i-lucide-calculator', to: '/admin/proofing' },
  { label: 'Bottles', icon: 'i-lucide-wine', to: '/admin/bottles' },
  { label: 'Cocktails', icon: 'i-lucide-martini', to: '/admin/cocktails' },
  { label: 'Cheat Sheets', icon: 'i-lucide-file-text', to: '/admin/cocktails/grid' },
  { label: 'Inventory', icon: 'i-lucide-warehouse', to: '/admin/inventory' },
  { label: 'Bottling Supplies', icon: 'i-lucide-wine', to: '/admin/inventory/bottling' },
  { label: 'Base Ingredients', icon: 'i-lucide-wheat', to: '/admin/inventory/ingredients' },
  { label: 'Botanicals', icon: 'i-lucide-leaf', to: '/admin/inventory/botanicals' },
  { label: 'Other Supplies', icon: 'i-lucide-box', to: '/admin/inventory/other' },
  { label: 'Count Inventory', icon: 'i-lucide-clipboard-check', to: '/admin/inventory/input' },
  { label: 'Print Inventory Sheet', icon: 'i-lucide-printer', to: '/admin/inventory/print' },
  { label: 'Items', icon: 'i-lucide-package', to: '/admin/items' },
  { label: 'Bottle Inventory', icon: 'i-lucide-clipboard-list', to: '/admin/bottles/inventory' },
  { label: 'Purchase Orders', icon: 'i-lucide-receipt', to: '/admin/purchaseOrders' },
  { label: 'Contacts', icon: 'i-lucide-users', to: '/admin/contacts' },
  { label: 'Controls', icon: 'i-lucide-settings', to: '/admin/controls' },
]

// Quick actions
const actions = [
  {
    label: 'New Batch',
    icon: 'i-lucide-plus',
    suffix: 'Create a new batch',
    onSelect: () => openPanel('PanelBatch'),
  },
  {
    label: 'New Production',
    icon: 'i-lucide-plus',
    suffix: 'Record a production run',
    onSelect: () => openPanel('PanelProduction'),
  },
  {
    label: 'New Purchase Order',
    icon: 'i-lucide-plus',
    suffix: 'Create a purchase order',
    onSelect: () => openPanel('PanelPurchaseOrder'),
  },
  {
    label: 'New Contact',
    icon: 'i-lucide-plus',
    suffix: 'Add a new contact',
    onSelect: () => openPanel('PanelContact'),
  },
]

async function openPanel(name: string) {
  close()
  const components: Record<string, any> = {
    PanelBatch: resolveComponent('PanelBatch'),
    PanelProduction: resolveComponent('PanelProduction'),
    PanelPurchaseOrder: resolveComponent('PanelPurchaseOrder'),
    PanelContact: resolveComponent('PanelContact'),
  }
  const comp = components[name]
  if (comp) {
    const panel = overlay.create(comp)
    await panel.open()
  }
}

function navigate(to: string) {
  close()
  router.push(to)
}

// Groups for command palette
const groups = computed(() => {
  const g: any[] = [
    {
      id: 'pages',
      label: 'Pages',
      items: pages.map(p => ({
        ...p,
        onSelect: () => navigate(p.to),
      })),
      ignoreFilter: true,
      postFilter: (searchTerm: string, items: any[]) => {
        if (!searchTerm) return items
        const term = searchTerm.toLowerCase()
        return items.filter((i: any) => i.label.toLowerCase().includes(term))
      },
    },
    {
      id: 'actions',
      label: 'Quick Actions',
      items: actions.map(a => ({
        ...a,
        onSelect: () => {
          a.onSelect()
        },
      })),
      ignoreFilter: true,
      postFilter: (searchTerm: string, items: any[]) => {
        if (!searchTerm) return items
        const term = searchTerm.toLowerCase()
        return items.filter((i: any) => i.label.toLowerCase().includes(term) || i.suffix?.toLowerCase().includes(term))
      },
    },
    {
      id: 'batches',
      label: 'Batches',
      items: batchStore.batches.map(b => ({
        label: recipeStore.getRecipeById(b.recipe)?.name || 'Unknown Recipe',
        suffix: b.status,
        icon: 'i-lucide-flask-conical',
        onSelect: () => navigate(`/admin/batch/${b._id}`),
      })),
    },
    {
      id: 'bottles',
      label: 'Bottles',
      items: bottleStore.bottles.map(b => ({
        label: b.name,
        suffix: b.inStock ? 'In Stock' : 'Out of Stock',
        icon: 'i-lucide-wine',
        onSelect: () => navigate(`/admin/bottles/${b._id}`),
      })),
    },
    {
      id: 'recipes',
      label: 'Recipes',
      items: recipeStore.recipes.map(r => ({
        label: r.name,
        suffix: r.class || r.type,
        icon: 'i-lucide-book-open',
        onSelect: () => navigate(`/admin/recipes/${r._id}`),
      })),
    },
    {
      id: 'items',
      label: 'Items',
      items: itemStore.items.map(i => ({
        label: i.name,
        suffix: i.type,
        icon: 'i-lucide-package',
        onSelect: () => navigate(`/admin/items/${i._id}`),
      })),
    },
    {
      id: 'cocktails',
      label: 'Cocktails',
      items: cocktailStore.cocktails.map(c => ({
        label: c.name,
        suffix: c.menu,
        icon: 'i-lucide-martini',
        onSelect: () => navigate(`/admin/cocktails/${c._id}`),
      })),
    },
    {
      id: 'contacts',
      label: 'Contacts',
      items: contactStore.contacts.map(c => ({
        label: c.businessName || `${c.firstName} ${c.lastName}`,
        suffix: c.type,
        icon: 'i-lucide-users',
        onSelect: () => navigate(`/admin/contacts/${c._id}`),
      })),
    },
    {
      id: 'vessels',
      label: 'Vessels',
      items: vesselStore.vessels.map(v => ({
        label: v.name,
        suffix: v.type,
        icon: 'i-lucide-container',
        onSelect: () => navigate(`/admin/vessels/${v._id}`),
      })),
    },
  ]
  return g
})

function onSelect(item: any) {
  if (item.onSelect) {
    item.onSelect()
  }
}
</script>

<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-2xl' }">
    <template #content>
      <UCommandPalette
        :groups="groups"
        :fuse="{
          fuseOptions: {
            ignoreLocation: true,
            threshold: 0.1,
            keys: ['label', 'suffix'],
          },
          resultLimit: 12,
          matchAllWhenSearchEmpty: false,
        }"
        placeholder="Search pages, batches, bottles, recipes..."
        :close="true"
        @update:model-value="onSelect"
        @update:open="(val: boolean) => { if (!val) close() }"
        class="h-[400px]"
      >
        <template #empty="{ searchTerm }">
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <UIcon name="i-lucide-search-x" class="text-3xl text-parchment/50 mb-2" />
            <p class="text-sm text-parchment/50">
              {{ searchTerm ? `No results for "${searchTerm}"` : 'Start typing to search...' }}
            </p>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

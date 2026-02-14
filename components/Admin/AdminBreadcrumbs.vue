<script setup lang="ts">
const route = useRoute()
const batchStore = useBatchStore()
const recipeStore = useRecipeStore()
const bottleStore = useBottleStore()
const itemStore = useItemStore()

const labelMap: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  batch: 'Batches',
  bottles: 'Bottles',
  cocktails: 'Cocktails',
  contacts: 'Contacts',
  controls: 'Controls',
  items: 'Items',
  production: 'Production',
  proofing: 'Proofing',
  purchaseOrders: 'Purchase Orders',
  recipes: 'Recipes',
  vessels: 'Vessels',
  inventory: 'Bottle Inventory',
  grid: 'Cheat Sheets',
}

function resolveEntityName(parentSegment: string, id: string): string {
  switch (parentSegment) {
    case 'batch': {
      const batch = batchStore.getBatchById(id)
      if (batch) {
        const recipe = recipeStore.getRecipeById(batch.recipe)
        return recipe?.name || 'Batch'
      }
      return 'Batch'
    }
    case 'bottles': {
      const bottle = bottleStore.getBottleById(id)
      return bottle?.name || 'Bottle'
    }
    case 'recipes': {
      const recipe = recipeStore.getRecipeById(id)
      return recipe?.name || 'Recipe'
    }
    case 'items': {
      const item = itemStore.items.find(i => i._id === id)
      return item?.name || 'Item'
    }
    default:
      return id
  }
}

const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  // Remove 'admin' prefix
  const adminIdx = segments.indexOf('admin')
  if (adminIdx === -1) return []
  const pathSegments = segments.slice(adminIdx + 1)

  const items: { label: string; icon?: string; to?: string }[] = [
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin/dashboard' },
  ]

  let currentPath = '/admin'
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    currentPath += `/${segment}`
    const isLast = i === pathSegments.length - 1

    // Check if this is a dynamic _id segment
    const isId = segment.length > 10 && !labelMap[segment]
    if (isId) {
      const parentSegment = pathSegments[i - 1] || ''
      const entityName = resolveEntityName(parentSegment, segment)
      items.push({
        label: entityName,
        ...(isLast ? {} : { to: currentPath }),
      })
    } else if (segment !== 'dashboard') {
      items.push({
        label: labelMap[segment] || segment,
        ...(isLast ? {} : { to: currentPath }),
      })
    }
  }

  return items
})
</script>

<template>
  <UBreadcrumb :items="breadcrumbs" />
</template>

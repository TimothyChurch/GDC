export type AttentionPriority = 'high' | 'medium' | 'low'

export interface AttentionItem {
  id: string
  title: string
  description: string
  priority: AttentionPriority
  icon: string
  category: string
  link?: string
}

const PRIORITY_ORDER: Record<AttentionPriority, number> = { high: 0, medium: 1, low: 2 }

export function useAttentionFeed() {
  const batchStore = useBatchStore()
  const recipeStore = useRecipeStore()
  const inventoryStore = useInventoryStore()
  const itemStore = useItemStore()

  const { deadlines } = useComplianceDeadlines()

  const items = computed<AttentionItem[]>(() => {
    const list: AttentionItem[] = []

    // ── Compliance: overdue, critical (≤3d), warning (≤7d) only ──
    for (const dl of deadlines.value) {
      if (dl.urgency !== 'overdue' && dl.urgency !== 'critical' && dl.urgency !== 'warning') continue
      const days = Math.abs(dl.daysUntil)
      const dayLabel = `${days} day${days !== 1 ? 's' : ''}`
      list.push({
        id: `compliance-${dl.id}`,
        title: dl.title,
        description: dl.urgency === 'overdue'
          ? `Overdue by ${dayLabel} — ${dl.period}`
          : dl.daysUntil === 0
            ? `Due today — ${dl.period}`
            : `Due in ${dayLabel} — ${dl.period}`,
        priority: dl.urgency === 'overdue' || dl.urgency === 'critical' ? 'high' : 'medium',
        icon: dl.agency === 'TTB' ? 'i-lucide-landmark' : 'i-lucide-flag',
        category: `${dl.agency} Compliance`,
        link: dl.route || '/admin/reports',
      })
    }

    // ── Fermentation: needs initial reading or reading is stale ──
    for (const batch of batchStore.fermentingBatches) {
      const recipeName = recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown'
      const fermData = getStage(batch, 'fermenting')
      const lastReading = fermData?.readings?.length
        ? fermData.readings[fermData.readings.length - 1]
        : null

      if (!lastReading) {
        list.push({
          id: `ferm-check-${batch._id}`,
          title: `Take gravity reading: ${recipeName}`,
          description: 'No fermentation readings recorded yet',
          priority: 'high',
          icon: 'i-lucide-thermometer',
          category: 'Fermentation',
          link: `/admin/batch/${batch._id}`,
        })
        continue
      }

      const daysSince = Math.floor((Date.now() - new Date(lastReading.date).getTime()) / 86_400_000)
      if (daysSince >= 2) {
        list.push({
          id: `ferm-overdue-${batch._id}`,
          title: `Gravity reading overdue: ${recipeName}`,
          description: `Last reading was ${daysSince} days ago`,
          priority: daysSince >= 5 ? 'high' : 'medium',
          icon: 'i-lucide-alert-triangle',
          category: 'Fermentation',
          link: `/admin/batch/${batch._id}`,
        })
      }
    }

    // ── Upcoming batches ready to start ──
    for (const batch of batchStore.upcomingBatches) {
      const recipeName = recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown'
      list.push({
        id: `start-${batch._id}`,
        title: `Start brewing: ${recipeName}`,
        description: `${batch.batchSize} ${batch.batchSizeUnit} batch ready to begin`,
        priority: 'medium',
        icon: 'i-lucide-play',
        category: 'Production',
        link: `/admin/batch/${batch._id}`,
      })
    }

    // ── Low inventory: items at or below reorder point ──
    for (const item of itemStore.items) {
      if (!item.reorderPoint || item.reorderPoint <= 0) continue
      const stock = inventoryStore.getCurrentStock(item._id)
      if (stock <= item.reorderPoint) {
        list.push({
          id: `reorder-${item._id}`,
          title: `Reorder: ${item.name}`,
          description: `Only ${stock} ${item.inventoryUnit || 'units'} remaining (reorder point: ${item.reorderPoint})`,
          priority: stock <= 1 ? 'high' : 'medium',
          icon: 'i-lucide-shopping-cart',
          category: 'Inventory',
          link: `/admin/items/${item._id}`,
        })
      }
    }

    return list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  })

  const counts = computed(() => ({
    total: items.value.length,
    high: items.value.filter((i) => i.priority === 'high').length,
    medium: items.value.filter((i) => i.priority === 'medium').length,
    low: items.value.filter((i) => i.priority === 'low').length,
  }))

  return { items, counts }
}

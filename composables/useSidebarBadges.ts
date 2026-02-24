export function useSidebarBadges() {
  const batchStore = useBatchStore()
  const purchaseOrderStore = usePurchaseOrderStore()
  const inventoryStore = useInventoryStore()
  const itemStore = useItemStore()
  const eventStore = useEventStore()
  const contactStore = useContactStore()

  const activeBatches = computed(() =>
    batchStore.batches.filter(b => b.status === 'active').length
  )

  const pendingPOs = computed(() =>
    purchaseOrderStore.purchaseOrders.filter(po =>
      ['Pending', 'Confirmed', 'Shipped'].includes(po.status)
    ).length
  )

  const lowInventoryCount = computed(() => {
    let count = 0
    for (const item of itemStore.items) {
      if (item.trackInventory === false) continue
      const records = inventoryStore.getInventoriesByItem(item._id)
      if (records.length === 0) continue
      const sorted = [...records].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      const qty = sorted[0].quantity
      const threshold = item.reorderPoint || 10
      if (qty <= threshold) count++
    }
    return count
  })

  const pendingEvents = computed(() =>
    eventStore.events.filter(e => e.status === 'Pending').length
  )

  const totalCustomers = computed(() =>
    contactStore.contacts.filter(c => c.type === 'Customer').length
  )

  return { activeBatches, pendingPOs, lowInventoryCount, pendingEvents, totalCustomers }
}

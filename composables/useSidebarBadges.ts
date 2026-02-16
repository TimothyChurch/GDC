export function useSidebarBadges() {
  const batchStore = useBatchStore()
  const purchaseOrderStore = usePurchaseOrderStore()
  const inventoryStore = useInventoryStore()
  const itemStore = useItemStore()
  const eventStore = useEventStore()
  const contactStore = useContactStore()

  const activeBatches = computed(() =>
    batchStore.batches.filter(b => b.status !== 'Bottled' && b.status !== 'Upcoming').length
  )

  const pendingPOs = computed(() =>
    purchaseOrderStore.purchaseOrders.filter(po =>
      ['Pending', 'Confirmed', 'Shipped'].includes(po.status)
    ).length
  )

  const lowInventoryCount = computed(() => {
    const latestByItem = new Map<string, number>()
    for (const item of itemStore.items) {
      const records = inventoryStore.getInventoriesByItem(item._id)
      if (records.length === 0) continue
      const sorted = [...records].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      latestByItem.set(item._id, sorted[0].quantity)
    }
    let count = 0
    for (const qty of latestByItem.values()) {
      if (qty <= 10) count++
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

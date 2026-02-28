export function useSidebarBadges() {
  const batchStore = useBatchStore()
  const purchaseOrderStore = usePurchaseOrderStore()
  const itemStore = useItemStore()
  const eventStore = useEventStore()
  const contactStore = useContactStore()
  const messageStore = useMessageStore()

  const activeBatches = computed(() => batchStore.activeBatches.length)

  const pendingPOs = computed(() =>
    purchaseOrderStore.purchaseOrders.filter(po =>
      ['Pending', 'Confirmed', 'Shipped'].includes(po.status)
    ).length
  )

  const lowInventoryCount = computed(() => itemStore.shoppingListItems.length)

  const pendingEvents = computed(() => eventStore.pendingEvents)

  const totalCustomers = computed(() =>
    contactStore.contacts.filter(c => c.type === 'Customer').length
  )

  const unreadMessages = computed(() => messageStore.unreadCount)

  return { activeBatches, pendingPOs, lowInventoryCount, pendingEvents, totalCustomers, unreadMessages }
}

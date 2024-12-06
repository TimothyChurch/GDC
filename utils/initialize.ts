export const initializeStores = () => {
	const batchStore = useBatchStore();
	const bottleStore = useBottleStore();
	const contactStore = useContactStore();
	const inventoryStore = useInventoryStore();
	const itemStore = useItemStore();
	const purchaseOrderStore = usePurchaseOrderStore();
	const recipeStore = useRecipeStore();
	const vesselStore = useVesselStore();

	if (!batchStore.batches.length) {
		batchStore.getBatches();
	}
	if (!bottleStore.bottles.length) {
		bottleStore.getBottles();
	}
	if (!contactStore.contacts.length) {
		contactStore.getContacts();
	}
	if (!inventoryStore.inventories.length) {
		inventoryStore.getInventories();
	}
	if (!itemStore.items.length) {
		itemStore.getItems();
	}
	if (!purchaseOrderStore.purchaseOrders.length) {
		purchaseOrderStore.getPurchaseOrders();
	}
	if (!recipeStore.recipes.length) {
		recipeStore.getRecipes();
	}
	if (!vesselStore.vessels.length) {
		vesselStore.getVessels();
	}
};

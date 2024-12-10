export const initializeStores = async () => {
	const batchStore = useBatchStore();
	const bottleStore = useBottleStore();
	const contactStore = useContactStore();
	const inventoryStore = useInventoryStore();
	const itemStore = useItemStore();
	const purchaseOrderStore = usePurchaseOrderStore();
	const productionsStore = useProductionsStore();
	const recipeStore = useRecipeStore();
	const vesselStore = useVesselStore();

	if (!batchStore.batches.length) {
		await batchStore.getBatches();
	}
	if (!bottleStore.bottles.length) {
		await bottleStore.getBottles();
	}
	if (!contactStore.contacts.length) {
		await contactStore.getContacts();
	}
	if (!inventoryStore.inventories.length) {
		await inventoryStore.getInventories();
	}
	if (!itemStore.items.length) {
		await itemStore.getItems();
	}
	if (!purchaseOrderStore.purchaseOrders.length) {
		await purchaseOrderStore.getPurchaseOrders();
	}
	if (!productionsStore.productions.length) {
		await productionsStore.getProductions();
	}
	if (!recipeStore.recipes.length) {
		await recipeStore.getRecipes();
	}
	if (!vesselStore.vessels.length) {
		await vesselStore.getVessels();
	}
};

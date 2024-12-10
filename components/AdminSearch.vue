<script setup lang="ts">
const batchStore = useBatchStore();
const bottleStore = useBottleStore();
const contactStore = useContactStore();
const inventoryStore = useInventoryStore();
const itemStore = useItemStore();
const productionsStore = useProductionsStore();
const purchaseOrderStore = usePurchaseOrderStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

const searchText = ref('');
const isOpen = ref(false);

const allStores = [
	// batchStore,
	// bottleStore,
	contactStore,
	// inventoryStore,
	itemStore,
	// productionsStore,
	// purchaseOrderStore,
	// recipeStore,
	// vesselStore,
];

const results = computed(() => {
	const results = ref([]);
	if (searchText.value != '') {
		allStores.forEach((store) => {
			const storeSearch = store.search(searchText.value);
			console.log(storeSearch);
			results.value = [...results.value, ...storeSearch];
		});
	}
	return results.value;
});
</script>

<template>
	<div>
		<UInput
			placeholder="Search..."
			@click="isOpen = true" />
		<UModal v-model="isOpen">
			<div class="m-3">
				<UInput v-model="searchText" />
				{{ results }}
			</div>
		</UModal>
	</div>
</template>

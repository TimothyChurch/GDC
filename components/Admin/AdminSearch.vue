<script setup lang="ts">
const batchStore = useBatchStore();
const bottleStore = useBottleStore();
const contactStore = useContactStore();
const inventoryStore = useInventoryStore();
const itemStore = useItemStore();
const productionsStore = useProductionStore();
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
	const results = ref([]) as Ref;
	if (searchText.value != '') {
		allStores.forEach((store) => {
			const storeSearch = store.search(searchText.value);
			results.value = [...results.value, ...storeSearch];
		});
	}
	return results.value;
});
</script>

<template>
	<div class="items">
		<UInput
			placeholder="Search..."
			@click="isOpen = true" />
		<UModal
			v-model="isOpen"
			:ui="{ container: 'sm:items-start' }">
			<div class="m-3">
				<UInput v-model="searchText" />
				{{ results }}
			</div>
		</UModal>
	</div>
</template>

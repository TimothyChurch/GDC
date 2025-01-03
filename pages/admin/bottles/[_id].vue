<script setup>
const route = useRoute();
const bottleStore = useBottleStore();
const productionStore = uesProductionStore();
const inventoryStore = useInventoryStore();

const bottle = computed(() => bottleStore.getBottleById(route.params._id));

const productions = computed(() =>
	productionStore.productions
		.filter((p) => p.bottle === route.params._id)
		.map((p) => ({
			date: new Date(p.date),
			quantity: p.quantity,
		}))
);
const inventory = computed(() =>
	inventoryStore.inventories
		.filter((i) => Object.keys(i.items).includes(route.params._id))
		.map((i) => ({
			date: new Date(i.date),
			quantity: i.items[route.params._id],
		}))
		.sort((a, b) => a.date.getTime() - b.date.getTime())
);

const stockCheck = computed(() => {
	if (bottle.value) {
		return bottleStockCheck(bottle.value?._id);
	}
});
</script>

<template>
	<div>
		<UCard>
			<template #header>
				<h1>{{ bottle?.name }}</h1>
			</template>
			<p>Current Inventory: {{ stockCheck?.currentStock }}</p>
			{{ stockCheck }}
			<p>
				Average monthly use:
				{{ (stockCheck?.averageDaily * 30).toFixed() }}
			</p>
		</UCard>
		<UCard>
			<template #header>
				<h1>Inventory History</h1>
			</template>
			<div v-for="entry in inventory">
				<p>
					{{ entry?.date.toLocaleDateString() }}: {{ entry?.quantity }} bottles
				</p>
			</div>
		</UCard>
		<UCard>
			<template #header>
				<h1>Production History</h1>
			</template>
			<div v-for="entry in productions">
				<p>
					{{ entry?.date.toLocaleDateString() }}: {{ entry?.quantity }} bottles
				</p>
			</div>
		</UCard>
	</div>
</template>

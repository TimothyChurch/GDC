<script setup>
import { differenceInDays } from 'date-fns';

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

const total = computed(() => {
	const totalProduction = ref(0);
	productions.value.forEach((p) => (totalProduction.value += p?.quantity));
	return totalProduction.value;
});
const totalDays = computed(() => {
	return differenceInDays(new Date(), productions.value[0].date);
});
</script>

<template>
	<div>
		<UCard>
			<template #header>
				<h1>{{ bottle?.name }}</h1>
			</template>
			{{ bottle }}
			<p>Current Inventory: {{ inventory[inventory.length - 1].quantity }}</p>
			<p>
				Average monthly use:
				{{ (((total - inventory.pop()?.quantity) / totalDays) * 30).toFixed() }}
			</p>
		</UCard>
		<UCard>
			<template #header>
				<h1>Inventory History</h1>
			</template>
			<div v-for="entry in inventory">
				<p>
					{{ entry.date.toLocaleDateString() }}: {{ entry.quantity }} bottles
				</p>
			</div>
		</UCard>
		<UCard>
			<template #header>
				<h1>Production History</h1>
			</template>
			<div v-for="entry in productions">
				<p>
					{{ entry.date.toLocaleDateString() }}: {{ entry.quantity }} bottles
				</p>
			</div>
		</UCard>
	</div>
</template>

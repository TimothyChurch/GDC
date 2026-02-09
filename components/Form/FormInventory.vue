<script setup lang="ts">
import { format } from 'date-fns';
// Access Needed Pinia Store
const itemStore = useItemStore();
const bottleStore = useBottleStore();
const inventoryStore = useInventoryStore();

const groups = ref([
	{
		id: 'bottles',
		label: 'Bottles',
		items: bottleStore.bottles.map((bottle) => {return {label: bottle.name}}),
	},
	{
		id: 'items',
		label: 'Items',
		items: itemStore.items.map((item) => {return {label: item.name}}),
	},
])

</script>

<template>
	<div>
		<div class="flex gap-3">
			<SiteDatePicker v-model="inventoryStore.inventory.date" />
		</div>
		<UCommandPalette
			v-model="searchFilter" 
			:groups="groups"
			/>
	</div>
</template>

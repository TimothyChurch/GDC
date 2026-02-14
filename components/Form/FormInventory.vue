<script setup lang="ts">
const itemStore = useItemStore();
const bottleStore = useBottleStore();
const inventoryStore = useInventoryStore();

const itemOptions = computed(() => {
	const bottles = bottleStore.bottles.map((bottle) => ({
		label: bottle.name,
		value: bottle._id,
	}));
	const items = itemStore.items.map((item) => ({
		label: item.name,
		value: item._id,
	}));
	return [...bottles, ...items];
});

const onSubmit = async () => {
	await inventoryStore.updateInventory();
};
</script>

<template>
	<div class="flex flex-col gap-3">
		<SiteDatePicker v-model="inventoryStore.inventory.date" />
		<UFormField label="Item">
			<USelectMenu
				v-model="inventoryStore.inventory.item"
				:options="itemOptions"
				value-attribute="value"
				option-attribute="label"
				placeholder="Select an item"
				searchable />
		</UFormField>
		<UFormField label="Quantity">
			<UInput
				v-model="inventoryStore.inventory.quantity"
				type="number"
				placeholder="Quantity" />
		</UFormField>
		<UFormField label="Location">
			<UInput
				v-model="inventoryStore.inventory.location"
				placeholder="Location (optional)" />
		</UFormField>
		<UButton
			@click="onSubmit"
			:loading="inventoryStore.saving"
			class="w-full justify-center">
			Save Inventory
		</UButton>
	</div>
</template>

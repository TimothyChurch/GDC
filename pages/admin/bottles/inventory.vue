<script setup lang="ts">
const bottleStore = useBottleStore();
bottleStore.getBottles();
const inventoryStore = useInventoryStore();

const bottles = ref<
	Array<{
		_id: string;
		bottle: string;
		bar: number;
		office: number;
		boxed: number;
	}>
>([]);
watch(
	() => bottleStore.bottles,
	() => {
		bottles.value = bottleStore.bottles.map((bottle) => ({
			_id: bottle._id,
			bottle: bottle.name,
			bar: 0,
			office: 0,
			boxed: 0,
		}));
	}
);
const search = ref('');
const filteredBottles = computed(() => {
	if (search.value != '') {
		return bottles.value.filter((bottle) =>
			bottle.bottle.toLowerCase().includes(search.value.toLowerCase())
		);
	} else {
		return bottles.value;
	}
});

const submitInventory = () => {
	const date = new Date();
	const inventory = ref<Record<string, number>>({});
	bottles.value.forEach((bottle) => {
		inventory.value[bottle._id] =
			bottle.bar + bottle.office + bottle.boxed * 12;
	});
	inventoryStore.inventory = {
		_id: '',
		date: date,
		item: '',
		quantity: 0,
	};
	inventoryStore.updateInventory();
};
</script>

<template>
	<UContainer>
		<div class="flex justify-evenly pb-5">
			<UInput
				v-model="search"
				placeholder="Search..."
				icon="i-heroicons-magnifying-glass-20-solid"
				autocomplete="off"
				:ui="{ icon: { trailing: { pointer: '' } } }">
				<template #trailing>
					<UButton
						v-show="search !== ''"
						color="gray"
						variant="link"
						icon="i-heroicons-x-mark-20-solid"
						:padded="false"
						@click="search = ''" />
				</template>
			</UInput>
			<UButton @click="submitInventory">Submit Inventory</UButton>
		</div>
		<div class="grid grid-cols-6 gap-3 text-center text-xl font-bold underline">
			<div class="col-span-2">
				<h1>Bottle</h1>
			</div>
			<div>
				<h1>Bar</h1>
			</div>
			<div>
				<h1>Office</h1>
			</div>
			<div>
				<h1>Boxed</h1>
			</div>
			<div>
				<h1>Total</h1>
			</div>
		</div>

		<div v-for="bottle in filteredBottles">
			<div class="grid grid-cols-6 gap-3 text-center p-1">
				<div class="text-xl font-bold col-span-2">{{ bottle.bottle }}</div>
				<UInput
					v-model="bottle.bar"
					type="number" />
				<UInput
					v-model="bottle.office"
					type="number" />
				<UInput
					v-model="bottle.boxed"
					type="number" />
				<div class="grid grid-cols-2">
					{{ bottle.bar + bottle.office + bottle.boxed * 12 }}
					<h1
						:class="(bottle.bar +
							bottle.office +
							bottle.boxed * 12 -
							(bottleStockCheck(bottle._id).currentStock as number)) < 0 ? 'text-red-800' : 'text-black'">
						{{
							bottle.bar +
							bottle.office +
							bottle.boxed * 12 -
							(bottleStockCheck(bottle._id).currentStock as number)
						}}
					</h1>
				</div>
			</div>
			<UDivider />
		</div>
	</UContainer>
</template>

<script setup>
const route = useRoute();
const bottleStore = useBottleStore();
const itemStore = useItemStore();
const recipeStore = useRecipeStore();

const bottle = computed(() => bottleStore.getBottleById(route.params._id));
const recipe = computed(() => recipeStore.getRecipeById(bottle.value?.recipe));
const items = computed(() =>
	recipe.value?.items.map((item) => {
		return { ...item, name: itemStore.getItemById(item._id).name };
	})
);

const stockCheck = computed(() => {
	if (bottle.value) {
		return bottleStockCheck(bottle.value?._id);
	}
});

const editBottle = () => {
	bottleStore.bottle = bottle.value;
	formSelection.value = 'FormBottle';
	toggleFormModal();
};
</script>

<template>
	<div>
		<UCard>
			<template #header>
				<div class="flex justify-between">
					<h1>{{ bottle?.name }}</h1>
					<h1>Class: {{ recipe?.class }}</h1>
					<h1>Type: {{ recipe?.type }}</h1>
					<h1>ABV: {{ bottle?.abv }}%</h1>
					<UButton
						icon="i-heroicons-pencil"
						variant="ghost"
						color="black"
						@click="editBottle" />
				</div>
			</template>
			<div class="flex justify-between">
				<div>
					<div
						v-for="i in items"
						:key="i._id"
						class="flex items-center gap-2">
						{{ i.name }} - {{ i.amount }} {{ i.unit }}
					</div>
					<p>Directions: {{ recipe?.directions }}</p>
				</div>
				<div class="flex-grow">
					<div class="flex justify-around flex-grow">
						<p>Current Inventory: {{ stockCheck?.currentStock }}</p>
						<p>
							Average monthly use:
							{{ (stockCheck?.averageDaily * 30).toFixed() }}
						</p>
					</div>
					<ChartBottleInventory />
				</div>
			</div>
		</UCard>
	</div>
</template>

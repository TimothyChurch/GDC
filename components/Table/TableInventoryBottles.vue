<script setup>
const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();

const rows = computed(() => {
	return bottleStore.bottles.map((bottle) => {
		return {
			_id: bottle._id,
			name: bottle.name,
			class: recipeStore.getRecipeById(bottle.recipe)?.class,
			type: recipeStore.getRecipeById(bottle.recipe)?.type,
			cost: 'todo',
			price: 'todo',
			stock: currentStock(bottle),
		};
	});
});

const columns = [
	{ accessorKey: 'name', header: 'Name' },
	{ accessorKey: 'class', header: 'Class' },
	{ accessorKey: 'type', header: 'Type' },
	{ accessorKey: 'cost', header: 'Cost' },
	{ accessorKey: 'price', header: 'Price' },
	{ accessorKey: 'stock', header: 'Stock' },
	{ accessorKey: 'actions', header: '' },
];
</script>

<template>
	<div>
		<UTable
			:data="bottleStore.bottles"
			:loading="bottleStore.loading"
			:empty="'No bottles found'">
			<!-- <template #stock-cell="{ row }">
				<div
					v-if="bottleStockCheck(row._id).lowStock"
					class="text-xl font-bold text-red-600">
					{{ bottleStockCheck(row._id).currentStock }}
				</div>
			</template> -->
			<!-- <template #actions-cell="{ row }">
				<NuxtLink :to="`/admin/bottles/${row._id}`">
					<UButton>Open</UButton>
				</NuxtLink>
			</template> -->
		</UTable>
	</div>
</template>

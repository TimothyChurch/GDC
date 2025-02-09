<script setup lang="ts">
const cocktailStore = useCocktailStore();
const items = [
	{
		key: 'main',
		label: 'Menu',
		content: 'This is the content shown for Tab1',
	},
	{
		key: 'seasonal',
		label: 'Seasonal',
		content: 'Finally, this is the content for Tab3',
	},
	{
		key: 'shots',
		label: 'Shots',
		content: 'And, this is the content for Tab2',
	},
	{
		key: 'cocktails',
		label: 'All Cocktails',
		content: 'View all cocktails here',
	},
];
const search = ref('');

const filteredCocktails = computed(() => {
	return cocktailStore.cocktails.filter(
		(cocktail) =>
			cocktail.name.toLowerCase().includes(search.value.toLowerCase()) ||
			cocktail.ingredients.some((ingredient) =>
				ingredient.item.toLowerCase().includes(search.value.toLowerCase())
			)
	);
});

const mainMenu = computed(() =>
	cocktailStore.cocktails.filter((cocktail) => cocktail.menu === 'main')
);
const seasonalMenu = computed(() =>
	cocktailStore.cocktails.filter((cocktail) => cocktail.menu === 'seasonal')
);

const shotsMenu = computed(() =>
	cocktailStore.cocktails.filter((cocktail) => cocktail.menu === 'shots')
);
</script>

<template>
	<div class="flex flex-col gap-3">
		<UInput
			type="text"
			v-model="search"
			placeholder="Search for cocktails"
			class="w-80 self-center"
			:ui="{ icon: { trailing: { pointer: '' } } }">
			<template #trailing>
				<UButton
					v-show="search != ''"
					variant="link"
					color="black"
					icon="i-heroicons-x-mark"
					@click="search = ''" />
			</template>
		</UInput>
		<div
			v-if="search != ''"
			class="grid grid-cols-6 gap-3">
			<div v-for="cocktail in filteredCocktails">
				<CardCocktail :cocktail="cocktail" />
			</div>
		</div>
		<UTabs :items="items">
			<template #item="{ item, index }">
				<div v-if="item.key == 'main'">
					<SiteMenuMain :cocktails="mainMenu" />
				</div>
				<div v-if="item.key == 'seasonal'">
					<SiteMenuMain :cocktails="seasonalMenu" />
				</div>
				<div v-if="item.key == 'shots'">
					<SiteMenuMain :cocktails="shotsMenu" />
				</div>
				<div v-if="item.key == 'cocktails'">
					<SiteMenuMain :cocktails="cocktailStore.cocktails" />
				</div>
			</template>
		</UTabs>
	</div>
</template>

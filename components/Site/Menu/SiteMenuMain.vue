<script setup lang="ts">
import type { Cocktail } from '~/types';

const props = defineProps<{
	cocktails: Cocktail[];
}>();
</script>

<template>
	<div>
		<div class="grid grid-cols-6 gap-3">
			<div v-for="cocktail in props.cocktails">
				<CardCocktail :cocktail="cocktail" />
			</div>
		</div>
	</div>
</template>

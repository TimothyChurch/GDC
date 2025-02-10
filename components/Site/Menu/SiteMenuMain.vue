<script setup lang="ts">
import type { Cocktail } from '~/types';

defineProps<{
	cocktails: Cocktail[];
}>();
</script>

<template>
	<div>
		<div class="grid grid-cols-6 gap-3">
			<div v-for="cocktail in cocktails">
				<CardCocktail :cocktail="cocktail" />
			</div>
		</div>
	</div>
</template>

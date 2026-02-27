<script setup lang="ts">
import type { PublicCocktail } from '~/types';

defineProps<{
	cocktails: PublicCocktail[];
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

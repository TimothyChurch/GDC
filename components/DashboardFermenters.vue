<script setup>
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

const batch = (id) => {
	return;
};

const items = computed(() => {
	return [
		vesselStore.stills.map((stills) => {
			return {
				label: stills.name,
				value: stills._id,
			};
		}),
	];
});

const fermenters = computed(() => {
	return vesselStore.fermenters.map((fermenter) => {
		fermenter.contents.forEach((content, index) => {
			fermenter.contents[index] = {
				...content,
				batch: batchStore.getBatchById(content.batch),
			};
		});
		return fermenter;
	});
});
</script>

<template>
	<div>
		<h1 class="font-bold text-xl">Fermenters</h1>
		<div class="grid grid-flow-col auto-cols-auto gap-3">
			<div v-for="fermenter in vesselStore.fermenters">
				<UCard>
					<template #header>
						<div class="flex justify-between">
							<h1>{{ fermenter.name }}</h1>
							<h1>
								{{
									recipeStore.getRecipeById(
										batchStore.getBatchById(fermenter.contents[0]?.batch)
											?.recipe
									)?.name
								}}
							</h1>
						</div>
					</template>
					<div class="flex flex-col gap-3 items-center">
						{{ fermenter.contents }}
						<UDropdown :items="items">
							<UButton
								color="black"
								variant="outline"
								>Start Distilling</UButton
							>
							<template #item="{ item }">
								<UButton
									color="black"
									variant="ghost"
									class="w-full"
									@click="fullTransfer(fermenter._id, item.value)"
									>{{ item.label }}</UButton
								>
							</template>
						</UDropdown>
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>

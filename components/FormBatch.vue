<script setup>
const batchStore = useBatchStore();
const recipeStore = useRecipeStore();
const vesselStore = useVesselStore();

const price = computed(() => {
	if (batchStore.batch.recipe) {
		return Dollar.format(recipePrice(batchStore.batch.recipe));
	} else {
		return Dollar.format(0);
	}
});
const saveBatch = async () => {
	if (!batchStore.batch.recipeCost)
		batchStore.batch.recipeCost = recipePrice(batchStore.batch.recipe);
	batchStore.updateBatch();
};
</script>

<template>
	<UContainer>
		<UCard>
			<template #header>
				<div class="grid grid-flow-col auto-cols-auto gap-3">
					<UFormGroup label="Recipe">
						<USelect
							v-model="batchStore.batch.recipe"
							:options="recipeStore.recipes"
							option-attribute="name"
							value-attribute="_id" />
					</UFormGroup>
					<UFormGroup label="Recipe Cost"> {{ price }} </UFormGroup>
					<UFormGroup label="Batch Size">
						<UButtonGroup>
							<UInput
								v-model="batchStore.batch.batchSize"
								type="number"
								placeholder="Volume" />
							<USelect
								v-model="batchStore.batch.batchSizeUnit"
								:options="volumeUnits"
								placeholder="unit" />
						</UButtonGroup>
					</UFormGroup>
					<UFormGroup label="Batch Cost"> NEED TO DO </UFormGroup>
					<UFormGroup label="Status">
						<USelectMenu
							v-model="batchStore.batch.status"
							:options="batchStore.batchStages()"
							option-attribute="stage" />
					</UFormGroup>
					<UButton @click="saveBatch()"> Save </UButton>
				</div>
			</template>
			<div class="grid grid-cols-3 gap-3">
				<UCard>
					<template #header>
						<h1 class="font-bold text-xl">Brewing</h1>
					</template>
					<div>
						<div class="grid grid-cols-2 gap-3">
							<UFormGroup label="Vessel">
								<USelectMenu
									v-model="batchStore.batch.brewing.vessel"
									:options="
										vesselStore.vessels.filter(
											(vessel) => vessel.type.toLowerCase() === 'mash tun'
										)
									"
									option-attribute="name"
									value-attribute="_id" />
							</UFormGroup>
							<UFormGroup label="Brew Date">
								<SiteDatePicker v-model="batchStore.batch.brewing.date" />
							</UFormGroup>
						</div>
						<UFormGroup label="Notes">
							<UTextarea
								v-model="batchStore.batch.notes"
								autoresize />
						</UFormGroup>
					</div>
				</UCard>
				<UCard>
					<template #header
						><h1 class="font-bold text-xl">Fermenting</h1></template
					>
					<div>
						<UFormGroup label="Fermenter">
							<USelectMenu
								v-model="batchStore.batch.fermenting.vessel"
								:options="vesselStore.fermenters"
								option-attribute="name"
								value-attribute="_id" />
						</UFormGroup>
					</div>
				</UCard>
				<UCard>
					<template #header>
						<h1 class="font-bold text-xl">Distilling</h1>
					</template>
					<div class="flex flex-col gap-3">
						<div class="grid grid-cols-2 gap-3">
							<UFormGroup label="Vessel">
								<USelectMenu
									v-model="batchStore.batch.distilling.vessel"
									:options="vesselStore.stills"
									option-attribute="name"
									value-attribute="_id" />
							</UFormGroup>
							<UFormGroup label="Distillation Date">
								<SiteDatePicker v-model="batchStore.batch.distilling.date" />
							</UFormGroup>
						</div>
						<div>
							<UFormGroup label="Heads">
								<div class="grid grid-cols-2 gap-3">
									<UButtonGroup>
										<UInput
											v-model="
												batchStore.batch.distilling.collected.heads.volume
											"
											type="number"
											placeholder="Amount" />
										<USelectMenu
											v-model="
												batchStore.batch.distilling.collected.heads.volumeUnit
											"
											:options="volumeUnits"
											placeholder="unit" />
									</UButtonGroup>
									<UInput
										v-model="batchStore.batch.distilling.collected.heads.abv"
										type="number"
										placeholder="ABV">
										<template #trailing>%</template>
									</UInput>
								</div>
							</UFormGroup>
							<UFormGroup label="Hearts">
								<div class="grid grid-cols-2 gap-3">
									<UButtonGroup>
										<UInput
											v-model="
												batchStore.batch.distilling.collected.hearts.volume
											"
											type="number"
											placeholder="Amount" />
										<USelectMenu
											v-model="
												batchStore.batch.distilling.collected.hearts.volumeUnit
											"
											:options="volumeUnits"
											placeholder="unit" />
									</UButtonGroup>
									<UInput
										v-model="batchStore.batch.distilling.collected.hearts.abv"
										type="number"
										placeholder="ABV">
										<template #trailing>%</template>
									</UInput>
								</div>
							</UFormGroup>
							<UFormGroup label="Tails">
								<div class="grid grid-cols-2 gap-3">
									<UButtonGroup>
										<UInput
											v-model="
												batchStore.batch.distilling.collected.tails.volume
											"
											type="number"
											placeholder="Amount" />
										<USelectMenu
											v-model="
												batchStore.batch.distilling.collected.tails.volumeUnit
											"
											:options="volumeUnits"
											placeholder="unit" />
									</UButtonGroup>
									<UInput
										v-model="batchStore.batch.distilling.collected.tails.abv"
										type="number"
										placeholder="ABV">
										<template #trailing>%</template>
									</UInput>
								</div>
							</UFormGroup>
						</div>
						<div>
							<UFormGroup label="Notes">
								<UTextarea
									v-model="batchStore.batch.distilling.notes"
									autoresize />
							</UFormGroup>
						</div>
					</div>
				</UCard>
			</div>
		</UCard>
	</UContainer>
</template>

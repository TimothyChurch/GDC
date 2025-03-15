<script setup>
const {
	initialWeight,
	initialVolume,
	initialAbv,
	targetAbv,
	waterNeeded,
	steps,
} = useProofingCalculator();
</script>

<template>
	<div class="flex flex-col justify-center gap-3 p-3">
		<div class="grid grid-cols-2 gap-3">
			<UFormGroup label="Initial Weight">
				<div class="grid grid-cols-2 gap-2">
					<UInput
						v-model="initialWeight.weight"
						type="number" />
					<div class="flex-grow">
						<USelect
							v-model="initialWeight.unit"
							:options="['kg', 'lb']" />
					</div>
					g
				</div>
			</UFormGroup>
			<UFormGroup label="Initial ABV">
				<UInput
					v-model="initialAbv"
					type="number">
					<template #trailing>%</template>
				</UInput>
			</UFormGroup>
		</div>
		<div class="grid grid-cols-2 gap-2 justify-around">
			<UFormGroup label="Initial Volume">
				<div
					v-if="initialVolume.unit === 'L'"
					class="text-center">
					{{ initialVolume.volume * convertUnitRatio('L', 'gallon') }} gal /
					{{ initialVolume.volume }} {{ initialVolume.unit }}
				</div>
				<div
					v-else-if="initialVolume.unit === 'gal'"
					class="text-center">
					{{ initialVolume.volume }} {{ initialVolume.unit }} /
					{{
						(initialVolume.volume * convertUnitRatio('gallon', 'L')).toFixed(2)
					}}
					L
				</div>
			</UFormGroup>
			<UFormGroup label="Target ABV">
				<UInput
					v-model="targetAbv"
					type="number">
					<template #trailing>%</template>
				</UInput>
			</UFormGroup>
		</div>
		<div
			v-for="step in steps"
			class="grid grid-cols-2 gap-2">
			<UFormGroup label="Water Added">
				<div class="grid grid-cols-2 gap-2">
					<UInput
						v-model="step.volume"
						type="number" />
					<USelect
						v-model="step.unit"
						:options="['L', 'gallon']" />
				</div>
			</UFormGroup>
			<UFormGroup label="New ABV">
				<UInput
					v-model="step.abv"
					type="number">
					<template #trailing>%</template>
				</UInput>
			</UFormGroup>
		</div>
		<div class="flex gap-2 justify-evenly">
			<UFormGroup label="Recommended Water">
				<div v-if="waterNeeded?.unit === 'L'">
					{{ waterNeeded?.volume * convertUnitRatio('L', 'gallon') }} gal /
					{{ waterNeeded?.volume }} {{ waterNeeded?.unit }}
				</div>
				<div v-else-if="waterNeeded?.unit === 'gal'">
					{{ waterNeeded?.volume }} {{ waterNeeded?.unit }} /
					{{
						(waterNeeded?.volume * convertUnitRatio('gallon', 'L')).toFixed(2)
					}}
					L
				</div>
			</UFormGroup>
			<UFormGroup label="Add Water">
				<UButton
					@click="
						steps.push({
							volume: 0,
							unit: 'L',
							abv: 0,
						})
					"
					>Add Water</UButton
				>
			</UFormGroup>
		</div>
	</div>
</template>

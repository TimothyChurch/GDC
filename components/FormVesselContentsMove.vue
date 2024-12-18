<script setup>
const vesselStore = useVesselStore();
const batchStore = useBatchStore();
</script>

<template>
	<div class="flex-grow">
		<div class="grid grid-cols-2 gap-3">
			<UCard>
				<template #header> Origin </template>
				<div v-if="vesselStore.vessel.name">
					Vessel: {{ vesselStore.vessel.name }}
					<UButton
						@click="vesselStore.resetVessel()"
						color="gray"
						icon="i-heroicons-x-mark"
						variant="ghost"
						class="p-0.5 m-0 align-bottom" />
				</div>
				<div
					v-else
					class="flex gap-3">
					<span> Vessel: </span>
					<USelectMenu
						v-model="vesselStore.vessel"
						:options="vesselStore.vessels"
						option-attribute="name"
						class="flex-grow" />
				</div>
				<div v-for="content in vesselStore.vessel.contents">
					<div>
						Batch: {{ batchStore.getRecipeNameByBatchId(content.batch) }}
						{{ content.batch }}
					</div>
					<div>Type: {{ content.type }}</div>
					<div>Quantity: {{ content.volume }} {{ content.volumeUnit }}</div>
					<div>ABV: {{ content.abv }}</div>
					<div>Cost: {{ Dollar.format(content.cost) }}</div>
				</div>
			</UCard>
			<UCard>
				<template #header> Destination </template>
			</UCard>
		</div>
	</div>
</template>

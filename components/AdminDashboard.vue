<script setup lang="ts">
import type { ObjectId } from 'mongoose';
import type { Batch } from '~/types';
const router = useRouter();
// Access needed Stores
const batchStore = useBatchStore();
const vesselStore = useVesselStore();
// Click on batch
const selectedBatch = ref();
// Move Items
const items = computed(() => {
	if (batchStore.batch.status === 'Upcoming') {
		return [
			vesselStore.mashTuns.map((tun) => {
				return {
					label: tun.name,
					click: () => moveBatch(tun._id.toString(), 'Brewing'),
				};
			}),
		];
	}
	if (batchStore.batch.status === 'Brewing') {
		return [
			vesselStore.fermenters.map((tun) => {
				return {
					label: tun.name,
					click: () => moveBatch(tun._id.toString(), 'Fermenting'),
				};
			}),
		];
	}
	if (batchStore.batch.status === 'Fermenting') {
		return [
			vesselStore.stills.map((tun) => {
				return {
					label: tun.name,
					click: () => moveBatch(tun._id.toString(), 'Distilling'),
				};
			}),
		];
	}
});
const moveBatch = (id: string, stage: string) => {
	(batchStore.batch as any)[stage.toLowerCase()].vessel = id;
	console.log(batchStore.batch.fermenting);
	batchStore.batch.status = stage;
	batchStore.updateBatch();
};
const fermentingBatch = (id: string) => {
	return batchStore.fermentingBatches.find(
		(batch) => batch.fermenting.vessel == (id as unknown as ObjectId)
	);
};
</script>

<template>
	<div>
		<DashboardUpcoming />
		<UCard>
			<template #header>
				<h1>Upcoming</h1>
			</template>
			<div class="flex gap-3">
				<div v-for="batch in batchStore.upcomingBatches">
					<UPopover>
						<UCard @click="batchStore.batch = batch">
							<template #header>
								<span>{{ batch.status }}</span>
							</template>
							<div>
								{{ batch.recipe }}
							</div>
						</UCard>
						<template #panel>
							<div class="flex flex-col gap-1 p-1">
								<UButton
									@click="router.push(`/admin/batch/${batchStore.batch._id}`)"
									color="gray"
									variant="ghost">
									Details
								</UButton>
								<UDropdown :items="items">
									<UButton
										color="gray"
										variant="ghost">
										Move
									</UButton>
								</UDropdown>
							</div>
						</template>
					</UPopover>
				</div>
			</div>
		</UCard>
		<UCard>
			<template #header>
				<h1>Brewing</h1>
			</template>
			<div v-for="vessel in vesselStore.mashTuns">
				<UCard>
					<template #header>
						<h1>{{ vessel.name }}</h1>
					</template>
					<div class="flex gap-3">
						<div v-for="batch in batchStore.brewingBatches">
							<UPopover>
								<UCard @click="batchStore.batch = batch">
									<template #header>
										<span>{{ batch.status }}</span>
									</template>
									<div>
										{{ batch.recipe }}
									</div>
								</UCard>
								<template #panel>
									<div class="flex flex-col gap-1 p-1">
										<UButton
											@click="
												router.push(`/admin/batch/${batchStore.batch._id}`)
											"
											color="gray"
											variant="ghost">
											Details
										</UButton>
										<UDropdown :items="items">
											<UButton
												color="gray"
												variant="ghost">
												Move
											</UButton>
										</UDropdown>
									</div>
								</template>
							</UPopover>
						</div>
					</div>
				</UCard>
			</div>
		</UCard>
		<UCard>
			<template #header>
				<h1>Fermenting</h1>
			</template>
			<div class="flex gap-3">
				<div v-for="vessel in vesselStore.fermenters">
					<UCard>
						<template #header>
							<h1>{{ vessel.name }}</h1>
						</template>
						<UPopover>
							<UCard
								@click="
									batchStore.batch = fermentingBatch(
										vessel._id.toString()
									) as Batch
								">
								<template #header>
									<span>{{
										fermentingBatch(vessel._id.toString())?.status
									}}</span>
								</template>
								<div>
									{{ fermentingBatch(vessel._id.toString())?.recipe }}
								</div>
							</UCard>
							<template #panel>
								<div class="flex flex-col gap-1 p-1">
									<UButton
										@click="router.push(`/admin/batch/${batchStore.batch._id}`)"
										color="gray"
										variant="ghost">
										Details
									</UButton>
									<UDropdown :items="items">
										<UButton
											color="gray"
											variant="ghost">
											Move
										</UButton>
									</UDropdown>
								</div>
							</template>
						</UPopover>
					</UCard>
				</div>
			</div>
		</UCard>
		<UCard>
			<template #header>
				<h1>Distilling</h1>
			</template>
			<div>
				{{ batchStore.getBatchByStatus('Distilling') }}
			</div>
		</UCard>
		<UCard>
			<template #header>
				<h1>Storage</h1>
			</template>
			<div>
				{{ batchStore.getBatchByStatus('Storage') }}
			</div>
		</UCard>
	</div>
</template>

<script setup lang="ts">
import * as yup from 'yup';

// Access needed stores
const productionsStore = useProductionStore();
const vesselStore = useVesselStore();
const bottleStore = useBottleStore();
const itemStore = useItemStore();
const recipeStore = useRecipeStore();
const batchStore = useBatchStore();

const schema = yup.object({
	date: yup.date().required('Production date is required'),
	bottle: yup.string().required('Bottle is required'),
	quantity: yup.number().positive('Must be greater than 0').required('Quantity is required'),
});

// Labels for vessels based on their contents
const vesselLabels = computed(() => {
	const vessels = vesselStore.vessels.filter(
		(vessel) =>
			vessel.type.toLowerCase() === 'barrel' ||
			vessel.type.toLowerCase() === 'tank'
	);
	return vessels.map((vessel) => {
		if (vessel.contents.length === 0) {
			return { _id: vessel._id, name: vessel.name + ' - empty' };
		}
		const recipeNames = vessel.contents.map((content: { batch: string }) => {
			const batch = batchStore.getBatchById(content.batch);
			const recipe = recipeStore.getRecipeById(
				batch?.recipe.toString() as string
			);
			if (!batch) return 'empty';
			else return recipe?.name;
		});
		const vesselObject = {
			_id: vessel._id,
			name: vessel.name + ' -' + recipeNames.join(', '),
		};

		return vesselObject;
	});
});
// Compute overall production cost
const productionCost = computed(() => {
	const batchCost = ref(0);
	const barrelCost = ref(0);
	if (productionsStore.production.vessel.length > 0) {
		productionsStore.production.vessel.forEach((vessel) => {
			const v = vesselStore.getVesselById(vessel as unknown as string);
			v?.contents.forEach(
				(content: { cost: number }) => (batchCost.value += content.cost)
			);
			barrelCost.value += v?.barrel.cost as number;
		});
	}

	const bottleCost = productionsStore.production.bottling.glassware
		? (latestPrice(
				productionsStore.production.bottling.glassware as unknown as string
		  ) as number)
		: 0;
	const capCost = productionsStore.production.bottling.cap
		? (latestPrice(
				productionsStore.production.bottling.cap as unknown as string
		  ) as number)
		: 0;
	const labelCost = productionsStore.production.bottling.label
		? (latestPrice(
				productionsStore.production.bottling.label as unknown as string
		  ) as number)
		: 0;

	const totalCost =
		batchCost.value +
		barrelCost.value +
		(bottleCost + capCost + labelCost) * productionsStore.production.quantity;

	return totalCost;
});
// Filter vessels based on selected IDs
const filteredVessels = (ids: any[]) => {
	const filtered = ids.map((id) => {
		const temp = vesselLabels.value.find(
			(vessel) => (vessel._id as object) === id
		);
		if (typeof temp == 'object') return temp.name;
		else return temp;
	});
	return filtered;
};
// Save production
const saveProduction = () => {
	productionsStore.production.productionCost = productionCost.value;
	productionsStore.production.bottleCost =
		productionCost.value / productionsStore.production.quantity;
	productionsStore.updateProduction();
};
</script>

<template>
	<div>
		<UForm
			:schema="schema"
			:state="productionsStore.production"
			@submit="saveProduction">
			<UFormField label="Production Date" name="date">
				<SiteDatePicker v-model="productionsStore.production.date" />
			</UFormField>
			<UFormField label="Vessels" name="vessel">
				<USelectMenu
					v-model="productionsStore.production.vessel"
					:options="vesselLabels"
					option-attribute="name"
					value-attribute="_id"
					multiple
					searchable>
					<template #label>
						<span v-if="productionsStore.production.vessel.length > 0">{{
							filteredVessels(productionsStore.production.vessel).join(', ')
						}}</span>
					</template>
				</USelectMenu>
			</UFormField>
			<UFormField label="Bottle" name="bottle">
				<USelectMenu
					v-model="productionsStore.production.bottle"
					:options="bottleStore.bottles"
					option-attribute="name"
					value-attribute="_id"
					searchable />
			</UFormField>
			<UFormField label="Glassware" name="bottling.glassware">
				<USelectMenu
					v-model="productionsStore.production.bottling.glassware"
					:options="
						itemStore.items.filter(
							(item) => item.type?.toLowerCase() === 'glass bottle'
						)
					"
					option-attribute="name"
					value-attribute="_id" />
			</UFormField>
			<UFormField label="Cap" name="bottling.cap">
				<USelect
					v-model="productionsStore.production.bottling.cap"
					:options="
						itemStore.items.filter(
							(item) => item.type?.toLowerCase() === 'bottle cap'
						)
					"
					option-attribute="name"
					value-attribute="_id" />
			</UFormField>
			<UFormField label="Label" name="bottling.label">
				<USelectMenu
					v-model="productionsStore.production.bottling.label"
					:options="
						itemStore.items.filter(
							(item) => item.type?.toLowerCase() === 'label'
						)
					"
					option-attribute="name"
					value-attribute="_id" />
			</UFormField>
			<UFormField label="Quantity" name="quantity">
				<UInput
					v-model="productionsStore.production.quantity"
					type="number" />
			</UFormField>
			<UFormField label="Production Cost">
				{{ Dollar.format(productionCost) }}
			</UFormField>
			<UFormField label="Bottle Cost">
				{{
					Dollar.format(productionCost / productionsStore.production.quantity)
				}}
			</UFormField>
			<UButton type="submit" :loading="productionsStore.saving">Submit</UButton>
		</UForm>
	</div>
</template>

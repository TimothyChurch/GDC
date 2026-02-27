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

const updateInventory = ref(true);

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
// Cost breakdown computeds
const calculatedBatchCost = computed(() => {
	let total = 0;
	if (productionsStore.production.vessel.length > 0) {
		productionsStore.production.vessel.forEach((vessel) => {
			const v = vesselStore.getVesselById(vessel as unknown as string);
			v?.contents.forEach(
				(content: { cost: number }) => (total += content.cost || 0)
			);
		});
	}
	return total;
});

const calculatedBarrelCost = computed(() => {
	let total = 0;
	if (productionsStore.production.vessel.length > 0) {
		productionsStore.production.vessel.forEach((vessel) => {
			const v = vesselStore.getVesselById(vessel as unknown as string);
			total += v?.barrel?.cost || 0;
		});
	}
	return total;
});

const calculatedBottlingCost = computed(() => {
	const glassCost = productionsStore.production.bottling.glassware
		? (latestPrice(
				productionsStore.production.bottling.glassware as unknown as string
		  ) as number) || 0
		: 0;
	const capCost = productionsStore.production.bottling.cap
		? (latestPrice(
				productionsStore.production.bottling.cap as unknown as string
		  ) as number) || 0
		: 0;
	const labelCost = productionsStore.production.bottling.label
		? (latestPrice(
				productionsStore.production.bottling.label as unknown as string
		  ) as number) || 0
		: 0;
	return (glassCost + capCost + labelCost) * (productionsStore.production.quantity || 0);
});

const productionCost = computed(() => {
	return (
		calculatedBatchCost.value +
		calculatedBarrelCost.value +
		calculatedBottlingCost.value +
		(productionsStore.production.costs?.labor || 0) +
		(productionsStore.production.costs?.ttbTax || 0) +
		(productionsStore.production.costs?.tabcTax || 0) +
		(productionsStore.production.costs?.other || 0)
	);
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
const saveProduction = async () => {
	const isNewProduction = !productionsStore.production._id;
	productionsStore.production.costs = {
		batch: calculatedBatchCost.value,
		barrel: calculatedBarrelCost.value,
		bottling: calculatedBottlingCost.value,
		labor: productionsStore.production.costs?.labor || 0,
		ttbTax: productionsStore.production.costs?.ttbTax || 0,
		tabcTax: productionsStore.production.costs?.tabcTax || 0,
		other: productionsStore.production.costs?.other || 0,
	};
	productionsStore.production.productionCost = productionCost.value;
	productionsStore.production.bottleCost =
		productionsStore.production.quantity > 0
			? productionCost.value / productionsStore.production.quantity
			: 0;

	// Capture production data before updateProduction resets it
	const inventoryData = {
		quantity: productionsStore.production.quantity,
		bottle: productionsStore.production.bottle,
		bottling: { ...productionsStore.production.bottling },
	};

	await productionsStore.updateProduction();

	// Auto-adjust inventory for new productions only (not edits), if toggle is on
	if (isNewProduction && updateInventory.value) {
		await productionsStore.adjustInventoryForProduction(inventoryData);
	}
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
					:items="vesselLabels"
					label-key="name"
					value-key="_id"
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
					:items="bottleStore.bottles"
					label-key="name"
					value-key="_id"
					searchable />
			</UFormField>
			<UFormField label="Glassware" name="bottling.glassware">
				<BaseItemSelect v-model="productionsStore.production.bottling.glassware" filter-by-type="glass bottle" create-type="glass bottle" create-category="Bottling" />
			</UFormField>
			<UFormField label="Cap" name="bottling.cap">
				<BaseItemSelect v-model="productionsStore.production.bottling.cap" filter-by-type="bottle cap" create-type="bottle cap" create-category="Bottling" />
			</UFormField>
			<UFormField label="Label" name="bottling.label">
				<BaseItemSelect v-model="productionsStore.production.bottling.label" filter-by-type="label" create-type="label" create-category="Bottling" />
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
			<div
				v-if="!productionsStore.production._id"
				class="flex items-center justify-between rounded-lg border px-3 py-2 my-3"
				:class="updateInventory ? 'border-green-500/20 bg-green-500/5' : 'border-amber-500/20 bg-amber-500/5'">
				<div class="flex items-center gap-2">
					<UIcon
						:name="updateInventory ? 'i-lucide-package-check' : 'i-lucide-package-x'"
						:class="updateInventory ? 'text-green-400' : 'text-amber-400'" />
					<div>
						<div class="text-sm text-parchment">Update Inventory</div>
						<div class="text-[10px] text-parchment/50">
							{{ updateInventory ? 'Bottle stock will be increased and materials decreased' : 'No inventory changes — use for recording historical productions' }}
						</div>
					</div>
				</div>
				<USwitch v-model="updateInventory" />
			</div>
			<UButton type="submit" :loading="productionsStore.saving">Submit</UButton>
		</UForm>
	</div>
</template>

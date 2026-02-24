<script setup lang="ts">
import * as yup from 'yup';

const itemStore = useItemStore();
const categories = useItemCategories();

const schema = yup.object({
	name: yup.string().required('Item name is required'),
	category: yup.string(),
	minStock: yup.number().min(0, 'Min stock cannot be negative'),
	reorderPoint: yup.number().min(0, 'Reorder point cannot be negative'),
	usePerMonth: yup.number().min(0, 'Use per month cannot be negative'),
	notes: yup.string(),
	trackInventory: yup.boolean(),
});

const categoryItems = computed(() =>
	categories.value.map((c) => ({ label: c, value: c }))
);

const addType = (type: string) => {
	itemInventoryTypes.value.push(type);
	itemStore.item.type = type;
};
const handleSubmit = () => {
	itemStore.updateItem();
};
</script>

<template>
	<UContainer class="flex justify-around p-5">
		<UCard>
			<UForm
				:schema="schema"
				:state="itemStore.item"
				@submit="handleSubmit"
				class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
				<UFormField label="Name" name="name" class="md:col-span-3">
					<UInput v-model="itemStore.item.name" placeholder="Name" />
				</UFormField>
				<UFormField label="Type" name="type" class="md:col-span-3">
					<USelectMenu
						v-model="itemStore.item.type"
						:items="itemInventoryTypes"
						create-item
						@create="addType"
						class="w-full" />
				</UFormField>
				<UFormField label="Inventory Unit" name="inventoryUnit" class="md:col-span-3">
					<USelect
						v-model="itemStore.item.inventoryUnit"
						:items="allUnits"
						class="w-full" />
				</UFormField>
				<UFormField label="Category" name="category" class="md:col-span-3">
					<USelect
						v-model="itemStore.item.category"
						:items="categoryItems"
						class="w-full" />
				</UFormField>
				<UFormField label="Min Stock" name="minStock" class="md:col-span-2">
					<UInput type="number" v-model="itemStore.item.minStock" min="0" class="w-full" />
				</UFormField>
				<UFormField label="Reorder Point" name="reorderPoint" class="md:col-span-2">
					<UInput type="number" v-model="itemStore.item.reorderPoint" min="0" class="w-full" />
				</UFormField>
				<UFormField label="Use / Month" name="usePerMonth" class="md:col-span-2">
					<UInput type="number" v-model="itemStore.item.usePerMonth" min="0" class="w-full" />
				</UFormField>
				<UFormField label="Notes" name="notes" class="col-span-full">
					<UTextarea
						v-model="itemStore.item.notes"
						placeholder="Miscellaneous notes (e.g., average weight per unit, storage requirements)"
						:rows="3"
						class="w-full" />
				</UFormField>
				<UFormField name="trackInventory" class="col-span-full">
					<div class="flex items-center justify-between">
						<div>
							<div class="text-sm font-medium text-parchment">Track Inventory</div>
							<div class="text-xs text-parchment/60">Enable stock tracking, counts, and low-stock alerts for this item</div>
						</div>
						<USwitch v-model="itemStore.item.trackInventory" />
					</div>
				</UFormField>
				<div class="flex justify-around col-span-full">
					<UButton type="submit" :loading="itemStore.saving">Add item</UButton>
				</div>
			</UForm>
		</UCard>
	</UContainer>
</template>

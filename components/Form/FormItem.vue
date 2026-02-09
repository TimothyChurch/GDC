<script setup lang="ts">
import * as yup from 'yup';

const itemStore = useItemStore();
const contactStore = useContactStore();

const schema = yup.object({
	name: yup.string().required('Item name is required'),
	pricePerUnit: yup.number().min(0, 'Price cannot be negative'),
});

const addType = (type: string) => {
	itemInventoryTypes.value.push(type);
	itemStore.item.type = type;
};
const addVendor = (vendor: string) => {
	contactStore.contact.businessName = vendor;
	contactStore.contact.type = "Vendor";
	contactStore.updateContact();
};
const handleSubmit = () => {
	itemStore.updateItem();
	toggleFormModal();
};
</script>

<template>
	<UContainer class="flex justify-around p-5">
		<UCard class="w-fit">
			<UForm
				:schema="schema"
				:state="itemStore.item"
				@submit="handleSubmit"
				class="grid grid-cols-6 gap-3 max-w-lg">
				<UFormField label="Name" name="name" class="col-span-3">
					<UInput v-model="itemStore.item.name" placeholder="Name" />
				</UFormField>
				<UFormField label="Brand" name="brand" class="col-span-3">
					<UInput v-model="itemStore.item.brand" placeholder="Brand" />
				</UFormField>
				<UFormField label="Type" name="type" class="w-48 col-span-3">
					<USelectMenu
						v-model="itemStore.item.type"
						:items="itemInventoryTypes"
						create-item
						@create="addType"
						class="w-full" />
				</UFormField>
				<UFormField label="Vendor" name="vendor" class="w-48 col-span-3">
					<USelectMenu
						v-model="itemStore.item.vendor"
						:items="contactStore.getVendors()"
						label-key="businessName"
						value-key="_id"
						class="w-full"
						create-item
						@create="addVendor" />
				</UFormField>
				<UFormField label="Inventory Unit" name="inventoryUnit" class="w-48 col-span-3">
					<USelect
						v-model="itemStore.item.inventoryUnit"
						:items="allUnits"
						class="w-full" />
				</UFormField>
				<UFormField label="Price per Inventory Unit" name="pricePerUnit" class="w-48 col-span-3">
					<UInput
						type="number"
						v-model="itemStore.item.pricePerUnit"
						class="w-full" />
				</UFormField>
				<div class="flex justify-around col-span-6">
					<UButton type="submit">Add item</UButton>
				</div>
			</UForm>
		</UCard>
	</UContainer>
</template>

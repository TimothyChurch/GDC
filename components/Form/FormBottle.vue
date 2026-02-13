<script setup lang="ts">
import * as yup from 'yup';

const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();

const schema = yup.object({
	name: yup.string().required('Bottle name is required'),
	abv: yup.number().min(0, 'ABV cannot be negative').max(100, 'ABV cannot exceed 100'),
	price: yup.number().min(0, 'Price cannot be negative'),
});

const newType = (type: string) => {
	bottleStore.bottle.type = type;
};

const saveBottle = async () => {
	await bottleStore.updateBottle();
};
</script>

<template>
	<div class="p-2">
		<UForm
			:schema="schema"
			:state="bottleStore.bottle"
			@submit="saveBottle"
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
			<UFormField label="Name" name="name" class="sm:col-span-2">
				<UInput v-model="bottleStore.bottle.name" class="w-full" />
			</UFormField>
			<UFormField label="Recipe" name="recipe" class="sm:col-span-2">
				<USelectMenu
					:items="recipeStore.recipes"
					searchable
					option-attribute="name"
					value-attribute="_id"
					v-model="bottleStore.bottle.recipe"
					class="w-full" />
			</UFormField>
			<UFormField label="In Stock">
				<USwitch v-model="bottleStore.bottle.inStock" class="w-full" />
			</UFormField>
			<UFormField label="Class">
				<USelectMenu
					v-model="bottleStore.bottle.class"
					:items="liquorClasses.map((i) => i.class)"
					class="w-full" />
			</UFormField>
			<UFormField label="Type">
				<USelectMenu
					v-if="bottleStore.bottle.class != ''"
					v-model="bottleStore.bottle.type"
					:items="
						liquorClasses
							.filter((i) => i.class === bottleStore.bottle.class)[0]
							?.types.map((i) => i.type)
					"
					class="w-full"
					create-item
					@create="newType" />
			</UFormField>
			<UFormField label="ABV" name="abv">
				<UInput v-model="bottleStore.bottle.abv" />
			</UFormField>
			<UFormField label="Price" name="price">
				<UInput v-model="bottleStore.bottle.price" />
			</UFormField>
			<UFormField label="Description" name="description" class="col-span-full">
				<UTextarea v-model="bottleStore.bottle.description" class="w-full" />
			</UFormField>
			<div class="col-span-full justify-around flex">
				<UButton type="submit" :loading="bottleStore.saving">Submit</UButton>
			</div>
		</UForm>
	</div>
</template>

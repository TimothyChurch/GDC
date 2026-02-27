<script setup lang="ts">
import * as yup from 'yup';

const recipeStore = useRecipeStore();
const itemStore = useItemStore();

const schema = yup.object({
	name: yup.string().required('Recipe name is required'),
	volume: yup.number().positive('Must be greater than 0'),
});

const removeItem = (itemId: string) => {
	recipeStore.recipe.items = recipeStore.recipe.items.filter(
		(item) => item._id != itemId
	);
};
const newitem = ref({
	_id: null as string | null,
	amount: null as number | null,
	unit: null as string | null,
});

const additem = () => {
	if (!newitem.value._id || !newitem.value.amount || !newitem.value.unit) return;
	recipeStore.recipe.items.push(newitem.value);
	newitem.value = { _id: null, amount: null, unit: null };
};
const types = computed(() => {
	return liquorClasses.filter(
		(liquor) => liquor.class == recipeStore.recipe.class
	)[0]?.types;
});

const saveRecipe = () => {
	recipeStore.updateRecipe();
};
</script>
<template>
	<UContainer>
		<UForm
			:schema="schema"
			:state="recipeStore.recipe"
			@submit="saveRecipe"
			class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<UFormField label="Name" name="name" class="col-span-full">
				<UInput v-model="recipeStore.recipe.name" />
			</UFormField>
			<UFormField label="Class" name="class">
				<USelectMenu
					v-model="recipeStore.recipe.class"
					:items="liquorClasses"
					label-key="class"
					value-key="class"
					placeholder="Select Class"
					searchable />
			</UFormField>
			<UFormField label="Type" name="type">
				<USelectMenu
					v-model="recipeStore.recipe.type"
					:items="types"
					label-key="type"
					value-key="type" />
			</UFormField>
			<UFormField label="Volume" name="volume">
				<UInput v-model="recipeStore.recipe.volume" type="number" />
			</UFormField>
			<UFormField label="Volume Unit" name="volumeUnit">
				<USelectMenu
					v-model="recipeStore.recipe.volumeUnit"
					:items="volumeUnits" />
			</UFormField>

			<!-- Inline-editable ingredient rows -->
			<div class="col-span-full space-y-2">
				<div class="text-sm font-medium text-parchment/80 mb-1">Ingredients</div>
				<div
					v-for="(item, idx) in recipeStore.recipe.items"
					:key="item._id + '-' + idx"
					class="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center"
				>
					<span class="text-sm truncate">{{ itemStore.nameById(item._id) }}</span>
					<UInput
						v-model.number="recipeStore.recipe.items[idx].amount"
						type="number"
						size="sm"
						step="any"
						min="0"
					/>
					<USelectMenu
						v-model="recipeStore.recipe.items[idx].unit"
						:items="allUnits"
						size="sm"
					/>
					<UButton
						@click="removeItem(item._id)"
						icon="i-lucide-trash-2"
						color="error"
						variant="ghost"
						size="xs"
					/>
				</div>
				<!-- Add new ingredient -->
				<div class="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center pt-2 border-t border-brown/20">
					<BaseItemSelect v-model="newitem._id" placeholder="Add item..." size="sm" />
					<UInput v-model.number="newitem.amount" type="number" placeholder="Amt" size="sm" step="any" min="0" />
					<USelectMenu
						v-model="newitem.unit"
						:items="allUnits"
						placeholder="Unit"
						size="sm"
					/>
					<UButton
						@click="additem"
						icon="i-lucide-plus"
						size="xs"
						:disabled="!newitem._id || !newitem.amount || !newitem.unit"
					/>
				</div>
			</div>

			<!-- Pipeline Builder -->
			<div class="col-span-full">
				<RecipePipelineBuilder
					v-model="recipeStore.recipe.pipeline"
					v-model:template="recipeStore.recipe.pipelineTemplate"
				/>
			</div>

			<UFormField label="Directions" name="directions">
				<UTextarea v-model="recipeStore.recipe.directions" />
			</UFormField>
			<UButton type="submit" :loading="recipeStore.saving" class="my-5 col-span-2">Save Recipe</UButton>
		</UForm>
	</UContainer>
</template>

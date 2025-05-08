<script setup lang="ts">
const bottleStore = useBottleStore();
const recipeStore = useRecipeStore();

const saveBottle = async () => {
  await bottleStore.updateBottle();
};
</script>

<template>
  <div class="p-2">
    <UForm
      :state="bottleStore.bottle"
      @submit="saveBottle"
      class="grid grid-cols-12 gap-2"
    >
      <UFormField label="Name" name="name" class="col-span-5">
        <UInput v-model="bottleStore.bottle.name" class="w-full" />
      </UFormField>
      <UFormField label="Recipe" name="recipe" class="col-span-5">
        <USelectMenu
          :items="recipeStore.recipes"
          searchable
          option-attribute="name"
          value-attribute="_id"
          v-model="bottleStore.bottle.recipe"
          class="w-full"
        />
      </UFormField>
      <UFormField label="In Stock" class="col-span-2">
        <USwitch v-model="bottleStore.bottle.inStock" class="w-full" />
      </UFormField>
      <UFormField label="Class" class="col-span-4">
        <USelectMenu
          v-model="bottleStore.bottle.class"
          :items="liquorClasses.map((i) => i.class)"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Type" class="col-span-4">
        <USelectMenu
          v-if="bottleStore.bottle.class != ''"
          v-model="bottleStore.bottle.type"
          :items="
            liquorClasses
              .filter((i) => i.class === bottleStore.bottle.class)[0]
              .types.map((i) => i.type)
          "
          class="w-full"
        />
      </UFormField>
      <UFormField label="ABV" name="abv" class="col-span-2">
        <UInput v-model="bottleStore.bottle.abv" />
      </UFormField>
      <UFormField label="Price" name="price" class="col-span-2">
        <UInput v-model="bottleStore.bottle.price" />
      </UFormField>
      <UFormField label="Description" name="description" class="col-span-12">
        <UTextarea v-model="bottleStore.bottle.description" class="w-full" />
      </UFormField>
      <div class="col-span-12 justify-around flex">
        <UButton type="submit">Submit </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
const bottleStore = useBottleStore();

const { bottle } = storeToRefs(bottleStore);

const types = computed(() => {
  return liquorClasses.filter((liquor) => liquor.class == bottle.value.class)[0]
    ?.types;
});

const save = async () => {
  await bottleStore.updateBottle();
  toggleFormModal();
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <UFormGroup label="Name" name="name">
      <UInput v-model="bottle.name" />
    </UFormGroup>
    <UFormGroup label="Class" name="class">
      <USelectMenu
        v-model="bottle.class"
        :options="liquorClasses"
        option-attribute="class"
        value-attribute="class"
        placeholder="Select Class"
        searchable
      />
    </UFormGroup>
    <UFormGroup label="Type" name="type" v-if="bottleStore.bottle?.class">
      <USelectMenu
        v-model="bottle.type"
        :options="types"
        option-attribute="type"
        value-attribute="type"
      />
    </UFormGroup>
    <UFormGroup label="ABV" name="abv">
      <UInput v-model="bottle.abv" />
    </UFormGroup>

    <UFormGroup label="Recipe" name="recipe">
      <UInput v-model="bottle.recipe" />
    </UFormGroup>

    <UButton @click="save"> Submit </UButton>
  </div>
</template>

<script setup lang="ts">
const bottleStore = useBottleStore();

const initialState = {
  name: undefined,
  class: undefined,
  type: undefined,
  abv: undefined,
  recipe: undefined,
};
const state = reactive(initialState);

const types = computed(() => {
  return liquorClasses.filter((liquor) => liquor.class == state.class)[0]
    ?.types;
});

const save = async () => {
  await bottleStore.addBottle(state);
  Object.assign(state, initialState);
  toggleFormModal();
};
</script>

<template>
  <div class="flex flex-col gap-3">
    <UFormGroup label="Name" name="name">
      <UInput v-model="state.name" />
    </UFormGroup>
    <UFormGroup label="Class" name="class">
      <USelectMenu
        v-model="state.class"
        :options="liquorClasses"
        option-attribute="class"
        value-attribute="class"
        placeholder="Select Class"
        searchable
      />
    </UFormGroup>
    <UFormGroup label="Type" name="type" v-if="state.class">
      <USelectMenu
        v-model="state.type"
        :options="types"
        option-attribute="type"
        value-attribute="type"
      />
    </UFormGroup>
    <UFormGroup label="ABV" name="abv">
      <UInput v-model="state.abv" />
    </UFormGroup>

    <UFormGroup label="Recipe" name="recipe">
      <UInput v-model="state.recipe" />
      <!-- TODO Make connection to Recipe UID -->
    </UFormGroup>

    <UButton @click="save"> Submit </UButton>
  </div>
</template>

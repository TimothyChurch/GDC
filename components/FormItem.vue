<script setup>
const itemStore = useItemStore();
const contactStore = useContactStore();

const types = ["Grain", "Yeast", "Sugar", "Enzyme", "Other"];

const handleSubmit = () => {
  itemStore.updateitem();
  toggleFormModal();
};
</script>

<template>
  <UContainer>
    <UForm
      :state="itemStore.item"
      @submit.prevent="handleSubmit"
      class="grid grid-cols-1 gap-3"
    >
      <UFormGroup label="Name">
        <UInput v-model="itemStore.item.name" placeholder="Name" />
      </UFormGroup>
      <UFormGroup label="Type">
        <USelect v-model="itemStore.item.type" :options="types" />
      </UFormGroup>
      <UFormGroup label="Vendor">
        <USelect
          v-model="itemStore.item.vendor"
          :options="contactStore.getVendors()"
          option-attribute="businessName"
          value-attribute="_id"
        />
      </UFormGroup>
      <UButton type="submit">Add item</UButton>
    </UForm>
  </UContainer>
</template>

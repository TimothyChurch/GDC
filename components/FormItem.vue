<script setup>
const itemStore = useItemStore();
const contactStore = useContactStore();

const types = itemInventoryTypes();

const handleSubmit = () => {
  itemStore.updateItem();
  toggleFormModal();
};
</script>

<template>
  <UContainer>
    <UForm
      :state="itemStore.item"
      @submit.prevent="handleSubmit"
      class="grid grid-cols-1 gap-3">
      <UFormGroup label="Name">
        <UInput v-model="itemStore.item.name" placeholder="Name" />
      </UFormGroup>
      <UFormGroup label="Brand">
        <UInput v-model="itemStore.item.brand" placeholder="Brand" />
      </UFormGroup>
      <UFormGroup label="Type">
        <USelectMenu
          v-model="itemStore.item.type"
          :options="types"
          searchable
          creatable />
      </UFormGroup>
      <UFormGroup label="Vendor">
        <USelect
          v-model="itemStore.item.vendor"
          :options="contactStore.getVendors()"
          option-attribute="businessName"
          value-attribute="_id" />
      </UFormGroup>
      <UFormGroup label="Inventory Unit">
        <USelect v-model="itemStore.item.inventoryUnit" :options="allUnits" />
      </UFormGroup>
      <UButton type="submit">Add item</UButton>
    </UForm>
  </UContainer>
</template>

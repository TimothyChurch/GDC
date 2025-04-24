<script setup>
const itemStore = useItemStore();
const contactStore = useContactStore();

const addType = (type) => {
  console.log(type);
  itemInventoryTypes.value.push(type);
  itemStore.item.type = type;
};
const handleSubmit = () => {
  itemStore.updateItem();
  toggleFormModal();
};
const clearItem = () => {
  itemStore.resetItem();
};
</script>

<template>
  <UContainer>
    {{ itemStore.item }}
    <UForm
      :state="itemStore.item"
      @submit.prevent="handleSubmit"
      class="flex gap-3"
    >
      <UFormField label="Name">
        <UInput v-model="itemStore.item.name" placeholder="Name" />
      </UFormField>
      <UFormField label="Brand">
        <UInput v-model="itemStore.item.brand" placeholder="Brand" />
      </UFormField>
      <UFormField label="Type" class="w-48">
        <USelectMenu
          v-model="itemStore.item.type"
          :items="itemInventoryTypes"
          create-item
          @create="addType"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Vendor" class="w-48">
        <USelect
          v-model="itemStore.item.vendor"
          :items="contactStore.getVendors()"
          label-key="businessName"
          value-key="_id"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Inventory Unit" class="w-48">
        <USelect
          v-model="itemStore.item.inventoryUnit"
          :items="allUnits"
          class="w-full"
        />
      </UFormField>
      <UButton type="submit">Add item</UButton>
      <UButton @click="clearItem">Clear</UButton>
    </UForm>
  </UContainer>
</template>

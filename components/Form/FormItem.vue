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
</script>

<template>
  <UContainer class="flex justify-around p-5">
    <UCard class="w-fit">
      <UForm
        :state="itemStore.item"
        @submit.prevent="handleSubmit"
        class="grid grid-cols-6 gap-3 max-w-lg"
      >
        <UFormField label="Name" class="col-span-3">
          <UInput v-model="itemStore.item.name" placeholder="Name" />
        </UFormField>
        <UFormField label="Brand" class="col-span-3">
          <UInput v-model="itemStore.item.brand" placeholder="Brand" />
        </UFormField>
        <UFormField label="Type" class="w-48 col-span-3">
          <USelectMenu
            v-model="itemStore.item.type"
            :items="itemInventoryTypes"
            create-item
            @create="addType"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Vendor" class="w-48 col-span-3">
          <USelect
            v-model="itemStore.item.vendor"
            :items="contactStore.getVendors()"
            label-key="businessName"
            value-key="_id"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Inventory Unit" class="w-48 col-span-3">
          <USelect
            v-model="itemStore.item.inventoryUnit"
            :items="allUnits"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Price per Inventory Unit" class="w-48 col-span-3">
          <UInput
            type="number"
            v-model="itemStore.item.pricePerUnit"
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-around col-span-6">
          <UButton type="submit">Add item</UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const route = useRoute();
const itemStore = useItemStore();
const contactStore = useContactStore();

itemStore.setItem(route.params._id);

const editing = ref(false);
const color = ref(editing.value ? "success" : "error");
const save = () => {
  itemStore.updateItem();
  editing.value = false;
};
</script>

<template>
  <div class="grid grid-cols-3 gap-3">
    <UCard class="">
      <template #header>
        <div class="grid grid-cols-2">
          <h2>Item Details</h2>
          <div>
            <UButton @click="save" v-if="editing">Save</UButton>
            <UButton @click="editing = !editing" :color="color">
              {{ editing ? "Cancel" : "Edit" }}
            </UButton>
          </div>
        </div>
      </template>
      <div class="grid grid-cols-6 gap-3">
        <UFormField label="Name" class="col-span-3">
          <div v-if="!editing">{{ itemStore.item.name }}</div>
          <UInput v-else v-model="itemStore.item.name" />
        </UFormField>
        <UFormField label="Brand" class="col-span-3">
          <div v-if="!editing">{{ itemStore.item.brand }}</div>
          <UInput v-else v-model="itemStore.item.brand" />
        </UFormField>

        <UFormField label="Vendor" class="col-span-2">
          <div v-if="!editing">
            {{
              contactStore.getContactById(
                itemStore.item.vendor as string
              )?.businessName
            }}
          </div>
          <USelect
            v-else
            v-model="itemStore.item.vendor"
            :items="contactStore.contacts"
            value-key="_id"
            label-key="businessName"
          />
        </UFormField>
        <UFormField label="Inventory Unit" class="col-span-2">
          {{ itemStore.item.inventoryUnit }}
        </UFormField>
        <UFormField label="Price" class="col-span-2">
          <div v-if="!editing">${{ itemStore.item?.pricePerUnit }}</div>
          <UInput
            v-else
            icon="i-lucide-dollar-sign"
            v-model="itemStore.item.pricePerUnit"
          />
        </UFormField>
      </div>

      <template #footer> </template>
    </UCard>
    <UCard>
      <template #header>
        <h2>Purchase History</h2>
      </template>
      {{ itemStore.item.purchaseHistory }}
    </UCard>
    <UCard>
      <template #header>
        <h2>Inventory History</h2>
      </template>
      {{ itemStore.item.inventoryHistory }}
    </UCard>
  </div>
</template>

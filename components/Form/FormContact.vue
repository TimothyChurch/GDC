<script setup>
const contactStore = useContactStore();

const options = [
  "Vendor",
  "Customer",
  "Distributor",
  "Employee",
  "Supplier",
  "Other",
];

const submitForm = () => {
  contactStore.updateContact(contactStore.contact);
  toggleFormModal();
};
</script>

<template>
  <UContainer>
    <UForm
      :state="contactStore.contact"
      @submit.prevent="submitForm"
      class="grid grid-cols-2 gap-3"
    >
      <UFormGroup label="First Name" class="col-span-1">
        <UInput v-model="contactStore.contact.firstName" type="text" />
      </UFormGroup>
      <UFormGroup label="Last Name" class="col-span-1">
        <UInput v-model="contactStore.contact.lastName" type="text" />
      </UFormGroup>
      <UFormGroup label="Business Name" class="col-span-2">
        <UInput v-model="contactStore.contact.businessName" type="text" />
      </UFormGroup>
      <UFormGroup label="Type" class="col-span-2">
        <USelect v-model="contactStore.contact.type" :options="options">
        </USelect>
      </UFormGroup>
      <UFormGroup label="Website" class="col-span-2">
        <UInput v-model="contactStore.contact.website" type="url" />
      </UFormGroup>
      <UFormGroup label="Address" class="col-span-2">
        <UInput v-model="contactStore.contact.address" type="text" />
      </UFormGroup>
      <UFormGroup label="Email" class="col-span-1">
        <UInput v-model="contactStore.contact.email" type="email" />
      </UFormGroup>
      <UFormGroup label="Phone" class="col-span-1">
        <UInput v-model="contactStore.contact.phone" type="tel" />
      </UFormGroup>
      <UButton type="submit">Submit</UButton>
    </UForm>
  </UContainer>
</template>

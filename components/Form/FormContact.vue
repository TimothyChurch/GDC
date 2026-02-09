<script setup lang="ts">
import * as yup from 'yup';

const contactStore = useContactStore();

const schema = yup.object({
	businessName: yup.string().required('Business name is required'),
	type: yup.string().required('Contact type is required'),
	firstName: yup.string(),
	lastName: yup.string(),
	email: yup.string().email('Invalid email'),
	phone: yup.string(),
	website: yup.string().url('Invalid URL'),
	address: yup.string(),
});

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
			:schema="schema"
			:state="contactStore.contact"
			@submit="submitForm"
			class="grid grid-cols-2 gap-3">
			<UFormField label="First Name" name="firstName" class="col-span-1">
				<UInput v-model="contactStore.contact.firstName" type="text" />
			</UFormField>
			<UFormField label="Last Name" name="lastName" class="col-span-1">
				<UInput v-model="contactStore.contact.lastName" type="text" />
			</UFormField>
			<UFormField label="Business Name" name="businessName" class="col-span-2">
				<UInput v-model="contactStore.contact.businessName" type="text" />
			</UFormField>
			<UFormField label="Type" name="type" class="col-span-2">
				<USelect v-model="contactStore.contact.type" :options="options" />
			</UFormField>
			<UFormField label="Website" name="website" class="col-span-2">
				<UInput v-model="contactStore.contact.website" type="url" />
			</UFormField>
			<UFormField label="Address" name="address" class="col-span-2">
				<UInput v-model="contactStore.contact.address" type="text" />
			</UFormField>
			<UFormField label="Email" name="email" class="col-span-1">
				<UInput v-model="contactStore.contact.email" type="email" />
			</UFormField>
			<UFormField label="Phone" name="phone" class="col-span-1">
				<UInput v-model="contactStore.contact.phone" type="tel" />
			</UFormField>
			<UButton type="submit">Submit</UButton>
		</UForm>
	</UContainer>
</template>

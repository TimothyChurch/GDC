<script setup lang="ts">
import * as yup from 'yup';

const toast = useToast();

const schema = yup.object({
	firstName: yup.string().required('First name is required'),
	lastName: yup.string().required('Last name is required'),
	email: yup.string().email('Invalid email').required('Email is required'),
	password: yup.string().min(8, 'Must be at least 8 characters').required('Password is required'),
	phoneNumber: yup.string(),
});

const saving = ref(false);
const newUser = ref({
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	phoneNumber: '',
});

const handleSubmit = async () => {
	saving.value = true;
	try {
		await $fetch('/api/users/create', {
			method: 'POST',
			body: JSON.stringify(newUser.value),
		});
		toast.add({ title: 'User created', color: 'success', icon: 'i-lucide-check-circle' });
		newUser.value = {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			phoneNumber: '',
		};
	} catch (error: any) {
		toast.add({ title: 'Failed to create user', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' });
	} finally {
		saving.value = false;
	}
};
</script>

<template>
	<UContainer>
		<UForm
			:schema="schema"
			:state="newUser"
			@submit="handleSubmit"
			class="space-y-4">
			<UFormField label="First Name" name="firstName">
				<UInput v-model="newUser.firstName" placeholder="Enter first name" />
			</UFormField>
			<UFormField label="Last Name" name="lastName">
				<UInput v-model="newUser.lastName" placeholder="Enter last name" />
			</UFormField>
			<UFormField label="Email" name="email">
				<UInput v-model="newUser.email" type="email" placeholder="Enter email" />
			</UFormField>
			<UFormField label="Password" name="password">
				<UInput v-model="newUser.password" type="password" placeholder="Enter password" />
			</UFormField>
			<UFormField label="Phone Number" name="phoneNumber">
				<UInput v-model="newUser.phoneNumber" placeholder="Enter phone number" />
			</UFormField>
			<UButton type="submit" color="primary" :loading="saving" class="mt-4">
				Create User
			</UButton>
		</UForm>
	</UContainer>
</template>

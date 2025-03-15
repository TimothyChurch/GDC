<script setup lang="ts">
const newUser = ref({
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	phoneNumber: '',
});

const handleSubmit = async () => {
	try {
		await $fetch('/api/users/create', {
			method: 'POST',
			body: JSON.stringify(newUser.value),
		});
		// Reset form after successful submission
		newUser.value = {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			phoneNumber: '',
		};
		// You might want to show a success message or redirect the user
	} catch (error) {
		console.error('Error creating user:', error);
		// Handle error (e.g., show error message to user)
	}
};
</script>

<template>
	<UContainer>
		<UForm
			:state="newUser"
			@submit="handleSubmit"
			class="space-y-4">
			<UFormGroup
				label="First Name"
				name="firstName">
				<UInput
					v-model="newUser.firstName"
					placeholder="Enter first name" />
			</UFormGroup>

			<UFormGroup
				label="Last Name"
				name="lastName">
				<UInput
					v-model="newUser.lastName"
					placeholder="Enter last name" />
			</UFormGroup>

			<UFormGroup
				label="Email"
				name="email">
				<UInput
					v-model="newUser.email"
					type="email"
					placeholder="Enter email" />
			</UFormGroup>

			<UFormGroup
				label="Password"
				name="password">
				<UInput
					v-model="newUser.password"
					type="password"
					placeholder="Enter password" />
			</UFormGroup>

			<UFormGroup
				label="Phone Number"
				name="phoneNumber">
				<UInput
					v-model="newUser.phoneNumber"
					placeholder="Enter phone number" />
			</UFormGroup>

			<UButton
				type="submit"
				color="primary"
				class="mt-4">
				Create User
			</UButton>
		</UForm>
	</UContainer>
</template>

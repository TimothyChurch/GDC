<script setup>
const { login, user } = useAuth();
const run = async () => {
	await login('Timothy@GalvestonDistillingCo.com', 'EircAvis1989');
};
</script>

<template>
	<div>
		<h1>Index Page</h1>
		{{ user }}
		<UButton @click="run">Testing</UButton>
		<FormUser />
		<LandingProducts />
	</div>
</template>

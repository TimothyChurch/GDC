<script setup lang="ts">
const { getStoredUser, user } = useAuth();
getStoredUser();
</script>

<template>
	<div class="flex w-screen h-screen">
		<NuxtLayout>
			<NuxtPage class="grow overflow-y-auto p-3" />
		</NuxtLayout>
	</div>
</template>

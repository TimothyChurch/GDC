<script setup>
onMounted(() => {
	initializeStores();
});
</script>

<template>
	<div class="flex flex-col h-screen h-max-screen">
		<AdminHeader class="bg-blue-200" />
		<div class="flex flex-grow overflow-y-hidden">
			<AdminSidebar class="bg-purple-100" />
			<div class="overflow-y-auto mx-auto">
				<slot />
			</div>
		</div>
		<AdminModals />
		<div class="bg-red-400 p-3">Footer here</div>
	</div>
</template>

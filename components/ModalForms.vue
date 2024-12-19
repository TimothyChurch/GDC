<script setup>
const isOpen = ref(formModalStatus);
</script>

<template>
	<UModal
		v-model="isOpen"
		:ui="{ container: 'sm:items-start', width: 'sm:max-w-full w-auto' }">
		<div class="p-3 w-full">
			<FormBatch v-if="formSelection == 'FormBatch'" />
			<FormBottle v-if="formSelection == 'FormBottle'" />
			<FormContact v-if="formSelection == 'FormContact'" />
			<FormInventory v-if="formSelection == 'FormInventory'" />
			<FormItem v-if="formSelection == 'FormItem'" />
			<FormProduction v-if="formSelection == 'FormProduction'" />
			<FormRecipe v-if="formSelection == 'FormRecipe'" />
			<FormPurchaseOrder v-if="formSelection == 'FormPurchaseOrder'" />
			<FormVessel v-if="formSelection == 'FormVessel'" />
		</div>
	</UModal>
</template>

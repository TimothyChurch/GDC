<script setup>
const isOpen = ref(formModalStatus);
</script>

<template>
	<UModal
		v-model="isOpen"
		class="p-3">
		<div class="p-3">
			<FormBatch v-if="formSelection == 'FormBatch'" />
			<FormBottle v-if="formSelection == 'FormBottle'" />
			<FormContact v-if="formSelection == 'FormContact'" />
			<FormItem v-if="formSelection == 'FormItem'" />
			<FormRecipe v-if="formSelection == 'FormRecipe'" />
			<FormPurchaseOrder v-if="formSelection == 'FormPurchaseOrder'" />
			<FormVessel v-if="formSelection == 'FormVessel'" />
		</div>
	</UModal>
</template>

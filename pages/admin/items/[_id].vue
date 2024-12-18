<script setup></script>

<template>
	<div class="flex justify-left gap-3">
		<ItemDetails />
		<div class="flex flex-col gap-3">
			<ItemInventory class="flex-grow" />
			<ItemPurchaseHistory />
		</div>
	</div>
</template>

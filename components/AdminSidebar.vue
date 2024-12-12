<script setup lang="ts">
const links = [
	{
		label: 'Profile',
		to: '/admin',
	},
	{
		label: 'Batch',
		to: '/admin/batch',
	},
	{
		label: 'Bottles',
		to: '/admin/bottles',
	},
	{
		label: 'Contacts',
		to: '/admin/contacts',
	},
	{
		label: 'Inventory',
		to: '/admin/inventory',
	},
	{
		label: 'Items',
		to: '/admin/items',
	},
	{
		label: 'Recipe',
		to: '/admin/recipe',
	},
	{
		label: 'Purchase Orders',
		to: '/admin/purchaseOrders',
	},
	{
		label: 'Vessels',
		to: '/admin/vessels',
	},
];
</script>

<template>
	<div class="w-80 max-w-80 p-3"><UVerticalNavigation :links="links" /></div>
</template>

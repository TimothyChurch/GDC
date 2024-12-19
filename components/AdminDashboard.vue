<script setup lang="ts"></script>

<template>
	<div class="grid grid-cols-2 grid-rows-3">
		<DashboardUpcoming />
		<DashboardBrewing />
		<div class="col-span-3">
			<DashboardFermenters />
		</div>
		<DashboardDistilling />
	</div>
</template>

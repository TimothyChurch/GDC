<script setup></script>

<template>
	<div class="flex flex-col w-screen h-screen w-max-screen h-max-screen">
		<AdminHeader />
		<div class="flex flex-grow overflow-y-hidden">
			<AdminSidebar />
			<div class="overflow-y-auto flex-grow mx-auto">
				<slot />
			</div>
		</div>
		<AdminModals />
		<div class="p-3">Footer here</div>
	</div>
</template>

<script setup></script>

<template>
	<div class="flex flex-col w-screen h-screen w-max-screen h-max-screen">
		<AdminHeader class="bg-blue-200" />
		<div class="flex flex-grow overflow-y-hidden">
			<AdminSidebar class="bg-purple-100" />
			<div class="overflow-y-auto flex-grow mx-auto bg-gray-100">
				<slot />
			</div>
		</div>
		<AdminModals />
		<div class="bg-red-400 p-3">Footer here</div>
	</div>
</template>

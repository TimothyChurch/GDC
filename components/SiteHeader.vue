<script setup>
const navList = [
	{ name: 'Home', link: '/' },
	{ name: 'About us', link: '/about' },
	{ name: 'Products', link: '/products' },
	{ name: 'Contact Us', link: '/contact' },
	// Add more items as needed... 10 items in total for example. 10 items will be displayed on the navigation bar.
];
</script>

<template>
	<div>
		<div class="max-w-screen flex md:justify-between justify-center">
			<div class="shrink-0 flex flex-col items-center">
				<img
					src="/images/Logo.png"
					alt="Galveston Distilling Company"
					class="h-20 px-2" />
				<UButton
					icon="i-heroicons-bars-3-solid"
					variant="ghost"
					color="black"
					size="xl" />
			</div>
			<div
				name="Navbar"
				class="gap-5 font-bold mx-auto text-2xl hidden md:flex">
				<div v-for="i in navList">
					<NuxtLink :to="i.link">
						{{ i.name }}
					</NuxtLink>
				</div>
			</div>
			<div class="gap-5 font-bold mx-auto text-2xl hidden md:block">
				Contact area
			</div>
		</div>
		<div class="max-w-screen grid grid-cols-3 justify-between"></div>
	</div>
</template>

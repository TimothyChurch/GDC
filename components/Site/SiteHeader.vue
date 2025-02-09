<script setup>
const route = useRoute();
const navList = [
	{ name: 'Home', link: '/' },
	{ name: 'Menu', link: '/menu' },
	{ name: 'Bottles', link: '/bottles' },
	{ name: 'Events', link: '/events' },
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
			</div>
			<div
				name="Navbar"
				class="gap-5 font-bold mx-auto text-2xl hidden md:flex align-middle">
				<div
					v-for="i in navList"
					class="flex items-center align-middle">
					<NuxtLink :to="i.link">
						<h1 :class="i.link === route.path ? 'text-black' : 'text-gray-500'">
							{{ i.name }}
						</h1>
					</NuxtLink>
				</div>
			</div>
			<div class="gap-5 font-bold mx-auto text-2xl hidden md:block">
				Contact area
				<NuxtLink to="/admin">ADMIN</NuxtLink>
			</div>
		</div>
		<div class="max-w-screen grid grid-cols-3 justify-between"></div>
	</div>
</template>

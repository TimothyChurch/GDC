<script setup>
const products = [
	{
		id: 1,
		name: 'Leather Long Wallet',
		color: 'Natural',
		price: '$75',
		href: '#',
		imageSrc:
			'https://barschool.b-cdn.net/wp-content/uploads/2022/11/Liquor-vs-Liqueur.jpg',
		imageAlt: 'Hand stitched, orange leather long wallet.',
	},
	{
		id: 2,
		name: 'Leather Long Wallet',
		color: 'Natural',
		price: '$75',
		href: '#',
		imageSrc:
			'https://barschool.b-cdn.net/wp-content/uploads/2022/11/Liquor-vs-Liqueur.jpg',
		imageAlt: 'Hand stitched, orange leather long wallet.',
	},
	{
		id: 3,
		name: 'Leather Long Wallet',
		color: 'Natural',
		price: '$75',
		href: '#',
		imageSrc:
			'https://barschool.b-cdn.net/wp-content/uploads/2022/11/Liquor-vs-Liqueur.jpg',
		imageAlt: 'Hand stitched, orange leather long wallet.',
	},
	{
		id: 4,
		name: 'Leather Long Wallet',
		color: 'Natural',
		price: '$75',
		href: '#',
		imageSrc:
			'https://barschool.b-cdn.net/wp-content/uploads/2022/11/Liquor-vs-Liqueur.jpg',
		imageAlt: 'Hand stitched, orange leather long wallet.',
	},
];
</script>

<template>
	<div>
		<div
			class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
			<div class="md:flex md:items-center md:justify-between">
				<h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
					Trending products
				</h2>
				<NuxtLink
					to="/"
					class="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 md:block">
					Shop the collection
					<span aria-hidden="true"> &rarr;</span>
				</NuxtLink>
			</div>

			<div
				class="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
				<div
					v-for="product in products"
					:key="product.id"
					class="group relative">
					<div
						class="h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-72 xl:h-80">
						<img
							:src="product.imageSrc"
							:alt="product.imageAlt"
							class="size-full object-cover object-center" />
					</div>
					<h3 class="mt-4 text-sm text-gray-700">
						<NuxtLink :to="product.href">
							<span class="absolute inset-0" />
							{{ product.name }}
						</NuxtLink>
					</h3>
					<p class="mt-1 text-sm text-gray-500">{{ product.color }}</p>
					<p class="mt-1 text-sm font-medium text-gray-900">
						{{ product.price }}
					</p>
				</div>
			</div>

			<div class="mt-8 text-sm md:hidden">
				<a
					href="#"
					class="font-medium text-indigo-600 hover:text-indigo-500">
					Shop the collection
					<span aria-hidden="true"> &rarr;</span>
				</a>
			</div>
		</div>
	</div>
</template>

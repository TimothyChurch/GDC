<script setup lang="ts">
import type { Item } from '~/types';
const route = useRoute();

const itemStore = useItemStore();
const contactStore = useContactStore();

const item = computed(() =>
	itemStore.items.find((i) => i._id.toString() === route.params._id)
) as Ref<Item>;
</script>

<template>
	<div class="max-w-80">
		<UCard>
			<template #header>
				{{ item?.name }}
			</template>
			<div>
				<div>Brand: {{ item?.brand }}</div>
				<div>
					Vendor:
					{{
						contactStore.getContactById(item?.vendor.toString())?.businessName
					}}
				</div>
				<div>
					Price: {{ Dollar.format(latestPrice(item?._id.toString())) }} /
					{{ item?.inventoryUnit }}
				</div>
				<div>Stock: {{ currentStock(item) }} {{ item?.inventoryUnit }}</div>
			</div>
		</UCard>
	</div>
</template>

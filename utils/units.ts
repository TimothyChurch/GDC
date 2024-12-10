export const allUnits = [
	'fl oz',
	'cup',
	'gallon',
	'oz',
	'lb',
	'g',
	'kg',
	'mL',
	'L',
	'bottle',
	'each',
	'count',
];

export const volumeUnits = ['fl oz', 'cup', 'gallon', 'mL', 'L'];

export const weightUnits = ['oz', 'lb', 'g', 'kg'];

export const countUntis = ['each', 'count', 'bottle', 'cap', 'label'];

export const itemInventoryTypes = computed(() => {
	const itemStore = useItemStore();
	const filteredItems = itemStore.items.filter((item) => item.type);
	const allTypes = ref([]) as Ref<string[]>;
	filteredItems.forEach((item) => {
		if (!allTypes.value.includes(item.type)) {
			allTypes.value.push(item.type);
		}
	});
	allTypes.value.push('Bottle');
	return allTypes.value.sort((a, b) => a.localeCompare(b));
});

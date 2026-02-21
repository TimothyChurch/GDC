<script setup>
import { format } from 'date-fns';

const model = defineModel();
const open = ref(false);

const buttonLabel = () => {
	if (!model.value) {
		return 'Select a date';
	}
	if (typeof model.value == 'string') {
		return format(new Date(model.value), 'd MMM, yyyy');
	}
	return format(model.value, 'd MMM, yyyy');
};

</script>

<template>
	<UPopover v-model:open="open">
		<UFieldGroup>
			<UButton
				icon="i-heroicons-calendar-days-20-solid"
				:label="buttonLabel()" />
			<UButton
				icon="i-heroicons-x-mark"
				@click="model = null" />
		</UFieldGroup>

		<template #content>
			<DatePicker
				v-model="model"
				is-required />
		</template>
	</UPopover>
</template>

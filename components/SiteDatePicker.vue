<script setup>
import { format } from 'date-fns';

const model = defineModel();

const buttonLabel = () => {
	if (!model.value) {
		return 'Select a date';
	}
	if (typeof model.value == 'string') {
		return format(new Date(model.value), 'd MMM, yyy');
	}
	return format(model.value, 'd MMM, yyy');
};

const buttonClick = () => {
	if (model.value) {
		model.value = new Date(model);
	} else {
		model.value = new Date();
	}
};
</script>

<template>
	<UPopover :popper="{ placement: 'bottom-start' }">
		<UButtonGroup>
			<UButton
				icon="i-heroicons-calendar-days-20-solid"
				:label="buttonLabel()"
				@click="buttonClick()" />
			<UButton
				icon="i-heroicons-x-mark"
				@click="model = null" />
		</UButtonGroup>

		<template #panel="{ close }">
			<DatePicker
				v-model="model"
				is-required
				@close="close" />
		</template>
	</UPopover>
</template>

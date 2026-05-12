<script setup lang="ts">
import { TEMPERATURE_LABEL } from '~/composables/useDisplayUnits';
import { toFahrenheit, fromFahrenheit } from '~/server/utils/unitConverter';
import type { SettingsTemperatureUnit } from '~/types/interfaces/Settings';

/**
 * Temperature input with per-instance unit selection (°F or °C).
 *
 * v-model is ALWAYS canonical (Fahrenheit). User enters in either unit.
 * Defaults the toggle to the global pref from useSettingsStore.units.temperature.
 *
 *   <FormTemperatureInput v-model="ferment.temperature" />
 */

const props = withDefaults(defineProps<{
	modelValue: number | null | undefined;
	defaultUnit?: SettingsTemperatureUnit;
	placeholder?: string;
	min?: number;
	max?: number;
	step?: number | string;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	disabled?: boolean;
}>(), {
	step: 0.1,
	size: 'md',
});

const emit = defineEmits<{
	'update:modelValue': [value: number | null];
}>();

const settings = useSettingsStore();

const localUnit = ref<SettingsTemperatureUnit>(
	props.defaultUnit ?? (settings.units.temperature as SettingsTemperatureUnit) ?? 'fahrenheit',
);

const displayValue = computed<number | null>(() => {
	if (props.modelValue == null || !Number.isFinite(props.modelValue)) return null;
	const v = fromFahrenheit(props.modelValue, localUnit.value);
	return Number(v.toFixed(2));
});

function onInput(raw: number | string | null) {
	if (raw === null || raw === '' || raw === undefined) {
		emit('update:modelValue', null);
		return;
	}
	const n = Number(raw);
	if (!Number.isFinite(n)) {
		emit('update:modelValue', null);
		return;
	}
	emit('update:modelValue', toFahrenheit(n, localUnit.value));
}

function toggleUnit() {
	localUnit.value = localUnit.value === 'fahrenheit' ? 'celsius' : 'fahrenheit';
}
</script>

<template>
	<UFieldGroup class="w-full">
		<UInput
			:model-value="displayValue"
			type="number"
			:placeholder="placeholder"
			:min="min"
			:max="max"
			:step="step"
			:size="size"
			:disabled="disabled"
			class="flex-1"
			@update:model-value="onInput($event as number | string | null)"
		/>
		<UButton
			color="neutral"
			variant="outline"
			:size="size === 'xl' ? 'lg' : size"
			:disabled="disabled"
			@click="toggleUnit"
		>
			{{ TEMPERATURE_LABEL[localUnit] }}
		</UButton>
	</UFieldGroup>
</template>

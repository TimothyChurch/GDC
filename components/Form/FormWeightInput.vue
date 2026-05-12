<script setup lang="ts">
import {
	WEIGHT_OPTIONS,
	WEIGHT_LABEL,
} from '~/composables/useDisplayUnits';
import type { SettingsWeightUnit } from '~/types/interfaces/Settings';

/**
 * Weight input with per-instance unit selection.
 *
 * v-model is ALWAYS canonical (pounds). User enters in lb / kg / oz / g.
 * Defaults the dropdown to the global pref from useSettingsStore.units.weight.
 *
 *   <FormWeightInput v-model="recipeIngredient.amount" />
 */

const props = withDefaults(defineProps<{
	modelValue: number | null | undefined;
	defaultUnit?: SettingsWeightUnit;
	placeholder?: string;
	min?: number;
	max?: number;
	step?: number | string;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	disabled?: boolean;
}>(), {
	step: 0.01,
	size: 'md',
});

const emit = defineEmits<{
	'update:modelValue': [value: number | null];
}>();

const settings = useSettingsStore();

const localUnit = ref<SettingsWeightUnit>(
	props.defaultUnit ?? (settings.units.weight as SettingsWeightUnit) ?? 'pound',
);

const POUND_TO_KG = 0.45359237;
const POUND_TO_OUNCE = 16;
const POUND_TO_GRAM = 453.59237;

function poundsTo(value: number, unit: SettingsWeightUnit): number {
	switch (unit) {
		case 'pound': return value;
		case 'kilogram': return value * POUND_TO_KG;
		case 'ounce': return value * POUND_TO_OUNCE;
		case 'gram': return value * POUND_TO_GRAM;
	}
}

function toPounds(value: number, unit: SettingsWeightUnit): number {
	switch (unit) {
		case 'pound': return value;
		case 'kilogram': return value / POUND_TO_KG;
		case 'ounce': return value / POUND_TO_OUNCE;
		case 'gram': return value / POUND_TO_GRAM;
	}
}

const displayValue = computed<number | null>(() => {
	if (props.modelValue == null || !Number.isFinite(props.modelValue)) return null;
	const v = poundsTo(props.modelValue, localUnit.value);
	return Number(v.toFixed(6));
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
	emit('update:modelValue', toPounds(n, localUnit.value));
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
		<USelect
			:model-value="localUnit"
			:items="WEIGHT_OPTIONS.map(o => ({ label: WEIGHT_LABEL[o.value], value: o.value }))"
			value-key="value"
			label-key="label"
			:size="size"
			:disabled="disabled"
			class="w-24"
			@update:model-value="(v: any) => localUnit = v as SettingsWeightUnit"
		/>
	</UFieldGroup>
</template>

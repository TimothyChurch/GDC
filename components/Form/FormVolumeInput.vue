<script setup lang="ts">
import {
	VOLUME_OPTIONS,
	VOLUME_LABEL,
} from '~/composables/useDisplayUnits';
import { toWineGallons, fromWineGallons } from '~/server/utils/unitConverter';
import type { SettingsVolumeUnit } from '~/types/interfaces/Settings';

/**
 * Volume input with per-instance unit selection.
 *
 * v-model is ALWAYS canonical (wine gallons). The user enters values in
 * whatever unit they pick from the inline dropdown — conversion happens
 * inside the component. Defaults the dropdown to the global preference
 * from useSettingsStore.units.volume, but each instance is independently
 * sticky once the user changes it.
 *
 *   <FormVolumeInput v-model="recipe.batchSize" />
 *
 * Use this whenever the underlying field stores volume in gallons. For
 * fields that already track their own unit (vessel.contents.{volume,
 * volumeUnit}), use a different pattern — that unit IS data, not display.
 */

const props = withDefaults(defineProps<{
	modelValue: number | null | undefined;
	defaultUnit?: SettingsVolumeUnit;
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

// Local sticky unit: defaults to per-instance prop, else global pref.
// User change persists for the lifetime of the input.
const localUnit = ref<SettingsVolumeUnit>(
	props.defaultUnit ?? (settings.units.volume as SettingsVolumeUnit) ?? 'gallon',
);

// Display value derived from canonical v-model and current local unit.
// We don't store this — we render it from the model on every read.
const displayValue = computed<number | null>(() => {
	if (props.modelValue == null || !Number.isFinite(props.modelValue)) return null;
	if (localUnit.value === 'gallon') return Number(props.modelValue);
	return Number(fromWineGallons(props.modelValue, localUnit.value).toFixed(6));
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
	const canonical = localUnit.value === 'gallon' ? n : toWineGallons(n, localUnit.value);
	emit('update:modelValue', canonical);
}

function onUnitChange(next: SettingsVolumeUnit) {
	// Switching units shouldn't change the underlying canonical value — only
	// the displayed number changes. v-model stays the same.
	localUnit.value = next;
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
			:items="VOLUME_OPTIONS.map(o => ({ label: VOLUME_LABEL[o.value], value: o.value }))"
			value-key="value"
			label-key="label"
			:size="size"
			:disabled="disabled"
			class="w-24"
			@update:model-value="(v: any) => onUnitChange(v as SettingsVolumeUnit)"
		/>
	</UFieldGroup>
</template>

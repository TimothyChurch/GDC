<script setup lang="ts">
import { STRENGTH_LABEL } from '~/composables/useDisplayUnits';
import { toAbvPercent, fromAbvPercent } from '~/server/utils/unitConverter';
import type { SettingsStrengthUnit } from '~/types/interfaces/Settings';

/**
 * Alcohol-strength input with per-instance unit selection (ABV % or proof).
 *
 * v-model is ALWAYS canonical (ABV percent, 0–100). User enters in either.
 * Defaults the toggle to the global pref from useSettingsStore.units.strength.
 *
 *   <FormStrengthInput v-model="bottle.abv" />
 */

const props = withDefaults(defineProps<{
	modelValue: number | null | undefined;
	defaultUnit?: SettingsStrengthUnit;
	placeholder?: string;
	min?: number;
	max?: number;
	step?: number | string;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	disabled?: boolean;
}>(), {
	step: 0.1,
	min: 0,
	max: 100,
	size: 'md',
});

const emit = defineEmits<{
	'update:modelValue': [value: number | null];
}>();

const settings = useSettingsStore();

const localUnit = ref<SettingsStrengthUnit>(
	props.defaultUnit ?? (settings.units.strength as SettingsStrengthUnit) ?? 'abv',
);

const effectiveMax = computed(() => {
	const m = props.max ?? 100;
	return localUnit.value === 'proof' ? m * 2 : m;
});

const displayValue = computed<number | null>(() => {
	if (props.modelValue == null || !Number.isFinite(props.modelValue)) return null;
	const v = fromAbvPercent(props.modelValue, localUnit.value);
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
	emit('update:modelValue', toAbvPercent(n, localUnit.value));
}

function toggleUnit() {
	localUnit.value = localUnit.value === 'abv' ? 'proof' : 'abv';
}
</script>

<template>
	<UFieldGroup class="w-full">
		<UInput
			:model-value="displayValue"
			type="number"
			:placeholder="placeholder"
			:min="min"
			:max="effectiveMax"
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
			{{ STRENGTH_LABEL[localUnit] }}
		</UButton>
	</UFieldGroup>
</template>

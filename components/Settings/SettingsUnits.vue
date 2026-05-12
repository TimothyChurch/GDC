<script setup lang="ts">
import {
	VOLUME_OPTIONS,
	STRENGTH_OPTIONS,
	TEMPERATURE_OPTIONS,
	WEIGHT_OPTIONS,
} from '~/composables/useDisplayUnits';
import type { SettingsUnits as SettingsUnitsType } from '~/types/interfaces/Settings';

const settingsStore = useSettingsStore();

const local = ref<SettingsUnitsType>({
	volume: 'gallon',
	strength: 'abv',
	temperature: 'fahrenheit',
	weight: 'pound',
});

function reset() {
	local.value = {
		volume: settingsStore.units.volume,
		strength: settingsStore.units.strength,
		temperature: settingsStore.units.temperature,
		weight: settingsStore.units.weight,
	};
}
reset();

watch(() => settingsStore.units, reset, { deep: true });

async function save() {
	await settingsStore.updateSettings({ units: { ...local.value } });
}
</script>

<template>
	<div class="bg-charcoal rounded-xl border border-brown/30 p-6 mt-4">
		<div class="mb-4">
			<h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond]">Display Units</h3>
			<p class="text-sm text-parchment/60 mt-1">
				Set the units shown throughout the admin UI. Storage stays canonical
				(gallon, ABV%, °F, lb) — switching only affects how values render.
			</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<UFormField label="Volume" help="Used for vessels, batches, transfers, bottles.">
				<USelect
					v-model="local.volume"
					:items="VOLUME_OPTIONS"
					value-key="value"
					label-key="label"
					class="w-full"
				/>
			</UFormField>

			<UFormField label="Alcohol strength" help="Distilling runs, batches, bottles.">
				<USelect
					v-model="local.strength"
					:items="STRENGTH_OPTIONS"
					value-key="value"
					label-key="label"
					class="w-full"
				/>
			</UFormField>

			<UFormField label="Temperature" help="Fermentation, gauging records.">
				<USelect
					v-model="local.temperature"
					:items="TEMPERATURE_OPTIONS"
					value-key="value"
					label-key="label"
					class="w-full"
				/>
			</UFormField>

			<UFormField label="Weight" help="Recipe ingredients, inventory.">
				<USelect
					v-model="local.weight"
					:items="WEIGHT_OPTIONS"
					value-key="value"
					label-key="label"
					class="w-full"
				/>
			</UFormField>
		</div>

		<div class="flex justify-end mt-6 pt-4 border-t border-brown/20">
			<div class="flex items-center gap-2">
				<UButton label="Reset" variant="ghost" color="neutral" @click="reset" />
				<UButton label="Save Units" icon="i-lucide-save" color="primary" :loading="settingsStore.saving" @click="save" />
			</div>
		</div>
	</div>
</template>

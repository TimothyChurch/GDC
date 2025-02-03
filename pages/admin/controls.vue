<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';

const { status, data, send, open, close } = useWebSocket(
	'ws://192.168.50.88:1880/ws'
);

const statusColor = computed(() => {
	switch (status.value) {
		case 'CONNECTING':
			return 'bg-yellow-600';
		case 'OPEN':
			return 'bg-green-600';
		case 'CLOSED':
			return 'bg-red-600';
		default:
			return 'bg-red-600';
	}
});

let inputData = reactive({
	kettle: { status: false, power: 0, reflux: 0, agitator: false },
	mashTun: { status: false, power: 0, agitator: false },
});

const sendMessage = () => {
	send(
		JSON.stringify({
			type: 'update',
			data: inputData,
		}),
		true
	);
};
watch(
	() => data,
	() => {
		inputData = { ...data.value };
	}
);

watch(
	() => [
		inputData.kettle.status,
		inputData.kettle.power,
		inputData.kettle.reflux,
		inputData.kettle.agitator,
		inputData.mashTun.status,
		inputData.mashTun.power,
		inputData.mashTun.agitator,
	],
	() => {
		console.log('testing');
		if (!inputData.kettle.status) {
			inputData.kettle.power = 0;
			inputData.kettle.reflux = 100;
			inputData.kettle.agitator = false;
		}
		if (!inputData.mashTun.status) {
			inputData.mashTun.power = 0;
			inputData.mashTun.agitator = false;
		}
		sendMessage();
	}
);
</script>

<template>
	<UContainer class="flex gap-3">
		<UIcon
			name="i-heroicons-cloud-20-solid"
			:class="statusColor"
			class="h-10 w-10" />
		<UCard>
			<template #header>Mash Tun</template>
			<div class="flex gap-3">
				<UFormGroup label="Power">
					<UButton
						@click="inputData.mashTun.status = !inputData.mashTun.status"
						:color="inputData.mashTun.status ? 'green' : 'red'"
						>{{ inputData.mashTun.status ? 'On' : 'Off' }}</UButton
					>
				</UFormGroup>
				<UFormGroup
					label="Power"
					help="0-100%">
					<UInput
						v-model="inputData.mashTun.power"
						type="number"
						:disabled="!inputData.mashTun.status"
						max="100"
						><template #trailing>%</template></UInput
					>
				</UFormGroup>
				<UFormGroup label="Agitator">
					<UButton
						@click="inputData.mashTun.agitator = !inputData.mashTun.agitator"
						:disabled="!inputData.mashTun.status"
						:color="inputData.mashTun.agitator ? 'green' : 'red'"
						>{{ inputData.mashTun.agitator ? 'On' : 'Off' }}</UButton
					>
				</UFormGroup>
			</div>
		</UCard>
		<UCard>
			<template #header>Kettle</template>
			<div class="flex gap-3">
				<UFormGroup label="kettle">
					<UButton
						@click="inputData.kettle.status = !inputData.kettle.status"
						:color="inputData.kettle.status ? 'green' : 'red'"
						>{{ inputData.kettle.status ? 'On' : 'Off' }}</UButton
					>
				</UFormGroup>
				<UFormGroup label="Power">
					<UInput
						v-model="inputData.kettle.power"
						type="number"
						:disabled="!inputData.kettle.status" />
				</UFormGroup>
				<UFormGroup label="Reflux">
					<UInput
						v-model="inputData.kettle.reflux"
						type="number"
						:disabled="!inputData.kettle.status" />
				</UFormGroup>

				<UFormGroup label="Agitator">
					<UButton
						@click="inputData.kettle.agitator = !inputData.kettle.agitator"
						:disabled="!inputData.kettle.status"
						:color="inputData.kettle.agitator ? 'green' : 'red'"
						>{{ inputData.kettle.agitator ? 'On' : 'Off' }}</UButton
					>
				</UFormGroup>
			</div>
		</UCard>
	</UContainer>
</template>

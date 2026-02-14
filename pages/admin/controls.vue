<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';

definePageMeta({ layout: 'admin' })

const runtimeConfig = useRuntimeConfig();
const { status, data, send, open, close } = useWebSocket(
	runtimeConfig.public.wsUrl as string
);

const statusLabel = computed(() => {
	switch (status.value) {
		case 'CONNECTING': return 'Connecting';
		case 'OPEN': return 'Connected';
		case 'CLOSED': return 'Disconnected';
		default: return 'Unknown';
	}
});

const statusClass = computed(() => {
	switch (status.value) {
		case 'CONNECTING': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25';
		case 'OPEN': return 'bg-green-500/15 text-green-400 border-green-500/25';
		case 'CLOSED': return 'bg-red-500/15 text-red-400 border-red-500/25';
		default: return 'bg-red-500/15 text-red-400 border-red-500/25';
	}
});

const statusDot = computed(() => {
	switch (status.value) {
		case 'CONNECTING': return 'bg-yellow-400';
		case 'OPEN': return 'bg-green-400';
		case 'CLOSED': return 'bg-red-400';
		default: return 'bg-red-400';
	}
});

let inputData = reactive({
	kettle: { status: false, power: 0, reflux: 0, agitator: false },
	mashTun: { status: false, power: 0, agitator: false },
});

// Equipment logging
const activityLog = ref<Array<{ equipment: string; action: string; value?: number; timestamp: string }>>([]);
const loadingLogs = ref(false);

const fetchLogs = async () => {
	loadingLogs.value = true;
	try {
		const response = await $fetch('/api/equipmentLog');
		activityLog.value = response as typeof activityLog.value;
	} catch {
		// Silently fail — logs are non-critical
	} finally {
		loadingLogs.value = false;
	}
};
fetchLogs();

const logAction = async (equipment: string, action: string, value?: number) => {
	try {
		const entry = await $fetch('/api/equipmentLog/create', {
			method: 'POST',
			body: { equipment, action, value, timestamp: new Date().toISOString() },
		});
		activityLog.value.unshift(entry as typeof activityLog.value[0]);
		if (activityLog.value.length > 20) activityLog.value.pop();
	} catch {
		// Silently fail
	}
};

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

// Watch individual controls for logging
watch(() => inputData.mashTun.status, (val) => {
	logAction('Mash Tun', val ? 'Turned ON' : 'Turned OFF');
});
watch(() => inputData.mashTun.power, (val) => {
	logAction('Mash Tun', 'Power changed', val);
});
watch(() => inputData.mashTun.agitator, (val) => {
	logAction('Mash Tun', val ? 'Agitator ON' : 'Agitator OFF');
});
watch(() => inputData.kettle.status, (val) => {
	logAction('Kettle/Still', val ? 'Turned ON' : 'Turned OFF');
});
watch(() => inputData.kettle.power, (val) => {
	logAction('Kettle/Still', 'Power changed', val);
});
watch(() => inputData.kettle.reflux, (val) => {
	logAction('Kettle/Still', 'Reflux changed', val);
});
watch(() => inputData.kettle.agitator, (val) => {
	logAction('Kettle/Still', val ? 'Agitator ON' : 'Agitator OFF');
});

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
	<div>
		<AdminPageHeader title="Equipment Controls" subtitle="Real-time equipment monitoring and control" icon="i-lucide-settings">
			<template #actions>
				<span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', statusClass]">
					<span :class="['w-2 h-2 rounded-full', statusDot]" />
					{{ statusLabel }}
				</span>
			</template>
		</AdminPageHeader>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<!-- Mash Tun -->
			<div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden">
				<div class="flex items-center justify-between px-5 py-4 border-b border-brown/20">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center">
							<UIcon name="i-lucide-flame" class="text-xl text-copper" />
						</div>
						<div>
							<h3 class="text-base font-semibold text-parchment font-[Cormorant_Garamond]">Mash Tun</h3>
							<p class="text-xs text-parchment/60">Heating and agitation control</p>
						</div>
					</div>
					<button
						class="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
						:class="inputData.mashTun.status
							? 'bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25'
							: 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25'"
						@click="inputData.mashTun.status = !inputData.mashTun.status"
					>
						{{ inputData.mashTun.status ? 'ON' : 'OFF' }}
					</button>
				</div>

				<div class="p-5 space-y-5">
					<!-- Power -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<label class="text-xs font-medium text-parchment/50">Power Level</label>
							<span class="text-sm font-semibold" :class="inputData.mashTun.status ? 'text-parchment' : 'text-parchment/50'">
								{{ inputData.mashTun.power }}%
							</span>
						</div>
						<div class="relative h-3 rounded-full bg-brown/20 overflow-hidden">
							<div
								class="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
								:class="inputData.mashTun.status ? 'bg-gradient-to-r from-copper/60 to-copper' : 'bg-parchment/10'"
								:style="{ width: `${inputData.mashTun.power}%` }"
							/>
						</div>
						<input
							v-model.number="inputData.mashTun.power"
							type="range"
							min="0"
							max="100"
							:disabled="!inputData.mashTun.status"
							class="w-full mt-2 accent-copper"
							aria-label="Mash tun power level"
						/>
					</div>

					<!-- Agitator -->
					<div class="flex items-center justify-between">
						<div>
							<label class="text-sm font-medium text-parchment/70">Agitator</label>
							<p class="text-xs text-parchment/50">Mixing paddle motor</p>
						</div>
						<button
							class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
							:class="inputData.mashTun.agitator
								? 'bg-green-500/15 text-green-400 border border-green-500/25'
								: 'bg-brown/20 text-parchment/60 border border-brown/30'"
							:disabled="!inputData.mashTun.status"
							@click="inputData.mashTun.agitator = !inputData.mashTun.agitator"
						>
							{{ inputData.mashTun.agitator ? 'Running' : 'Stopped' }}
						</button>
					</div>
				</div>
			</div>

			<!-- Kettle / Still -->
			<div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden">
				<div class="flex items-center justify-between px-5 py-4 border-b border-brown/20">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center">
							<UIcon name="i-lucide-flask-conical" class="text-xl text-gold" />
						</div>
						<div>
							<h3 class="text-base font-semibold text-parchment font-[Cormorant_Garamond]">Kettle / Still</h3>
							<p class="text-xs text-parchment/60">Distillation heating and reflux</p>
						</div>
					</div>
					<button
						class="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
						:class="inputData.kettle.status
							? 'bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25'
							: 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25'"
						@click="inputData.kettle.status = !inputData.kettle.status"
					>
						{{ inputData.kettle.status ? 'ON' : 'OFF' }}
					</button>
				</div>

				<div class="p-5 space-y-5">
					<!-- Power -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<label class="text-xs font-medium text-parchment/50">Power Level</label>
							<span class="text-sm font-semibold" :class="inputData.kettle.status ? 'text-parchment' : 'text-parchment/50'">
								{{ inputData.kettle.power }}%
							</span>
						</div>
						<div class="relative h-3 rounded-full bg-brown/20 overflow-hidden">
							<div
								class="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
								:class="inputData.kettle.status ? 'bg-gradient-to-r from-gold/60 to-gold' : 'bg-parchment/10'"
								:style="{ width: `${inputData.kettle.power}%` }"
							/>
						</div>
						<input
							v-model.number="inputData.kettle.power"
							type="range"
							min="0"
							max="100"
							:disabled="!inputData.kettle.status"
							class="w-full mt-2 accent-gold"
							aria-label="Kettle power level"
						/>
					</div>

					<!-- Reflux -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<label class="text-xs font-medium text-parchment/50">Reflux</label>
							<span class="text-sm font-semibold" :class="inputData.kettle.status ? 'text-parchment' : 'text-parchment/50'">
								{{ inputData.kettle.reflux }}%
							</span>
						</div>
						<div class="relative h-3 rounded-full bg-brown/20 overflow-hidden">
							<div
								class="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
								:class="inputData.kettle.status ? 'bg-gradient-to-r from-blue-500/60 to-blue-400' : 'bg-parchment/10'"
								:style="{ width: `${inputData.kettle.reflux}%` }"
							/>
						</div>
						<input
							v-model.number="inputData.kettle.reflux"
							type="range"
							min="0"
							max="100"
							:disabled="!inputData.kettle.status"
							class="w-full mt-2 accent-blue-400"
							aria-label="Kettle reflux level"
						/>
					</div>

					<!-- Agitator -->
					<div class="flex items-center justify-between">
						<div>
							<label class="text-sm font-medium text-parchment/70">Agitator</label>
							<p class="text-xs text-parchment/50">Mixing paddle motor</p>
						</div>
						<button
							class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
							:class="inputData.kettle.agitator
								? 'bg-green-500/15 text-green-400 border border-green-500/25'
								: 'bg-brown/20 text-parchment/60 border border-brown/30'"
							:disabled="!inputData.kettle.status"
							@click="inputData.kettle.agitator = !inputData.kettle.agitator"
						>
							{{ inputData.kettle.agitator ? 'Running' : 'Stopped' }}
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="mt-6 bg-charcoal rounded-xl border border-brown/30 overflow-hidden">
			<div class="flex items-center justify-between px-5 py-4 border-b border-brown/20">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center">
						<UIcon name="i-lucide-activity" class="text-xl text-parchment/60" />
					</div>
					<div>
						<h3 class="text-base font-semibold text-parchment font-[Cormorant_Garamond]">Recent Activity</h3>
						<p class="text-xs text-parchment/60">Last 20 equipment actions</p>
					</div>
				</div>
			</div>

			<div v-if="loadingLogs" class="p-5 text-center">
				<UIcon name="i-lucide-loader-2" class="text-lg text-parchment/60 animate-spin" />
			</div>
			<div v-else-if="activityLog.length > 0" class="divide-y divide-brown/20 max-h-64 overflow-y-auto">
				<div
					v-for="(log, i) in activityLog.slice(0, 20)"
					:key="i"
					class="flex items-center justify-between px-5 py-2.5"
				>
					<div class="flex items-center gap-3">
						<span class="text-xs text-parchment/60 w-20 shrink-0">
							{{ new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
						</span>
						<span class="text-sm text-parchment/70">{{ log.equipment }}</span>
						<span class="text-sm text-parchment">{{ log.action }}</span>
					</div>
					<span v-if="log.value !== undefined" class="text-xs text-parchment/60">{{ log.value }}%</span>
				</div>
			</div>
			<div v-else class="p-5 text-center">
				<p class="text-sm text-parchment/50">No activity recorded</p>
			</div>
		</div>
	</div>
</template>

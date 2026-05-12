import type { EquipmentLog } from '~/types';

const ACTIVITY_FEED_LIMIT = 20;

/**
 * State + endpoints for the equipment activity feed shown on
 * `pages/admin/controls.vue`. Pages own the *what to log when* logic
 * (i.e. their own watchers); this composable owns the feed + I/O.
 */
export function useEquipmentLogging() {
	const activityLog = ref<EquipmentLog[]>([]);
	const loading = ref(false);

	async function fetchLogs(): Promise<void> {
		loading.value = true;
		try {
			activityLog.value = await $fetch<EquipmentLog[]>('/api/equipmentLog');
		} catch (error) {
			console.error('[useEquipmentLogging.fetchLogs]', error);
		} finally {
			loading.value = false;
		}
	}

	async function logAction(
		equipment: string,
		action: string,
		value?: number,
	): Promise<void> {
		try {
			const entry = await $fetch<EquipmentLog>('/api/equipmentLog/create', {
				method: 'POST',
				body: { equipment, action, value, timestamp: new Date().toISOString() },
			});
			activityLog.value.unshift(entry);
			if (activityLog.value.length > ACTIVITY_FEED_LIMIT) activityLog.value.pop();
		} catch (error) {
			console.error('[useEquipmentLogging.logAction]', error);
		}
	}

	return { activityLog, loading, fetchLogs, logAction };
}

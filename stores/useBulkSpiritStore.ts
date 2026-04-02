import type { BulkSpirit, BulkSpiritDeposit, BulkSpiritWithdrawal } from '~/types';
import { calculateProofGallons } from '~/utils/proofGallons';

export const useBulkSpiritStore = defineStore('bulkSpirits', () => {
	const toast = useToast();

	const crud = useCrudStore<BulkSpirit>({
		name: 'Bulk Spirit',
		apiPath: '/api/bulkSpirit',
		defaultItem: (): BulkSpirit => ({
			_id: '',
			name: '',
			spiritClass: '',
			vessel: undefined,
			volume: 0,
			volumeUnit: 'gallon',
			abv: 0,
			proofGallons: 0,
			costPerProofGallon: 0,
			totalValue: 0,
			deposits: [],
			withdrawals: [],
			status: 'active',
			notes: '',
		}),
	});

	// --- Computed filters ---
	const activeBulkSpirits = computed(() =>
		crud.items.value.filter((bs) => bs.status === 'active'),
	);

	const depletedBulkSpirits = computed(() =>
		crud.items.value.filter((bs) => bs.status === 'depleted'),
	);

	/**
	 * Deposit spirit from a completed batch into a bulk spirit entry.
	 * Recalculates weighted-average cost per proof gallon.
	 */
	const deposit = async (
		bulkSpiritId: string,
		params: {
			batchId: string;
			volume: number;
			volumeUnit: string;
			abv: number;
			value: number;
		},
	): Promise<void> => {
		const target = crud.items.value.find((bs) => bs._id === bulkSpiritId);
		if (!target) return;

		const depositPG = calculateProofGallons(params.volume, params.volumeUnit, params.abv);
		const depositCostPerPG = depositPG > 0 ? params.value / depositPG : 0;

		const depositEntry: BulkSpiritDeposit = {
			batch: params.batchId,
			date: new Date(),
			volume: params.volume,
			volumeUnit: params.volumeUnit,
			abv: params.abv,
			proofGallons: depositPG,
			value: params.value,
			costPerProofGallon: depositCostPerPG,
		};

		// Weighted average cost per proof gallon
		const existingPG = target.proofGallons || 0;
		const existingValue = target.totalValue || 0;
		const newTotalPG = existingPG + depositPG;
		const newTotalValue = existingValue + params.value;
		const newCostPerPG = newTotalPG > 0 ? newTotalValue / newTotalPG : 0;

		// Weighted average ABV
		const existingVolume = target.volume || 0;
		const newTotalVolume = existingVolume + params.volume;
		const newAbv = newTotalVolume > 0
			? (existingVolume * (target.abv || 0) + params.volume * params.abv) / newTotalVolume
			: 0;

		target.deposits = [...(target.deposits || []), depositEntry];
		target.volume = newTotalVolume;
		target.abv = Math.round(newAbv * 100) / 100;
		target.proofGallons = Math.round(newTotalPG * 10000) / 10000;
		target.costPerProofGallon = Math.round(newCostPerPG * 100) / 100;
		target.totalValue = Math.round(newTotalValue * 100) / 100;
		target.status = 'active';

		crud.item.value = target;
		await crud.saveItem();

		toast.add({
			title: 'Deposited to bulk spirit',
			description: `${params.volume} ${params.volumeUnit} at ${params.abv}% ABV (${depositPG.toFixed(2)} PG)`,
			color: 'success',
			icon: 'i-lucide-archive',
		});
	};

	/**
	 * Withdraw spirit from bulk storage for use in a downstream batch.
	 * Uses current cost per proof gallon at time of withdrawal.
	 */
	const withdraw = async (
		bulkSpiritId: string,
		params: {
			batchId: string;
			volume: number;
			volumeUnit: string;
		},
	): Promise<{ value: number; proofGallons: number; abv: number }> => {
		const target = crud.items.value.find((bs) => bs._id === bulkSpiritId);
		if (!target) throw new Error('Bulk spirit not found');

		if (params.volume > target.volume) {
			throw new Error(`Insufficient volume: requested ${params.volume}, available ${target.volume}`);
		}

		const withdrawAbv = target.abv;
		const withdrawPG = calculateProofGallons(params.volume, params.volumeUnit, withdrawAbv);
		const withdrawValue = withdrawPG * target.costPerProofGallon;

		const withdrawalEntry: BulkSpiritWithdrawal = {
			batch: params.batchId,
			date: new Date(),
			volume: params.volume,
			volumeUnit: params.volumeUnit,
			abv: withdrawAbv,
			proofGallons: withdrawPG,
			value: Math.round(withdrawValue * 100) / 100,
			costPerProofGallon: target.costPerProofGallon,
		};

		target.withdrawals = [...(target.withdrawals || []), withdrawalEntry];
		target.volume = Math.max(0, target.volume - params.volume);
		target.proofGallons = Math.max(0, target.proofGallons - withdrawPG);
		target.totalValue = Math.max(0, target.totalValue - withdrawValue);

		if (target.volume < 0.001) {
			target.status = 'depleted';
			target.volume = 0;
			target.proofGallons = 0;
			target.totalValue = 0;
		}

		crud.item.value = target;
		await crud.saveItem();

		toast.add({
			title: 'Withdrawn from bulk spirit',
			description: `${params.volume} ${params.volumeUnit} ($${withdrawValue.toFixed(2)})`,
			color: 'success',
			icon: 'i-lucide-arrow-right-from-line',
		});

		return {
			value: Math.round(withdrawValue * 100) / 100,
			proofGallons: withdrawPG,
			abv: withdrawAbv,
		};
	};

	return {
		...crud,
		bulkSpirits: crud.items,
		bulkSpirit: crud.item,
		getBulkSpirits: crud.getAll,
		deleteBulkSpirit: crud.deleteItem,
		resetBulkSpirit: crud.resetItem,
		setBulkSpirit: crud.setItem,
		getBulkSpiritById: crud.getById,
		activeBulkSpirits,
		depletedBulkSpirits,
		deposit,
		withdraw,
	};
});

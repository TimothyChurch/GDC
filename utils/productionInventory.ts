export interface ProductionInventoryShape {
	quantity: number;
	bottle?: string;
	bottling?: {
		glassware?: string;
		cap?: string;
		label?: string;
	};
}

export interface InventoryDelta {
	itemId: string;
	/** `bottle` (produced) or `material` (consumed). */
	kind: 'bottle' | 'material';
	/** Signed change. Positive = stock increases. */
	delta: number;
}

const MATERIAL_KEYS = ['glassware', 'cap', 'label'] as const;

/**
 * Compute the inventory deltas needed to transform inventory from "old
 * production was applied" to "new production applies." Pure: reads no state.
 *
 * Bottle (produced): each unit produced adds 1 to the bottle's inventory.
 * Materials (glassware/cap/label, consumed): each unit produced removes 1.
 *
 * If a slot changed (e.g. different cap), the old slot's effect is reversed
 * and the new slot's effect applied. If unchanged, the net delta is applied
 * to the same item. Zero-delta entries are dropped.
 */
export function computeProductionInventoryDeltas(
	oldProd: ProductionInventoryShape,
	newProd: ProductionInventoryShape,
): InventoryDelta[] {
	const deltas: InventoryDelta[] = [];
	const oldQty = oldProd.quantity || 0;
	const newQty = newProd.quantity || 0;

	// Bottle inventory: bottle was/is produced, so deltas are positive.
	if (oldProd.bottle && oldProd.bottle === newProd.bottle) {
		const net = newQty - oldQty;
		if (net !== 0) {
			deltas.push({ itemId: oldProd.bottle, kind: 'bottle', delta: net });
		}
	} else {
		if (oldProd.bottle && oldQty !== 0) {
			deltas.push({ itemId: oldProd.bottle, kind: 'bottle', delta: -oldQty });
		}
		if (newProd.bottle && newQty !== 0) {
			deltas.push({ itemId: newProd.bottle, kind: 'bottle', delta: newQty });
		}
	}

	// Bottling materials: each consumed at -1 per bottle.
	for (const key of MATERIAL_KEYS) {
		const oldId = oldProd.bottling?.[key];
		const newId = newProd.bottling?.[key];
		if (oldId && oldId === newId) {
			const net = oldQty - newQty;
			if (net !== 0) {
				deltas.push({ itemId: oldId, kind: 'material', delta: net });
			}
		} else {
			if (oldId && oldQty !== 0) {
				deltas.push({ itemId: oldId, kind: 'material', delta: oldQty });
			}
			if (newId && newQty !== 0) {
				deltas.push({ itemId: newId, kind: 'material', delta: -newQty });
			}
		}
	}

	return deltas;
}

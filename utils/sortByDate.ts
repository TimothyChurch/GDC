type WithDate = { date?: string | Date | null };

/**
 * Return a new array sorted by `.date` field, newest first.
 * Non-mutating; safe to call on `.value` arrays from Pinia stores.
 */
export function sortByDateDesc<T extends WithDate>(items: readonly T[]): T[] {
	return [...items].sort(
		(a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
	);
}

/**
 * Return a new array sorted by `.date` field, oldest first.
 */
export function sortByDateAsc<T extends WithDate>(items: readonly T[]): T[] {
	return [...items].sort(
		(a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime(),
	);
}

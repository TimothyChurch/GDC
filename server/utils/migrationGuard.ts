/**
 * One-time migration guard.
 *
 * Each migration registers a stable name. On invocation, this util atomically
 * "claims" the migration by appending to `Settings.migrationsRun` only if not
 * already present (single-document `$addToSet` with a `$ne` filter — atomic).
 * If already claimed, returns `alreadyApplied: true` without re-running.
 *
 * The migration body is idempotent in this codebase already, but the guard
 * provides:
 *   - O(1) skip on rerun (no need to walk every doc)
 *   - Audit trail in Settings (which migrations, when applied via timestamps)
 *   - Defense against accidental concurrent triggers
 *
 * Tech-debt #54.
 */

export type RunOnceResult<T> =
	| { alreadyApplied: true; appliedAt: Date | null }
	| { alreadyApplied: false; result: T };

export async function runOnceMigration<T>(
	name: string,
	body: () => Promise<T>,
): Promise<RunOnceResult<T>> {
	// Atomic claim: only matches if `name` is not yet in the array.
	const claim = await Settings.updateOne(
		{ migrationsRun: { $ne: name } },
		{ $addToSet: { migrationsRun: name } },
		{ upsert: true },
	);

	// matchedCount === 0 + upsertedCount === 0 means a Settings doc existed AND
	// it already contained the name → already applied. (upsertedCount === 1
	// means we just created the singleton; in that case the claim succeeded.)
	const claimed = claim.upsertedCount > 0 || claim.matchedCount > 0;
	if (!claimed) {
		const settings = await Settings.findOne({}).select('updatedAt').lean() as
			| { updatedAt?: Date }
			| null;
		return {
			alreadyApplied: true,
			appliedAt: settings?.updatedAt ?? null,
		};
	}

	try {
		const result = await body();
		return { alreadyApplied: false, result };
	} catch (error) {
		// Release the claim so the migration can be retried after the cause is fixed.
		await Settings.updateOne({}, { $pull: { migrationsRun: name } });
		throw error;
	}
}

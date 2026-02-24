import type { DistillingStage, DistillingRun } from '~/types'

/**
 * Normalize distilling stage data into the multi-run format.
 * Handles backwards compatibility with legacy single-run documents.
 *
 * - If `distilling.runs` exists and has entries, return it (new format)
 * - If legacy flat fields exist (runType, collected, chargeVolume), wrap into a single-element runs array
 * - Otherwise return []
 */
export function normalizeDistillingRuns(distilling?: DistillingStage): DistillingRun[] {
  if (!distilling) return []

  // New format: runs array already present
  if (distilling.runs && distilling.runs.length > 0) {
    return distilling.runs
  }

  // Legacy format: flat fields on the stage object
  const hasLegacyData = distilling.runType || distilling.chargeVolume || distilling.collected

  if (!hasLegacyData) return []

  // Convert legacy additions to new format
  const additions: DistillingRun['additions'] = []
  if (distilling.additions?.tails?.volume) {
    additions.push({
      label: 'Tails',
      volume: distilling.additions.tails.volume,
      volumeUnit: distilling.additions.tails.volumeUnit || 'gallon',
      abv: distilling.additions.tails.abv,
    })
  }
  if (distilling.additions?.feints?.volume) {
    additions.push({
      label: 'Feints',
      volume: distilling.additions.feints.volume,
      volumeUnit: distilling.additions.feints.volumeUnit || 'gallon',
      abv: distilling.additions.feints.abv,
    })
  }

  const legacyRun: DistillingRun = {
    runNumber: distilling.runNumber || 1,
    runType: distilling.runType === 'single' ? 'spirit' : (distilling.runType as 'stripping' | 'spirit' | undefined),
    date: distilling.startedAt,
    chargeVolume: distilling.chargeVolume,
    chargeVolumeUnit: distilling.chargeVolumeUnit,
    chargeAbv: distilling.chargeAbv,
    additions: additions.length > 0 ? additions : undefined,
    collected: distilling.collected ? {
      foreshots: distilling.collected.foreshots,
      heads: distilling.collected.heads,
      lateHeads: distilling.collected.lateHeads,
      hearts: distilling.collected.hearts,
      tails: distilling.collected.tails,
    } : undefined,
    total: distilling.collected?.total,
  }

  return [legacyRun]
}

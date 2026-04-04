function normalizeDistillingRuns(distilling) {
  if (!distilling) return [];
  if (distilling.runs && distilling.runs.length > 0) {
    return distilling.runs;
  }
  const hasLegacyData = distilling.runType || distilling.chargeVolume || distilling.collected;
  if (!hasLegacyData) return [];
  const additions = [];
  if (distilling.additions?.tails?.volume) {
    additions.push({
      label: "Tails",
      volume: distilling.additions.tails.volume,
      volumeUnit: distilling.additions.tails.volumeUnit || "gallon",
      abv: distilling.additions.tails.abv
    });
  }
  if (distilling.additions?.feints?.volume) {
    additions.push({
      label: "Feints",
      volume: distilling.additions.feints.volume,
      volumeUnit: distilling.additions.feints.volumeUnit || "gallon",
      abv: distilling.additions.feints.abv
    });
  }
  const legacyRun = {
    runNumber: distilling.runNumber || 1,
    runType: distilling.runType === "single" ? "spirit" : distilling.runType,
    date: distilling.startedAt,
    chargeVolume: distilling.chargeVolume,
    chargeVolumeUnit: distilling.chargeVolumeUnit,
    chargeAbv: distilling.chargeAbv,
    additions: additions.length > 0 ? additions : void 0,
    collected: distilling.collected ? {
      foreshots: distilling.collected.foreshots,
      heads: distilling.collected.heads,
      lateHeads: distilling.collected.lateHeads,
      hearts: distilling.collected.hearts,
      tails: distilling.collected.tails
    } : void 0,
    total: distilling.collected?.total
  };
  return [legacyRun];
}

export { normalizeDistillingRuns as n };
//# sourceMappingURL=distillingMigration-D0KFnhrX.mjs.map

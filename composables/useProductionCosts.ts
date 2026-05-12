import { calculateProofGallons } from '~/utils/proofGallons'
import { computeFederalExciseTax } from '~/utils/federalExciseTax'
import { computeTabcTaxDue } from '~/utils/tabcCalculations'

/** Convert bottle volume to wine gallons */
export function bottleToWineGallons(bottle: { volume?: number; volumeUnit?: string }): number {
  const vol = bottle.volume || 750
  const unit = (bottle.volumeUnit || 'mL').toLowerCase()
  if (unit === 'ml' || unit.includes('milli')) return vol * 0.000264172
  if (unit === 'l' || unit.includes('liter')) return vol * 0.264172
  if (unit.includes('oz')) return vol * 0.0078125
  if (unit.includes('gal')) return vol
  return vol * 0.000264172 // default: assume mL
}

interface ProductionCostInput {
  localData: Ref<any>
  vesselStore: ReturnType<typeof useVesselStore>
  bottleStore: ReturnType<typeof useBottleStore>
  batchStore: ReturnType<typeof useBatchStore>
  recipeStore: ReturnType<typeof useRecipeStore>
  linkedBatchId?: Ref<string>
}

export function useProductionCosts({ localData, vesselStore, bottleStore, batchStore, recipeStore, linkedBatchId }: ProductionCostInput) {
  /** Linked batch for cost fallback (when vessel contents don't carry cost data) */
  const linkedBatch = computed(() => {
    const id = linkedBatchId?.value
    if (!id) return null
    return batchStore.getBatchById(id) || null
  })

  /** Batch cost: sum of content values from selected vessels, or fall back to batch recipeCost */
  const calculatedBatchCost = computed(() => {
    let total = 0
    if (localData.value.vessel?.length > 0) {
      localData.value.vessel.forEach((vid: any) => {
        const v = vesselStore.getVesselById(vid as unknown as string)
        v?.contents?.forEach(
          (c: { value?: number }) => (total += c.value || 0),
        )
      })
    }
    // Fall back to the linked batch's recipeCost if vessel contents had no value
    if (total === 0 && linkedBatch.value) {
      total = linkedBatch.value.recipeCost || linkedBatch.value.batchCost || 0
    }
    return total
  })

  /** Barrel cost: sum of barrel costs from selected vessels, or fall back to batch barrelCost */
  const calculatedBarrelCost = computed(() => {
    let total = 0
    if (localData.value.vessel?.length > 0) {
      localData.value.vessel.forEach((vid: any) => {
        const v = vesselStore.getVesselById(vid as unknown as string)
        total += v?.barrel?.cost || 0
      })
    }
    // Fall back to the linked batch's barrelCost when vessels aren't barrels
    if (total === 0 && linkedBatch.value) {
      total = linkedBatch.value.barrelCost || 0
    }
    return total
  })

  /** Bottling materials cost: (glass + cap + label) * quantity */
  const calculatedBottlingCost = computed(() => {
    const glassCost = localData.value.bottling?.glassware
      ? (latestPrice(localData.value.bottling.glassware as unknown as string) as number) || 0
      : 0
    const capCost = localData.value.bottling?.cap
      ? (latestPrice(localData.value.bottling.cap as unknown as string) as number) || 0
      : 0
    const labelCost = localData.value.bottling?.label
      ? (latestPrice(localData.value.bottling.label as unknown as string) as number) || 0
      : 0
    return (glassCost + capCost + labelCost) * (localData.value.quantity || 0)
  })

  /** TTB Federal Excise Tax: proof gallons x CBMA Tier 1 rate */
  const calculatedTtbTax = computed(() => {
    const bottle = localData.value.bottle
      ? bottleStore.getBottleById(localData.value.bottle)
      : null
    if (!bottle || !localData.value.quantity) return 0
    const wgPerBottle = bottleToWineGallons(bottle)
    const totalWG = wgPerBottle * localData.value.quantity
    const proofGallons = calculateProofGallons(totalWG, 'gallon', bottle.abv || 0)
    return +computeFederalExciseTax(proofGallons).toFixed(2)
  })

  /** TABC Texas Excise Tax: wine gallons x $2.40/gal */
  const calculatedTabcTax = computed(() => {
    const bottle = localData.value.bottle
      ? bottleStore.getBottleById(localData.value.bottle)
      : null
    if (!bottle || !localData.value.quantity) return 0
    const wgPerBottle = bottleToWineGallons(bottle)
    const totalWG = wgPerBottle * localData.value.quantity
    return +computeTabcTaxDue(totalWG).toFixed(2)
  })

  /** Total production cost: all cost categories summed */
  const totalProductionCost = computed(() => {
    return (
      calculatedBatchCost.value +
      calculatedBarrelCost.value +
      calculatedBottlingCost.value +
      (localData.value.costs?.labor || 0) +
      calculatedTtbTax.value +
      calculatedTabcTax.value +
      (localData.value.costs?.other || 0)
    )
  })

  /** Per-bottle cost */
  const perBottleCost = computed(() => {
    return localData.value.quantity > 0
      ? totalProductionCost.value / localData.value.quantity
      : 0
  })

  /** Cost breakdown line items for display */
  const costBreakdownLines = computed(() => [
    { label: 'Batch / Spirit', value: calculatedBatchCost.value, auto: true },
    { label: 'Barrel', value: calculatedBarrelCost.value, auto: true },
    { label: 'Bottling Materials', value: calculatedBottlingCost.value, auto: true },
    { label: 'Labor', value: localData.value.costs?.labor || 0, auto: false },
    { label: 'TTB Federal Excise Tax', value: calculatedTtbTax.value, auto: true },
    { label: 'TABC Texas Excise Tax', value: calculatedTabcTax.value, auto: true },
    { label: 'Other', value: localData.value.costs?.other || 0, auto: false },
  ])

  /** Vessel labels for select menus */
  const vesselLabels = computed(() => {
    const vessels = vesselStore.vessels.filter(
      (v) => v.type.toLowerCase() === 'barrel' || v.type.toLowerCase() === 'tank',
    )
    return vessels.map((vessel) => {
      if (!vessel.contents || vessel.contents.length === 0) {
        return { _id: vessel._id, name: vessel.name + ' - empty' }
      }
      const recipeNames = vessel.contents.map((content: { batch: string }) => {
        const batch = batchStore.getBatchById(content.batch)
        const recipe = recipeStore.getRecipeById(batch?.recipe?.toString() as string)
        return recipe?.name || 'empty'
      })
      return {
        _id: vessel._id,
        name: vessel.name + ' - ' + recipeNames.join(', '),
      }
    })
  })

  /** Selected vessel details for display */
  const selectedVesselDetails = computed(() => {
    if (!localData.value.vessel?.length)
      return [] as { name: string; contents: string[]; volume?: number; volumeUnit?: string }[]
    return localData.value.vessel.reduce(
      (acc: { name: string; contents: string[]; volume?: number; volumeUnit?: string }[], vid: any) => {
        const v = vesselStore.getVesselById(vid as unknown as string)
        if (!v) return acc
        const contentsNames =
          v.contents?.map((c) => {
            const batch = batchStore.getBatchById(c.batch)
            return batch?.recipe
              ? recipeStore.getRecipeById(batch.recipe)?.name || 'Unknown'
              : 'Unknown'
          }) || []
        acc.push({
          name: v.name,
          contents: contentsNames,
          volume: v.current?.volume,
          volumeUnit: v.current?.volumeUnit,
        })
        return acc
      },
      [],
    )
  })

  return {
    calculatedBatchCost,
    calculatedBarrelCost,
    calculatedBottlingCost,
    calculatedTtbTax,
    calculatedTabcTax,
    totalProductionCost,
    perBottleCost,
    costBreakdownLines,
    vesselLabels,
    selectedVesselDetails,
  }
}

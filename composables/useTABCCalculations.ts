import { calculateProofGallons, toGallons } from '~/utils/proofGallons'
import { normalizeDistillingRuns } from '~/utils/distillingMigration'
import { bottleToWineGallons } from '~/composables/useProductionCosts'

// Texas excise tax rate: $2.40 per wine gallon of spirits produced
const TABC_TAX_RATE = 2.40

export interface TABCProductionRow {
  type: string
  wineGallons: number
  proofGallons: number
  batches: number
}

export interface TABCDispositionRow {
  product: string
  spiritType: string
  bottles: number
  bottleSize: string
  wineGallons: number
  proofGallons: number
  abv: number
}

export interface TABCMaterialRow {
  name: string
  amount: number
  unit: string
}

export function useTABCCalculations(month: Ref<string> | ComputedRef<string>) {
  const batchStore = useBatchStore()
  const productionStore = useProductionStore()
  const bottleStore = useBottleStore()
  const recipeStore = useRecipeStore()
  const itemStore = useItemStore()
  const vesselStore = useVesselStore()

  // ─── Date helpers ─────────────────────────────────────────────────────────────

  const monthStart = computed(() => {
    const [y, m] = month.value.split('-').map(Number)
    return new Date(y, m - 1, 1)
  })
  const monthEnd = computed(() => {
    const [y, m] = month.value.split('-').map(Number)
    return new Date(y, m, 0, 23, 59, 59)
  })
  const monthLabel = computed(() =>
    monthStart.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  )

  // TABC report due date: 15th of following month
  const dueDate = computed(() => {
    const [y, m] = month.value.split('-').map(Number)
    const nextMonth = m === 12 ? 1 : m + 1
    const nextYear = m === 12 ? y + 1 : y
    return new Date(nextYear, nextMonth - 1, 15).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  })

  const isOverdue = computed(() => new Date() > new Date(monthEnd.value.getFullYear(), monthEnd.value.getMonth() + 1, 15))

  // ─── Section 1: Production ────────────────────────────────────────────────────

  const distilledBatches = computed(() =>
    batchStore.batches.filter(b => {
      const distDate = (b.stages as any)?.distilling?.startedAt
        ? new Date((b.stages as any).distilling.startedAt)
        : null
      if (!distDate) return false
      return distDate >= monthStart.value && distDate <= monthEnd.value
    })
  )

  const productionByType = computed((): TABCProductionRow[] => {
    const map = new Map<string, { wineGallons: number; proofGallons: number; batches: number }>()

    distilledBatches.value.forEach(batch => {
      const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null
      const spiritType = recipe?.class || recipe?.type || 'Unknown'
      const runs = normalizeDistillingRuns((batch.stages as any)?.distilling)

      let heartsVol = 0
      let heartsAbvWeighted = 0

      for (const run of runs) {
        if (run.runType === 'spirit' && run.collected?.hearts) {
          const h = run.collected.hearts
          const vol = toGallons(h.volume || 0, h.volumeUnit || 'gallon')
          heartsVol += vol
          heartsAbvWeighted += vol * (h.abv || 0)
        }
      }
      if (heartsVol === 0) return

      const avgAbv = heartsAbvWeighted / heartsVol
      const pg = calculateProofGallons(heartsVol, 'gallon', avgAbv)

      const existing = map.get(spiritType) || { wineGallons: 0, proofGallons: 0, batches: 0 }
      existing.wineGallons += heartsVol
      existing.proofGallons += pg
      existing.batches += 1
      map.set(spiritType, existing)
    })

    return Array.from(map.entries()).map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.wineGallons - a.wineGallons)
  })

  const totalProductionWG = computed(() =>
    productionByType.value.reduce((s, t) => s + t.wineGallons, 0)
  )
  const totalProductionPG = computed(() =>
    productionByType.value.reduce((s, t) => s + t.proofGallons, 0)
  )

  // Heads/late heads/tails (non-beverage spirits)
  const headsAndTails = computed(() => {
    let headsWG = 0, tailsWG = 0, headsAbvWt = 0, tailsAbvWt = 0

    distilledBatches.value.forEach(batch => {
      const runs = normalizeDistillingRuns((batch.stages as any)?.distilling)
      for (const run of runs) {
        if (run.runType !== 'spirit' || !run.collected) continue
        const heads = run.collected.heads
        const lateHeads = run.collected.lateHeads
        const tails = run.collected.tails
        if (heads) {
          const vol = toGallons(heads.volume || 0, heads.volumeUnit || 'gallon')
          headsWG += vol
          headsAbvWt += vol * (heads.abv || 0)
        }
        if (lateHeads) {
          const vol = toGallons(lateHeads.volume || 0, lateHeads.volumeUnit || 'gallon')
          headsWG += vol
          headsAbvWt += vol * (lateHeads.abv || 0)
        }
        if (tails) {
          const vol = toGallons(tails.volume || 0, tails.volumeUnit || 'gallon')
          tailsWG += vol
          tailsAbvWt += vol * (tails.abv || 0)
        }
      }
    })

    const headsAvgAbv = headsWG > 0 ? headsAbvWt / headsWG : 0
    const tailsAvgAbv = tailsWG > 0 ? tailsAbvWt / tailsWG : 0

    return {
      headsWG,
      headsPG: calculateProofGallons(headsWG, 'gallon', headsAvgAbv),
      tailsWG,
      tailsPG: calculateProofGallons(tailsWG, 'gallon', tailsAvgAbv),
    }
  })

  // ─── Section 2: Materials ─────────────────────────────────────────────────────

  const materialsUsed = computed((): TABCMaterialRow[] => {
    const map = new Map<string, { amount: number; unit: string }>()
    distilledBatches.value.forEach(batch => {
      const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null
      if (!recipe?.items?.length) return
      recipe.items.forEach(ing => {
        const item = itemStore.getItemById(ing.item)
        const name = item?.name || 'Unknown Material'
        const unit = ing.unit || 'units'
        const key = `${name}||${unit}`
        const existing = map.get(key) || { amount: 0, unit }
        existing.amount += ing.amount || 0
        map.set(key, existing)
      })
    })
    return Array.from(map.entries())
      .map(([key, data]) => ({ name: key.split('||')[0], amount: data.amount, unit: data.unit }))
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  // ─── Section 3: Disposition ───────────────────────────────────────────────────

  const monthlyProductions = computed(() =>
    productionStore.productions.filter(p => {
      const d = new Date(p.date)
      return d >= monthStart.value && d <= monthEnd.value
    })
  )

  const dispositionByProduct = computed((): TABCDispositionRow[] => {
    const map = new Map<string, TABCDispositionRow>()

    monthlyProductions.value.forEach(p => {
      const bottle = bottleStore.getBottleById(p.bottle)
      if (!bottle) return
      const abv = bottle.abv || 0
      const wgPerBottle = bottleToWineGallons(bottle)
      const totalWG = wgPerBottle * (p.quantity || 0)
      const key = bottle._id
      const existing = map.get(key) || {
        product: bottle.name,
        spiritType: bottle.class || bottle.type || 'Unknown',
        bottles: 0,
        bottleSize: `${bottle.volume || 750}${bottle.volumeUnit || 'mL'}`,
        wineGallons: 0,
        proofGallons: 0,
        abv,
      }
      existing.bottles += p.quantity || 0
      existing.wineGallons += totalWG
      existing.proofGallons += calculateProofGallons(totalWG, 'gallon', abv)
      map.set(key, existing)
    })

    return Array.from(map.values()).sort((a, b) => b.wineGallons - a.wineGallons)
  })

  const totalDispositionWG = computed(() =>
    dispositionByProduct.value.reduce((s, d) => s + d.wineGallons, 0)
  )
  const totalDispositionBottles = computed(() =>
    dispositionByProduct.value.reduce((s, d) => s + d.bottles, 0)
  )

  // ─── Section 4: Storage / Inventory ──────────────────────────────────────────

  const barreledThisMonth = computed(() =>
    batchStore.batches.filter(b => {
      const d = (b.stages as any)?.barrelAging?.entry?.date
        ? new Date((b.stages as any).barrelAging.entry.date)
        : null
      return d && d >= monthStart.value && d <= monthEnd.value
    })
  )
  const barreledWG = computed(() => {
    let wg = 0
    barreledThisMonth.value.forEach(b => {
      const entry = (b.stages as any)?.barrelAging?.entry
      if (entry) wg += toGallons(entry.volume || 0, entry.volumeUnit || 'gal')
    })
    return wg
  })

  const onHandBarrelWG = computed(() => {
    let wg = 0
    vesselStore.barrels.filter(b => b.contents?.length).forEach(barrel =>
      barrel.contents?.forEach(c => {
        wg += toGallons(c.volume || 0, c.volumeUnit || 'gal')
      })
    )
    return wg
  })

  // ─── Texas excise tax calculation ────────────────────────────────────────────
  const tabcTaxDue = computed(() => totalProductionWG.value * TABC_TAX_RATE)

  return {
    monthStart,
    monthEnd,
    monthLabel,
    dueDate,
    isOverdue,
    distilledBatches,
    productionByType,
    totalProductionWG,
    totalProductionPG,
    headsAndTails,
    materialsUsed,
    monthlyProductions,
    dispositionByProduct,
    totalDispositionWG,
    totalDispositionBottles,
    barreledThisMonth,
    barreledWG,
    onHandBarrelWG,
    tabcTaxDue,
    vesselStore,
  }
}

import type { Batch, Vessel } from '~/types'
import { convertUnitRatio } from '~/utils/conversions'

export interface VesselBoardEntry {
  vessel: Vessel
  primaryBatch: Batch | null
  stage: string | null
  stageColor: string
  recipeName: string | null
  fillPct: number
  fillVolume: number
  fillUnit: string
  capacity: number | null
  needsAttention: boolean
  attentionReason: string | null
}

export type VesselTypeFilter = 'all' | 'Mash Tun' | 'Fermenter' | 'Still' | 'Tank' | 'Barrel'

const TYPE_OPTIONS: VesselTypeFilter[] = ['all', 'Mash Tun', 'Fermenter', 'Still', 'Tank', 'Barrel']

const TYPE_ICONS: Record<string, string> = {
  'Mash Tun': 'i-lucide-flame',
  Fermenter: 'i-lucide-beaker',
  Still: 'i-lucide-flask-conical',
  Tank: 'i-lucide-cylinder',
  Barrel: 'i-lucide-cylinder',
}

export function vesselTypeIcon(type: string | undefined): string {
  return TYPE_ICONS[type || ''] || 'i-lucide-container'
}

export function useVesselBoard() {
  const vesselStore = useVesselStore()
  const batchStore = useBatchStore()
  const recipeStore = useRecipeStore()
  const { items: attentionItems } = useAttentionFeed()

  const stageFilter = useState<string>('vesselBoard:stageFilter', () => 'all')
  const typeFilter = useState<VesselTypeFilter>('vesselBoard:typeFilter', () => 'all')
  const attentionOnly = useState<boolean>('vesselBoard:attentionOnly', () => false)

  const attentionByBatchId = computed(() => {
    const map = new Map<string, string>()
    for (const item of attentionItems.value) {
      const m = item.id.match(/^(?:ferm-check|ferm-overdue|start)-(.+)$/)
      if (m && m[1]) map.set(m[1], item.title)
    }
    return map
  })

  function buildEntry(vessel: Vessel): VesselBoardEntry {
    const contents = vessel.contents || []
    const primary = contents.length > 0
      ? [...contents].sort((a, b) => (b.volume || 0) - (a.volume || 0))[0]
      : null

    const primaryBatch = primary?.batch
      ? batchStore.getBatchById(primary.batch as unknown as string) || null
      : null

    const stage = primaryBatch?.currentStage || null
    const stageColor = stage ? STAGE_DISPLAY[stage]?.color || 'neutral' : 'neutral'
    const recipeName = primaryBatch?.recipe
      ? recipeStore.getRecipeById(primaryBatch.recipe as unknown as string)?.name || null
      : null

    const displayUnit = vessel.stats?.volumeUnit || vessel.current?.volumeUnit || 'gal'
    const rawVolume = vessel.current?.volume || 0
    const fromUnit = vessel.current?.volumeUnit || displayUnit
    const fillVolume = rawVolume * convertUnitRatio(fromUnit, displayUnit)
    const capacity = vessel.stats?.volume || null
    const fillPct = capacity && fillVolume
      ? Math.min(100, (fillVolume / capacity) * 100)
      : 0

    const attentionReason = primaryBatch?._id
      ? attentionByBatchId.value.get(primaryBatch._id.toString()) || null
      : null

    return {
      vessel,
      primaryBatch,
      stage,
      stageColor,
      recipeName,
      fillPct,
      fillVolume,
      fillUnit: displayUnit,
      capacity,
      needsAttention: !!attentionReason,
      attentionReason,
    }
  }

  const entries = computed<VesselBoardEntry[]>(() =>
    vesselStore.vessels.map(buildEntry)
  )

  const stagesPresent = computed(() => {
    const set = new Set<string>()
    for (const e of entries.value) if (e.stage) set.add(e.stage)
    return Array.from(set)
  })

  const typesPresent = computed(() => {
    const set = new Set<string>()
    for (const e of entries.value) if (e.vessel.type) set.add(e.vessel.type)
    return TYPE_OPTIONS.filter((t) => t === 'all' || set.has(t))
  })

  const filtered = computed<VesselBoardEntry[]>(() =>
    entries.value.filter((e) => {
      if (typeFilter.value !== 'all' && e.vessel.type !== typeFilter.value) return false
      if (stageFilter.value !== 'all' && e.stage !== stageFilter.value) return false
      if (attentionOnly.value && !e.needsAttention) return false
      return true
    })
  )

  const grouped = computed(() => {
    const map = new Map<string, VesselBoardEntry[]>()
    for (const e of filtered.value) {
      const t = e.vessel.type || 'Other'
      const arr = map.get(t) || []
      arr.push(e)
      map.set(t, arr)
    }
    const order = ['Mash Tun', 'Fermenter', 'Still', 'Tank', 'Barrel', 'Other']
    return order
      .filter((t) => map.has(t))
      .map((t) => ({ type: t, icon: vesselTypeIcon(t), entries: map.get(t)! }))
  })

  const counts = computed(() => ({
    total: entries.value.length,
    filtered: filtered.value.length,
    inUse: entries.value.filter((e) => e.fillVolume > 0).length,
    needsAttention: entries.value.filter((e) => e.needsAttention).length,
  }))

  return {
    entries,
    filtered,
    grouped,
    stagesPresent,
    typesPresent,
    stageFilter,
    typeFilter,
    attentionOnly,
    counts,
  }
}

// Deterministic batch-based color coding for pipeline visualization.
// Each batch gets a consistent color derived from its _id, making it easy
// to visually track individual batches across different stages.

interface BatchColorEntry {
  border: string
  bg: string
  text: string
  dot: string
}

// 16 visually distinct colors — full Tailwind class strings for JIT safety
const BATCH_PALETTE: BatchColorEntry[] = [
  { border: 'border-l-rose-400',    bg: 'bg-rose-400',    text: 'text-rose-400',    dot: 'bg-rose-400' },
  { border: 'border-l-violet-400',  bg: 'bg-violet-400',  text: 'text-violet-400',  dot: 'bg-violet-400' },
  { border: 'border-l-teal-400',    bg: 'bg-teal-400',    text: 'text-teal-400',    dot: 'bg-teal-400' },
  { border: 'border-l-lime-400',    bg: 'bg-lime-400',    text: 'text-lime-400',    dot: 'bg-lime-400' },
  { border: 'border-l-fuchsia-400', bg: 'bg-fuchsia-400', text: 'text-fuchsia-400', dot: 'bg-fuchsia-400' },
  { border: 'border-l-sky-400',     bg: 'bg-sky-400',     text: 'text-sky-400',     dot: 'bg-sky-400' },
  { border: 'border-l-orange-400',  bg: 'bg-orange-400',  text: 'text-orange-400',  dot: 'bg-orange-400' },
  { border: 'border-l-indigo-400',  bg: 'bg-indigo-400',  text: 'text-indigo-400',  dot: 'bg-indigo-400' },
  { border: 'border-l-emerald-400', bg: 'bg-emerald-400', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  { border: 'border-l-red-400',     bg: 'bg-red-400',     text: 'text-red-400',     dot: 'bg-red-400' },
  { border: 'border-l-cyan-400',    bg: 'bg-cyan-400',    text: 'text-cyan-400',    dot: 'bg-cyan-400' },
  { border: 'border-l-amber-400',   bg: 'bg-amber-400',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  { border: 'border-l-blue-400',    bg: 'bg-blue-400',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  { border: 'border-l-pink-400',    bg: 'bg-pink-400',    text: 'text-pink-400',    dot: 'bg-pink-400' },
  { border: 'border-l-stone-400',   bg: 'bg-stone-400',   text: 'text-stone-400',   dot: 'bg-stone-400' },
  { border: 'border-l-yellow-400',  bg: 'bg-yellow-400',  text: 'text-yellow-400',  dot: 'bg-yellow-400' },
]

/** Deterministic hash of a string to an index in [0, max) */
function hashToIndex(str: string, max: number): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return ((hash % max) + max) % max
}

/** Get the full color entry for a batch by its _id */
export function getBatchColor(batchId: string): BatchColorEntry {
  return BATCH_PALETTE[hashToIndex(batchId, BATCH_PALETTE.length)]
}

/** Convenience: get just the border-l class for a batch */
export function getBatchBorderClass(batchId: string): string {
  return getBatchColor(batchId).border
}

/** Build legend data from a list of batches */
export function buildBatchLegend(
  batches: { _id: string; recipe: string }[],
  getRecipeName: (recipeId: string) => string,
): { batchId: string; name: string; color: BatchColorEntry }[] {
  const legend: { batchId: string; name: string; color: BatchColorEntry }[] = []
  for (const b of batches) {
    legend.push({
      batchId: b._id,
      name: getRecipeName(b.recipe),
      color: getBatchColor(b._id),
    })
  }
  return legend
}

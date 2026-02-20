<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const toast = useToast()
const bottleStore = useBottleStore()
const inventoryStore = useInventoryStore()

const bottles = ref<
  Array<{
    _id: string;
    bottle: string;
    bar: number;
    office: number;
    boxed: number;
  }>
>([])

watch(
  () => bottleStore.activeBottles,
  () => {
    bottles.value = bottleStore.activeBottles.map((bottle) => ({
      _id: bottle._id,
      bottle: bottle.name,
      bar: 0,
      office: 0,
      boxed: 0,
    }));
  },
  { immediate: true }
)

const search = ref('')
const saving = ref(false)

const filteredBottles = computed(() => {
  if (!search.value) return bottles.value
  return bottles.value.filter((bottle) =>
    bottle.bottle.toLowerCase().includes(search.value.toLowerCase())
  )
})

const getTotal = (bottle: { bar: number; office: number; boxed: number }) =>
  Number(bottle.bar) + Number(bottle.office) + Number(bottle.boxed) * 12

const getLastCount = (bottleId: string) => {
  const records = inventoryStore.inventories
    .filter((inv) => inv.item === bottleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return records[0] || null
}

const getDelta = (bottle: { _id: string; bar: number; office: number; boxed: number }) => {
  const lastCount = getLastCount(bottle._id)
  if (!lastCount) return null
  return getTotal(bottle) - lastCount.quantity
}

const printSheet = () => window.print()

const submitInventory = async () => {
  saving.value = true
  const date = new Date()
  try {
    for (const bottle of bottles.value) {
      const total = getTotal(bottle)
      inventoryStore.inventory = {
        _id: '',
        date,
        item: bottle._id,
        quantity: total,
      }
      await inventoryStore.updateInventory()
    }
    toast.add({ title: 'Inventory submitted', color: 'success', icon: 'i-lucide-check-circle' })
  } catch (error: any) {
    toast.add({ title: 'Failed to submit inventory', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Bottle Inventory" subtitle="Count and track bottle stock levels" icon="i-lucide-package-check" class="print:hidden">
      <template #actions>
        <UButton @click="printSheet" icon="i-lucide-printer" variant="outline" class="print:hidden">Print Sheet</UButton>
        <UButton @click="submitInventory" :loading="saving" icon="i-lucide-check" class="print:hidden">Submit Inventory</UButton>
      </template>
    </AdminPageHeader>

    <div class="mb-4 print:hidden">
      <UInput
        v-model="search"
        placeholder="Search bottles..."
        icon="i-lucide-search"
        class="max-w-xs"
      />
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block print:hidden">
      <div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-brown/30">
              <th class="text-left px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider">Bottle</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24">Bar</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24">Office</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-24">Boxed</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-20">Total</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-28">Last Count</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-20">Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="bottle in filteredBottles"
              :key="bottle._id"
              class="border-b border-brown/15 last:border-0"
            >
              <td class="px-4 py-2 text-sm font-medium text-parchment">{{ bottle.bottle }}</td>
              <td class="px-4 py-2"><UInput v-model="bottle.bar" type="number" min="0" class="text-center" /></td>
              <td class="px-4 py-2"><UInput v-model="bottle.office" type="number" min="0" class="text-center" /></td>
              <td class="px-4 py-2"><UInput v-model="bottle.boxed" type="number" min="0" class="text-center" /></td>
              <td class="px-4 py-2 text-center text-sm font-semibold text-parchment">{{ getTotal(bottle) }}</td>
              <td class="px-4 py-2 text-center text-xs text-parchment/50">
                <template v-if="getLastCount(bottle._id)">
                  {{ getLastCount(bottle._id)!.quantity }} <span class="text-parchment/50">({{ new Date(getLastCount(bottle._id)!.date).toLocaleDateString() }})</span>
                </template>
                <span v-else class="text-parchment/20">--</span>
              </td>
              <td class="px-4 py-2 text-center text-sm font-semibold">
                <template v-if="getDelta(bottle) !== null">
                  <span :class="getDelta(bottle)! >= 0 ? 'text-green-400' : 'text-red-400'">
                    {{ getDelta(bottle)! > 0 ? '+' : '' }}{{ getDelta(bottle) }}
                  </span>
                </template>
                <span v-else class="text-parchment/20">--</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Stacked Cards -->
    <div class="sm:hidden space-y-3 print:hidden">
      <div
        v-for="bottle in filteredBottles"
        :key="bottle._id"
        class="bg-charcoal rounded-xl border border-brown/30 p-4"
      >
        <div class="text-sm font-medium text-parchment mb-3">{{ bottle.bottle }}</div>
        <div class="grid grid-cols-3 gap-2 mb-3">
          <UFormField label="Bar">
            <UInput v-model="bottle.bar" type="number" min="0" />
          </UFormField>
          <UFormField label="Office">
            <UInput v-model="bottle.office" type="number" min="0" />
          </UFormField>
          <UFormField label="Boxed">
            <UInput v-model="bottle.boxed" type="number" min="0" />
          </UFormField>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-parchment/60">Total: <span class="font-semibold text-parchment">{{ getTotal(bottle) }}</span></span>
          <template v-if="getDelta(bottle) !== null">
            <span :class="getDelta(bottle)! >= 0 ? 'text-green-400' : 'text-red-400'">
              Delta: {{ getDelta(bottle)! > 0 ? '+' : '' }}{{ getDelta(bottle) }}
            </span>
          </template>
          <span v-else class="text-parchment/20">No previous count</span>
        </div>
      </div>
    </div>
    <!-- Print-Only Inventory Count Sheet -->
    <div id="inventory-sheet" class="hidden print:block">
      <div class="text-center mb-4">
        <h1 class="text-xl font-bold">Galveston Distilling Co</h1>
        <h2 class="text-lg">Inventory Count Sheet</h2>
        <p class="text-sm mt-1">Date: {{ new Date().toLocaleDateString() }}</p>
      </div>
      <div class="mb-6 text-sm">
        Counted by: ________________________________________
      </div>
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Bottle</th>
            <th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Bar</th>
            <th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Office</th>
            <th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Boxed</th>
            <th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bottle in bottles" :key="'print-' + bottle._id">
            <td class="border border-gray-400 px-3 py-3 text-sm">{{ bottle.bottle }}</td>
            <td class="border border-gray-400 px-3 py-3">&nbsp;</td>
            <td class="border border-gray-400 px-3 py-3">&nbsp;</td>
            <td class="border border-gray-400 px-3 py-3">&nbsp;</td>
            <td class="border border-gray-400 px-3 py-3">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
@media print {
  #inventory-sheet {
    color: black;
    background: white;
    page-break-inside: auto;
  }
  #inventory-sheet tr {
    page-break-inside: avoid;
  }
}
</style>

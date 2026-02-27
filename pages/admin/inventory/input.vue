<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const categories = useInventoryCategories()
const toast = useToast()
const itemStore = useItemStore()
const inventoryStore = useInventoryStore()

const search = ref('')
const saving = ref(false)
const activeTab = ref('bottling')

interface CountEntry {
  _id: string
  name: string
  unit: string
  quantity: number
  unitSize: number
  unitLabel: string
  unitInput: number
}

const countData = ref<Record<string, CountEntry[]>>({})

// Initialize count data per category
watch(
  [() => itemStore.items, categories],
  () => {
    for (const cat of categories.value) {
      const items = itemStore.getItemsByCategory(cat.category)
      countData.value[cat.key] = items.map((item) => ({
        _id: item._id,
        name: item.name,
        unit: item.inventoryUnit || '',
        quantity: 0,
        unitSize: item.unitSize || 0,
        unitLabel: item.unitLabel || '',
        unitInput: 0,
      }))
    }
  },
  { immediate: true }
)

function hasPackaging(entry: CountEntry) {
  return entry.unitSize > 0 && entry.unitLabel
}

function onUnitInputChange(entry: CountEntry) {
  if (hasPackaging(entry)) {
    entry.quantity = entry.unitInput * entry.unitSize
  }
}

function formatLastCount(entry: CountEntry, qty: number) {
  const base = `${qty} ${entry.unit}`
  if (hasPackaging(entry)) {
    const count = Math.round((qty / entry.unitSize) * 100) / 100
    const label = count === 1 ? entry.unitLabel : `${entry.unitLabel}s`
    return `${base} (${count} ${label})`
  }
  return base
}

function getLastCount(itemId: string) {
  const records = inventoryStore.inventories
    .filter((inv) => inv.item === itemId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return records[0] || null
}

function getDelta(entry: CountEntry) {
  const lastCount = getLastCount(entry._id)
  if (!lastCount) return null
  return Number(entry.quantity) - lastCount.quantity
}

function getFilteredEntries(key: string) {
  const entries = countData.value[key] || []
  if (!search.value) return entries
  const term = search.value.toLowerCase()
  return entries.filter((e) => e.name.toLowerCase().includes(term))
}

const tabs = computed(() =>
  categories.value.map((cat) => ({
    label: cat.label,
    value: cat.key,
    icon: cat.icon,
  }))
)

const submitInventory = async () => {
  saving.value = true
  const date = new Date()
  try {
    for (const key of Object.keys(countData.value)) {
      for (const entry of countData.value[key]) {
        inventoryStore.inventory = {
          _id: '' as any,
          date,
          item: entry._id,
          quantity: Number(entry.quantity),
        }
        await inventoryStore.updateInventory()
      }
    }
    toast.add({ title: 'Inventory submitted', color: 'success', icon: 'i-lucide-check-circle' })
  } catch (error: any) {
    toast.add({ title: 'Failed to submit inventory', description: error?.data?.message, color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}

const printSheet = () => {
  window.open('/admin/inventory/print', '_blank')
}
</script>

<template>
  <div>
    <AdminPageHeader
      title="Count Inventory"
      subtitle="Enter current stock levels for all raw materials"
      icon="i-lucide-clipboard-check"
    >
      <template #actions>
        <UButton @click="printSheet" icon="i-lucide-printer" variant="outline">Print Sheet</UButton>
        <UButton @click="submitInventory" :loading="saving" icon="i-lucide-check">Submit Inventory</UButton>
      </template>
    </AdminPageHeader>

    <div class="mb-4">
      <UInput
        v-model="search"
        placeholder="Search items..."
        icon="i-lucide-search"
        class="max-w-xs"
      />
    </div>

    <UTabs v-model="activeTab" :items="tabs">
      <template #content="{ item }">
        <!-- Desktop Table -->
        <div class="hidden sm:block mt-4">
          <div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-brown/30">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider">Item</th>
                  <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-28">Quantity</th>
                  <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-20">Unit</th>
                  <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-32">Last Count</th>
                  <th class="text-center px-4 py-3 text-xs font-semibold text-parchment/60 uppercase tracking-wider w-20">Delta</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in getFilteredEntries(item.value)"
                  :key="entry._id"
                  class="border-b border-brown/15 last:border-0"
                >
                  <td class="px-4 py-2 text-sm font-medium text-parchment">{{ entry.name }}</td>
                  <td class="px-4 py-2">
                    <template v-if="hasPackaging(entry)">
                      <UInput
                        v-model="entry.unitInput"
                        type="number"
                        min="0"
                        class="text-center"
                        @update:model-value="onUnitInputChange(entry)"
                      />
                      <div class="text-xs text-parchment/50 text-center mt-1">
                        = {{ entry.quantity }} {{ entry.unit }}
                      </div>
                    </template>
                    <UInput v-else v-model="entry.quantity" type="number" min="0" class="text-center" />
                  </td>
                  <td class="px-4 py-2 text-center text-sm text-parchment/60">
                    <template v-if="hasPackaging(entry)">
                      # of {{ entry.unitLabel }}s
                    </template>
                    <template v-else>{{ entry.unit }}</template>
                  </td>
                  <td class="px-4 py-2 text-center text-xs text-parchment/50">
                    <template v-if="getLastCount(entry._id)">
                      {{ formatLastCount(entry, getLastCount(entry._id)!.quantity) }}
                      <span class="text-parchment/50">({{ new Date(getLastCount(entry._id)!.date).toLocaleDateString() }})</span>
                    </template>
                    <span v-else class="text-parchment/20">--</span>
                  </td>
                  <td class="px-4 py-2 text-center text-sm font-semibold">
                    <template v-if="getDelta(entry) !== null">
                      <span :class="getDelta(entry)! >= 0 ? 'text-green-400' : 'text-red-400'">
                        {{ getDelta(entry)! > 0 ? '+' : '' }}{{ getDelta(entry) }}
                      </span>
                    </template>
                    <span v-else class="text-parchment/20">--</span>
                  </td>
                </tr>
                <tr v-if="getFilteredEntries(item.value).length === 0">
                  <td colspan="5" class="text-center py-6 text-parchment/50 text-sm">
                    No items in this category
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Stacked Cards -->
        <div class="sm:hidden space-y-3 mt-4">
          <div
            v-for="entry in getFilteredEntries(item.value)"
            :key="entry._id"
            class="bg-charcoal rounded-xl border border-brown/30 p-4"
          >
            <div class="text-sm font-medium text-parchment mb-3">{{ entry.name }}</div>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <template v-if="hasPackaging(entry)">
                <UFormField :label="`# of ${entry.unitLabel}s`">
                  <UInput v-model="entry.unitInput" type="number" min="0" @update:model-value="onUnitInputChange(entry)" />
                </UFormField>
                <div class="text-xs text-parchment/60 flex items-end pb-2">= {{ entry.quantity }} {{ entry.unit }}</div>
              </template>
              <template v-else>
                <UFormField label="Quantity">
                  <UInput v-model="entry.quantity" type="number" min="0" />
                </UFormField>
                <div class="text-xs text-parchment/60 flex items-end pb-2">{{ entry.unit }}</div>
              </template>
            </div>
            <div class="flex justify-between items-center text-xs">
              <template v-if="getLastCount(entry._id)">
                <span class="text-parchment/50">
                  Last: {{ formatLastCount(entry, getLastCount(entry._id)!.quantity) }} ({{ new Date(getLastCount(entry._id)!.date).toLocaleDateString() }})
                </span>
              </template>
              <span v-else class="text-parchment/20">No previous count</span>
              <template v-if="getDelta(entry) !== null">
                <span :class="getDelta(entry)! >= 0 ? 'text-green-400' : 'text-red-400'">
                  Delta: {{ getDelta(entry)! > 0 ? '+' : '' }}{{ getDelta(entry) }}
                </span>
              </template>
            </div>
          </div>
          <div
            v-if="getFilteredEntries(item.value).length === 0"
            class="text-center py-6 text-parchment/50 text-sm"
          >
            No items in this category
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

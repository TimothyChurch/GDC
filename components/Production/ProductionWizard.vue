<script setup lang="ts">
const props = defineProps<{
  currentStep: number
  localData: any
  vesselLabels: { _id: string; name: string }[]
  selectedVesselDetails: { name: string; contents: string[]; volume?: number; volumeUnit?: string }[]
  costBreakdownLines: { label: string; value: number; auto: boolean }[]
  calculatedBatchCost: number
  calculatedBarrelCost: number
  calculatedBottlingCost: number
  calculatedTtbTax: number
  calculatedTabcTax: number
  totalProductionCost: number
  perBottleCost: number
  updateInventory: boolean
  selectedBottleName: string
}>()

const emit = defineEmits<{
  'update:currentStep': [number]
  'update:updateInventory': [boolean]
}>()

const bottleStore = useBottleStore()
</script>

<template>
  <div class="space-y-4">
    <!-- Step 1: Source -->
    <div v-if="currentStep === 1" class="space-y-4">
      <h3 class="text-sm font-semibold text-parchment/70">
        Select Source Vessels
      </h3>
      <UFormField label="Production Date">
        <SiteDatePicker v-model="localData.date" />
      </UFormField>
      <UFormField label="Vessels">
        <USelectMenu
          v-model="localData.vessel"
          :items="vesselLabels"
          label-key="name"
          value-key="_id"
          multiple
          searchable
          class="w-full"
        />
      </UFormField>
      <div v-if="selectedVesselDetails.length > 0" class="space-y-2">
        <div
          v-for="(v, i) in selectedVesselDetails"
          :key="i"
          class="bg-brown/10 rounded-lg border border-brown/20 p-3"
        >
          <div class="text-xs font-medium text-parchment/70">
            {{ v.name }}
          </div>
          <div class="text-xs text-parchment/60">
            {{ v.contents?.join(", ") }} - {{ v.volume }}
            {{ v.volumeUnit }}
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Product -->
    <div v-if="currentStep === 2" class="space-y-4">
      <h3 class="text-sm font-semibold text-parchment/70">
        Select Product
      </h3>
      <UFormField label="Bottle">
        <USelectMenu
          v-model="localData.bottle"
          :items="bottleStore.bottles"
          label-key="name"
          value-key="_id"
          searchable
          class="w-full"
        />
      </UFormField>
      <UFormField label="Glassware">
        <BaseItemSelect v-model="localData.bottling.glassware" filter-by-type="glass bottle" create-type="glass bottle" create-category="Bottling" />
      </UFormField>
      <UFormField label="Cap">
        <BaseItemSelect v-model="localData.bottling.cap" filter-by-type="bottle cap" create-type="bottle cap" create-category="Bottling" />
      </UFormField>
      <UFormField label="Label">
        <BaseItemSelect v-model="localData.bottling.label" filter-by-type="label" create-type="label" create-category="Bottling" />
      </UFormField>
      <UFormField label="Quantity">
        <UInput v-model="localData.quantity" type="number" />
      </UFormField>
    </div>

    <!-- Step 3: Costs -->
    <div v-if="currentStep === 3" class="space-y-4">
      <h3 class="text-sm font-semibold text-parchment/70">
        Production Costs
      </h3>
      <p class="text-xs text-parchment/50">
        Batch, barrel, and bottling material costs are calculated automatically. Enter any additional costs below.
      </p>

      <!-- Auto-calculated costs (read-only display) -->
      <div class="space-y-2">
        <div
          class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-flask-conical" class="text-parchment/50 w-4 h-4" />
            <span class="text-parchment/70">Batch / Spirit</span>
          </div>
          <span class="text-parchment font-medium">{{
            Dollar.format(calculatedBatchCost)
          }}</span>
        </div>
        <div
          class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-cylinder" class="text-parchment/50 w-4 h-4" />
            <span class="text-parchment/70">Barrel</span>
          </div>
          <span class="text-parchment font-medium">{{
            Dollar.format(calculatedBarrelCost)
          }}</span>
        </div>
        <div
          class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-package" class="text-parchment/50 w-4 h-4" />
            <span class="text-parchment/70">Bottling Materials</span>
          </div>
          <span class="text-parchment font-medium">{{
            Dollar.format(calculatedBottlingCost)
          }}</span>
        </div>
      </div>

      <USeparator />

      <!-- Auto-calculated excise taxes -->
      <div class="space-y-2">
        <div
          class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-landmark" class="text-parchment/50 w-4 h-4" />
            <div>
              <span class="text-parchment/70">TTB Federal Excise Tax</span>
              <span class="text-[10px] text-parchment/40 ml-1">($2.70/PG)</span>
            </div>
          </div>
          <span class="text-parchment font-medium">{{
            Dollar.format(calculatedTtbTax)
          }}</span>
        </div>
        <div
          class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-map-pin" class="text-parchment/50 w-4 h-4" />
            <div>
              <span class="text-parchment/70">TABC Texas Excise Tax</span>
              <span class="text-[10px] text-parchment/40 ml-1">($2.40/WG)</span>
            </div>
          </div>
          <span class="text-parchment font-medium">{{
            Dollar.format(calculatedTabcTax)
          }}</span>
        </div>
      </div>

      <USeparator />

      <!-- Manual cost entries -->
      <div class="space-y-3">
        <UFormField label="Labor Cost">
          <UInput
            v-model="localData.costs!.labor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            icon="i-lucide-hard-hat"
          />
        </UFormField>
        <UFormField label="Other Costs">
          <UInput
            v-model="localData.costs!.other"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            icon="i-lucide-ellipsis"
          />
        </UFormField>
      </div>
    </div>

    <!-- Step 4: Review -->
    <div v-if="currentStep === 4" class="space-y-4">
      <h3 class="text-sm font-semibold text-parchment/70">
        Review Production
      </h3>

      <!-- Inventory Toggle -->
      <div
        class="flex items-center justify-between rounded-lg border px-3 py-2"
        :class="updateInventory ? 'border-green-500/20 bg-green-500/5' : 'border-amber-500/20 bg-amber-500/5'"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="updateInventory ? 'i-lucide-package-check' : 'i-lucide-package-x'"
            :class="updateInventory ? 'text-green-400' : 'text-amber-400'"
          />
          <div>
            <div class="text-sm text-parchment">Update Inventory</div>
            <div class="text-[10px] text-parchment/50">
              {{ updateInventory ? 'Bottle stock will be increased and materials decreased' : 'No inventory changes — use for recording historical productions' }}
            </div>
          </div>
        </div>
        <USwitch :model-value="updateInventory" @update:model-value="emit('update:updateInventory', $event)" />
      </div>
      <div
        class="bg-brown/10 rounded-lg border border-brown/20 p-4 space-y-3"
      >
        <div class="flex justify-between text-sm">
          <span class="text-parchment/50">Date</span>
          <span class="text-parchment">{{
            localData.date
              ? new Date(localData.date).toLocaleDateString()
              : "Not set"
          }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-parchment/50">Vessels</span>
          <span class="text-parchment">{{
            selectedVesselDetails.map((v) => v.name).join(", ") ||
            "None"
          }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-parchment/50">Bottle</span>
          <span class="text-parchment">{{
            selectedBottleName || "None"
          }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-parchment/50">Quantity</span>
          <span class="text-parchment">{{ localData.quantity }}</span>
        </div>

        <!-- Cost Breakdown -->
        <div class="border-t border-brown/20 pt-3 space-y-2">
          <div class="text-xs font-semibold text-parchment/60 uppercase tracking-wide mb-1">
            Cost Breakdown
          </div>
          <template v-for="line in costBreakdownLines" :key="line.label">
            <div
              v-if="line.value > 0"
              class="flex justify-between text-sm"
            >
              <span class="text-parchment/50">{{ line.label }}</span>
              <span class="text-parchment">{{
                Dollar.format(line.value)
              }}</span>
            </div>
          </template>

          <div class="border-t border-brown/20 pt-2 mt-2">
            <div class="flex justify-between text-sm">
              <span class="text-parchment/50 font-semibold">Total Production Cost</span>
              <span class="text-parchment font-bold">{{
                Dollar.format(totalProductionCost)
              }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-parchment/50">Cost Per Bottle</span>
              <span class="text-parchment font-semibold">{{
                Dollar.format(perBottleCost)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

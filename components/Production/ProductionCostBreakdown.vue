<script setup lang="ts">
defineProps<{
  localData: any
  calculatedBatchCost: number
  calculatedBarrelCost: number
  calculatedBottlingCost: number
  calculatedTtbTax: number
  calculatedTabcTax: number
  totalProductionCost: number
  perBottleCost: number
}>()
</script>

<template>
  <div class="border-t border-brown/20 pt-4">
    <h3 class="text-sm font-semibold text-parchment/70 mb-3">
      Cost Breakdown
    </h3>
    <div class="space-y-3">
      <!-- Auto-calculated costs (read-only) -->
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="Batch / Spirit">
          <div class="flex items-center gap-2">
            <UInput
              :model-value="calculatedBatchCost.toFixed(2)"
              disabled
              icon="i-lucide-lock"
              class="flex-1"
            />
          </div>
          <template #hint>
            <span class="text-[10px] text-parchment/50">Auto-calculated from vessels</span>
          </template>
        </UFormField>
        <UFormField label="Barrel">
          <UInput
            :model-value="calculatedBarrelCost.toFixed(2)"
            disabled
            icon="i-lucide-lock"
          />
          <template #hint>
            <span class="text-[10px] text-parchment/50">Auto-calculated from barrels</span>
          </template>
        </UFormField>
      </div>
      <UFormField label="Bottling Materials">
        <UInput
          :model-value="calculatedBottlingCost.toFixed(2)"
          disabled
          icon="i-lucide-lock"
        />
        <template #hint>
          <span class="text-[10px] text-parchment/50">Glass + cap + label per unit x quantity</span>
        </template>
      </UFormField>

      <!-- Auto-calculated tax costs -->
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="TTB Federal Tax">
          <UInput
            :model-value="calculatedTtbTax.toFixed(2)"
            disabled
            icon="i-lucide-lock"
          />
          <template #hint>
            <span class="text-[10px] text-parchment/50">$2.70/PG (CBMA Tier 1)</span>
          </template>
        </UFormField>
        <UFormField label="TABC Texas Tax">
          <UInput
            :model-value="calculatedTabcTax.toFixed(2)"
            disabled
            icon="i-lucide-lock"
          />
          <template #hint>
            <span class="text-[10px] text-parchment/50">$2.40/wine gallon</span>
          </template>
        </UFormField>
      </div>

      <!-- Manual cost entries -->
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="Labor">
          <UInput
            v-model="localData.costs!.labor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </UFormField>
        <UFormField label="Other">
          <UInput
            v-model="localData.costs!.other"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </UFormField>
      </div>

      <!-- Totals -->
      <div
        class="bg-brown/10 rounded-lg border border-brown/20 p-3 space-y-2"
      >
        <div class="flex justify-between text-sm">
          <span class="text-parchment/50">Total Production Cost</span>
          <span class="text-parchment font-semibold">{{
            Dollar.format(totalProductionCost)
          }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-parchment/50">Cost Per Bottle</span>
          <span class="text-parchment font-semibold">{{
            Dollar.format(perBottleCost)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

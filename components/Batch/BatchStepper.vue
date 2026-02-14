<script setup lang="ts">
const props = defineProps<{
  currentStatus: string
}>()

const currentIndex = computed(() =>
  BATCH_STAGES.findIndex((s) => s.name === props.currentStatus)
)

const stageColorClasses = (stage: typeof BATCH_STAGES[number]) => {
  switch (stage.color) {
    case 'blue': return { bg: 'bg-blue-500', ring: 'ring-blue-500/40', text: 'text-blue-400', line: 'bg-blue-500/60' }
    case 'orange': return { bg: 'bg-orange-500', ring: 'ring-orange-500/40', text: 'text-orange-400', line: 'bg-orange-500/60' }
    case 'yellow': return { bg: 'bg-yellow-500', ring: 'ring-yellow-500/40', text: 'text-yellow-400', line: 'bg-yellow-500/60' }
    case 'copper': return { bg: 'bg-copper', ring: 'ring-copper/40', text: 'text-copper', line: 'bg-copper/60' }
    case 'purple': return { bg: 'bg-purple-500', ring: 'ring-purple-500/40', text: 'text-purple-400', line: 'bg-purple-500/60' }
    case 'amber': return { bg: 'bg-amber', ring: 'ring-amber/40', text: 'text-amber', line: 'bg-amber/60' }
    case 'green': return { bg: 'bg-green-500', ring: 'ring-green-500/40', text: 'text-green-400', line: 'bg-green-500/60' }
    default: return { bg: 'bg-brown/40', ring: 'ring-brown/20', text: 'text-parchment/60', line: 'bg-brown/30' }
  }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
    <div class="flex items-center justify-between">
      <div
        v-for="(stage, index) in BATCH_STAGES"
        :key="stage.name"
        class="flex items-center"
        :class="index < BATCH_STAGES.length - 1 ? 'flex-1' : ''"
      >
        <!-- Node -->
        <div class="flex flex-col items-center gap-1.5">
          <div
            :class="[
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
              index < currentIndex
                ? `${stageColorClasses(stage).bg} text-white`
                : index === currentIndex
                  ? `ring-2 ${stageColorClasses(stage).ring} ${stageColorClasses(stage).bg}/20 ${stageColorClasses(stage).text} animate-pulse`
                  : 'bg-brown/20 text-parchment/25',
            ]"
          >
            <UIcon
              v-if="index < currentIndex"
              name="i-lucide-check"
              class="text-base"
            />
            <UIcon
              v-else
              :name="stage.icon"
              class="text-base"
            />
          </div>
          <span
            :class="[
              'text-[10px] uppercase tracking-wider hidden sm:block whitespace-nowrap',
              index < currentIndex
                ? stageColorClasses(stage).text
                : index === currentIndex
                  ? `${stageColorClasses(stage).text} font-bold`
                  : 'text-parchment/25',
            ]"
          >
            {{ stage.name }}
          </span>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < BATCH_STAGES.length - 1"
          :class="[
            'flex-1 h-0.5 mx-2 rounded transition-all duration-300',
            index < currentIndex
              ? stageColorClasses(stage).line
              : 'bg-brown/20 border-dashed',
          ]"
        />
      </div>
    </div>
  </div>
</template>

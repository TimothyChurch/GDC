<script setup lang="ts">
import { STAGE_DISPLAY, stageTextColor } from '~/composables/batchPipeline'

const props = defineProps<{
  pipeline: string[]
  currentStage: string
}>()

const currentIndex = computed(() =>
  props.pipeline.indexOf(props.currentStage)
)

// Include "Upcoming" as index -1 for display
const displayStages = computed(() => {
  return [
    { name: 'Upcoming', ...STAGE_DISPLAY['Upcoming'] },
    ...props.pipeline.map((name) => ({
      name,
      ...(STAGE_DISPLAY[name] || { icon: 'i-lucide-circle', color: 'neutral' }),
    })),
  ]
})

const activeIndex = computed(() => {
  if (props.currentStage === 'Upcoming') return 0
  const pipeIdx = props.pipeline.indexOf(props.currentStage)
  return pipeIdx >= 0 ? pipeIdx + 1 : -1
})

const stageColorClasses = (color: string) => {
  const map: Record<string, { bg: string; ring: string; text: string; line: string }> = {
    blue: { bg: 'bg-blue-500', ring: 'ring-blue-500/40', text: 'text-blue-400', line: 'bg-blue-500/60' },
    orange: { bg: 'bg-orange-500', ring: 'ring-orange-500/40', text: 'text-orange-400', line: 'bg-orange-500/60' },
    yellow: { bg: 'bg-yellow-500', ring: 'ring-yellow-500/40', text: 'text-yellow-400', line: 'bg-yellow-500/60' },
    copper: { bg: 'bg-copper', ring: 'ring-copper/40', text: 'text-copper', line: 'bg-copper/60' },
    emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-500/40', text: 'text-emerald-400', line: 'bg-emerald-500/60' },
    sky: { bg: 'bg-sky-500', ring: 'ring-sky-500/40', text: 'text-sky-400', line: 'bg-sky-500/60' },
    amber: { bg: 'bg-amber-500', ring: 'ring-amber-500/40', text: 'text-amber-400', line: 'bg-amber-500/60' },
    purple: { bg: 'bg-purple-500', ring: 'ring-purple-500/40', text: 'text-purple-400', line: 'bg-purple-500/60' },
    pink: { bg: 'bg-pink-500', ring: 'ring-pink-500/40', text: 'text-pink-400', line: 'bg-pink-500/60' },
    cyan: { bg: 'bg-cyan-500', ring: 'ring-cyan-500/40', text: 'text-cyan-400', line: 'bg-cyan-500/60' },
    green: { bg: 'bg-green-500', ring: 'ring-green-500/40', text: 'text-green-400', line: 'bg-green-500/60' },
  }
  return map[color] || { bg: 'bg-brown/40', ring: 'ring-brown/20', text: 'text-parchment/60', line: 'bg-brown/30' }
}
</script>

<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-4">
    <div class="flex items-center justify-between">
      <div
        v-for="(stage, index) in displayStages"
        :key="stage.name"
        class="flex items-center"
        :class="index < displayStages.length - 1 ? 'flex-1' : ''"
      >
        <!-- Node -->
        <div class="flex flex-col items-center gap-1.5">
          <div
            :class="[
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
              index < activeIndex
                ? `${stageColorClasses(stage.color).bg} text-white`
                : index === activeIndex
                  ? `ring-2 ${stageColorClasses(stage.color).ring} ${stageColorClasses(stage.color).bg}/20 ${stageColorClasses(stage.color).text} animate-pulse`
                  : 'bg-brown/20 text-parchment/25',
            ]"
          >
            <UIcon
              v-if="index < activeIndex"
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
              index < activeIndex
                ? stageColorClasses(stage.color).text
                : index === activeIndex
                  ? `${stageColorClasses(stage.color).text} font-bold`
                  : 'text-parchment/25',
            ]"
          >
            {{ stage.name }}
          </span>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < displayStages.length - 1"
          :class="[
            'flex-1 h-0.5 mx-2 rounded transition-all duration-300',
            index < activeIndex
              ? stageColorClasses(stage.color).line
              : 'bg-brown/20 border-dashed',
          ]"
        />
      </div>
    </div>
  </div>
</template>

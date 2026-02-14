<script setup lang="ts">
const { shortcuts, showHelp } = useKeyboardShortcuts()

const isMac = computed(() =>
  typeof navigator !== 'undefined' && navigator.userAgent?.includes('Mac')
)

const groupedShortcuts = computed(() => {
  const groups = new Map<string, typeof shortcuts>()
  shortcuts.forEach(s => {
    const list = groups.get(s.group) || []
    list.push(s)
    groups.set(s.group, list)
  })
  return groups
})

function formatKey(key: string): string {
  if (isMac.value) {
    return key.replace('Ctrl', '\u2318').replace('Cmd', '\u2318')
  }
  return key.replace('Cmd+', 'Ctrl+')
}
</script>

<template>
  <UModal v-model:open="showHelp">
    <template #content>
      <div class="p-5 max-w-lg">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Keyboard Shortcuts</h2>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" @click="showHelp = false" />
        </div>

        <div class="space-y-5">
          <div v-for="[group, items] in groupedShortcuts" :key="group">
            <h3 class="text-xs font-semibold uppercase tracking-widest text-copper/60 mb-2">{{ group }}</h3>
            <div class="space-y-1.5">
              <div
                v-for="shortcut in items"
                :key="shortcut.label"
                class="flex items-center justify-between py-1"
              >
                <span class="text-sm text-parchment/70">{{ shortcut.label }}</span>
                <div class="flex items-center gap-1">
                  <template v-for="(key, ki) in shortcut.keys" :key="ki">
                    <span v-if="ki > 0" class="text-xs text-parchment/20 mx-0.5">/</span>
                    <span class="inline-flex items-center gap-0.5">
                      <template v-for="(part, pi) in formatKey(key).split('+')" :key="pi">
                        <span v-if="pi > 0" class="text-xs text-parchment/20">+</span>
                        <kbd class="px-1.5 py-0.5 rounded bg-brown/30 border border-brown/40 text-xs text-parchment/60 font-mono min-w-[1.5rem] text-center">
                          {{ part.trim() }}
                        </kbd>
                      </template>
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-xs text-parchment/50 mt-4 text-center">
          Press <kbd class="px-1 py-0.5 rounded bg-brown/30 border border-brown/40 text-xs text-parchment/50 font-mono">?</kbd> to toggle this dialog
        </p>
      </div>
    </template>
  </UModal>
</template>

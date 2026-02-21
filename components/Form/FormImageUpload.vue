<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  folder?: string
  label?: string
}>(), {
  folder: 'general',
  label: 'Image',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const { upload, remove, uploading, error } = useCloudinaryUpload()
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const hasImage = computed(() => !!props.modelValue)

const handleFiles = async (files: FileList | null) => {
  if (!files?.length) return

  const file = files[0]

  // Validate type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    error.value = 'Please upload a JPEG, PNG, WebP, or GIF image'
    return
  }

  // Validate size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image must be under 5MB'
    return
  }

  const result = await upload(file, props.folder)
  if (result) {
    emit('update:modelValue', result.url)
  }
}

const onDrop = (e: DragEvent) => {
  dragOver.value = false
  handleFiles(e.dataTransfer?.files || null)
}

const onBrowse = () => {
  fileInput.value?.click()
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  handleFiles(target.files)
  // Reset so same file can be re-selected
  target.value = ''
}

const removeImage = async () => {
  // Extract public ID from Cloudinary URL if possible
  if (props.modelValue?.includes('cloudinary.com')) {
    const parts = props.modelValue.split('/upload/')
    if (parts[1]) {
      // Remove version and extension: v1234567890/gdc/bottles/abc123.jpg → gdc/bottles/abc123
      const path = parts[1].replace(/^v\d+\//, '').replace(/\.\w+$/, '')
      await remove(path)
    }
  }
  emit('update:modelValue', undefined)
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-parchment/70 mb-1.5">{{ label }}</label>

    <!-- Current image preview -->
    <div v-if="hasImage && !uploading" class="relative group mb-2">
      <img
        :src="modelValue"
        :alt="label"
        class="w-full max-w-xs h-40 object-cover rounded-lg border border-brown/30"
      />
      <div class="absolute inset-0 max-w-xs h-40 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <UButton
          icon="i-lucide-replace"
          variant="solid"
          size="xs"
          @click="onBrowse"
        >
          Replace
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="solid"
          size="xs"
          @click="removeImage"
        >
          Remove
        </UButton>
      </div>
    </div>

    <!-- Upload zone -->
    <div
      v-if="!hasImage || uploading"
      class="relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
      :class="[
        dragOver
          ? 'border-gold bg-gold/10'
          : 'border-brown/30 hover:border-brown/50 bg-brown/5',
        uploading ? 'pointer-events-none opacity-60' : ''
      ]"
      @click="onBrowse"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        class="hidden"
        @change="onFileChange"
      />

      <div v-if="uploading" class="flex flex-col items-center gap-2">
        <UIcon name="i-lucide-loader-2" class="text-2xl text-gold animate-spin" />
        <span class="text-sm text-parchment/60">Uploading...</span>
      </div>
      <div v-else class="flex flex-col items-center gap-2">
        <UIcon name="i-lucide-image-plus" class="text-2xl text-parchment/50" />
        <span class="text-sm text-parchment/60">
          Drag & drop or <span class="text-gold">browse</span>
        </span>
        <span class="text-xs text-parchment/50">JPEG, PNG, WebP, GIF (max 5MB)</span>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1.5 text-xs text-red-400">{{ error }}</p>
  </div>
</template>

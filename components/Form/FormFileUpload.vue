<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  folder?: string
  label?: string
}>(), {
  folder: 'documents',
  label: 'Document',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const { upload, remove, uploading, error } = useCloudinaryUpload()
const fileInput = ref<HTMLInputElement | null>(null)

const hasFile = computed(() => !!props.modelValue)

const fileName = computed(() => {
  if (!props.modelValue) return ''
  const parts = props.modelValue.split('/')
  return decodeURIComponent(parts[parts.length - 1])
})

const fileIcon = computed(() => {
  if (!props.modelValue) return 'i-lucide-file'
  if (props.modelValue.endsWith('.pdf')) return 'i-lucide-file-text'
  if (props.modelValue.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'i-lucide-image'
  return 'i-lucide-file'
})

const handleFiles = async (files: FileList | null) => {
  if (!files?.length) return

  const file = files[0]

  // Validate size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'File must be under 10MB'
    return
  }

  const result = await upload(file, props.folder)
  if (result) {
    emit('update:modelValue', result.url)
  }
}

const onBrowse = () => {
  fileInput.value?.click()
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  handleFiles(target.files)
  target.value = ''
}

const removeFile = async () => {
  if (props.modelValue?.includes('cloudinary.com')) {
    const parts = props.modelValue.split('/upload/')
    if (parts[1]) {
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

    <!-- Current file -->
    <div v-if="hasFile && !uploading" class="flex items-center gap-3 bg-brown/10 rounded-lg px-3 py-2 mb-2">
      <UIcon :name="fileIcon" class="text-lg text-parchment/60 shrink-0" />
      <a :href="modelValue" target="_blank" class="text-sm text-gold hover:text-copper truncate flex-1 transition-colors">
        {{ fileName }}
      </a>
      <div class="flex gap-1 shrink-0">
        <UButton icon="i-lucide-replace" variant="ghost" color="neutral" size="xs" @click="onBrowse" />
        <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="xs" @click="removeFile" />
      </div>
    </div>

    <!-- Upload button -->
    <div v-if="!hasFile || uploading">
      <input
        ref="fileInput"
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
        class="hidden"
        @change="onFileChange"
      />
      <UButton
        :loading="uploading"
        icon="i-lucide-upload"
        variant="outline"
        color="neutral"
        @click="onBrowse"
      >
        {{ uploading ? 'Uploading...' : 'Upload File' }}
      </UButton>
      <span class="ml-2 text-xs text-parchment/50">Max 10MB</span>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1.5 text-xs text-red-400">{{ error }}</p>
  </div>
</template>

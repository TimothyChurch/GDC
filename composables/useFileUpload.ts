export function useFileUpload() {
  const uploading = ref(false)
  const error = ref<string | null>(null)

  const upload = async (file: File, folder: string = 'general'): Promise<{ url: string; publicId: string } | null> => {
    uploading.value = true
    error.value = null

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    try {
      const result = await $fetch<{ url: string; publicId: string }>('/api/upload', {
        method: 'POST',
        body: formData,
      })
      return result
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Upload failed'
      return null
    } finally {
      uploading.value = false
    }
  }

  const remove = async (publicId: string): Promise<boolean> => {
    error.value = null
    try {
      await $fetch(`/api/upload/delete`, {
        method: 'DELETE',
        params: { fullId: publicId },
      })
      return true
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Delete failed'
      return false
    }
  }

  return { upload, remove, uploading, error }
}

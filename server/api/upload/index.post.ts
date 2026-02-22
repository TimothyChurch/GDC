export default defineEventHandler(async (event) => {
  const cloudinary = getCloudinary()

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = formData.find(f => f.name === 'file')
  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'No file field found' })
  }

  const folderField = formData.find(f => f.name === 'folder')
  const folder = folderField?.data?.toString() || 'gdc'

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.data.length > maxSize) {
    throw createError({ statusCode: 400, statusMessage: 'File exceeds 10MB limit' })
  }

  // Validate file type
  const mime = file.type || ''
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  if (!allowedTypes.includes(mime)) {
    throw createError({ statusCode: 400, statusMessage: 'File type not allowed. Use JPEG, PNG, WebP, GIF, or PDF.' })
  }

  try {
    const result = await new Promise<{ secure_url: string; public_id: string; format: string; width?: number; height?: number; bytes: number }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `gdc/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as any)
        }
      ).end(file.data)
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    }
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Upload failed' })
  }
})

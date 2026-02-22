export default defineEventHandler(async (event) => {
  const cloudinary = getCloudinary()

  const publicId = getRouterParam(event, 'id')
  if (!publicId) {
    throw createError({ statusCode: 400, statusMessage: 'Public ID required' })
  }

  // The public ID comes URL-encoded with slashes replaced
  // Cloudinary public IDs can contain folder paths like "gdc/bottles/abc123"
  const query = getQuery(event)
  const fullId = (query.fullId as string) || publicId

  // Validate that the ID starts with our folder prefix to prevent arbitrary deletions
  if (!fullId.startsWith('gdc/')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid asset ID' })
  }

  try {
    const result = await cloudinary.uploader.destroy(fullId)
    return { success: result.result === 'ok', result: result.result }
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Delete failed' })
  }
})

export default defineEventHandler(async (event) => {
  await requireRole(event, 'Admin', 'Manager', 'Staff')

  const cloudinary = getCloudinary(event)

  const publicId = getRouterParam(event, 'id')
  if (!publicId) {
    throw createError({ status: 400, statusText: 'Public ID required' })
  }

  // The public ID comes URL-encoded with slashes replaced
  // Cloudinary public IDs can contain folder paths like "gdc/bottles/abc123"
  const query = getQuery(event)
  const fullId = (query.fullId as string) || publicId

  // Validate that the ID starts with our folder prefix to prevent arbitrary deletions
  if (!fullId.startsWith('gdc/')) {
    throw createError({ status: 400, statusText: 'Invalid asset ID' })
  }

  try {
    const result = await cloudinary.uploader.destroy(fullId)
    return { success: result.result === 'ok', result: result.result }
  } catch {
    throw createError({ status: 500, statusText: 'Delete failed' })
  }
})

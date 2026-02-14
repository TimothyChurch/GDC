import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, 'id')
  if (!publicId) {
    throw createError({ statusCode: 400, statusMessage: 'Public ID required' })
  }

  // The public ID comes URL-encoded with slashes replaced
  // Cloudinary public IDs can contain folder paths like "gdc/bottles/abc123"
  const query = getQuery(event)
  const fullId = (query.fullId as string) || publicId

  try {
    const result = await cloudinary.uploader.destroy(fullId)
    return { success: result.result === 'ok', result: result.result }
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Delete failed' })
  }
})

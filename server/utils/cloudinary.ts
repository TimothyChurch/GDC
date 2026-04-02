import { v2 as cloudinary } from 'cloudinary'

let configured = false

export function getCloudinary(event?: any) {
  if (!configured) {
    const config = useRuntimeConfig(event)
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    })
    configured = true
  }
  return cloudinary
}

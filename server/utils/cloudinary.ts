import { v2 as cloudinary } from 'cloudinary'

let configured = false

export function getCloudinary() {
  if (!configured) {
    const config = useRuntimeConfig()
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    })
    configured = true
  }
  return cloudinary
}

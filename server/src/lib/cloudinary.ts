import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import { config, isCloudinaryEnabled } from '../config.js'

let configured = false

function ensureConfigured(): void {
  if (configured) return
  if (!isCloudinaryEnabled()) {
    throw new Error('Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env')
  }
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  })
  configured = true
}

export interface UploadedImage {
  url: string
  publicId: string
  width: number
  height: number
}

/**
 * Upload a base64 data-URI (e.g. "data:image/jpeg;base64,...") to Cloudinary.
 * Returns the canonical secure URL plus the public_id (useful for later
 * deletion).
 */
export async function uploadDataUri(dataUri: string, opts?: { folder?: string }): Promise<UploadedImage> {
  ensureConfigured()
  const res = (await cloudinary.uploader.upload(dataUri, {
    folder: opts?.folder ?? config.cloudinary.folder,
    resource_type: 'image',
    overwrite: false,
    invalidate: true,
  })) as UploadApiResponse
  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width,
    height: res.height,
  }
}

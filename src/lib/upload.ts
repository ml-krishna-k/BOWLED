import { api } from '@/lib/api'

export interface UploadedImage {
  url: string
  publicId: string
  width: number
  height: number
}

/** Read a File as a base64 data URI. Rejects if FileReader errors. */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') resolve(result)
      else reject(new Error('Could not read file'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

/** Upload a file to Cloudinary via the admin upload endpoint. */
export async function uploadImage(file: File, folder?: string): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported')
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error('Image is too large — keep it under 6 MB')
  }
  const dataUri = await fileToDataUri(file)
  return api<UploadedImage>('/api/upload/image', {
    method: 'POST',
    body: { data: dataUri, folder },
  })
}

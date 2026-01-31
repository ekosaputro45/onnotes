import type { NoteImage } from '../types'

const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined) || ''
const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined) || ''
const folderBase = (import.meta.env.VITE_CLOUDINARY_FOLDER as string | undefined) || 'onnotes'

export const cloudinaryConfigured = Boolean(cloudName && uploadPreset)

export const cloudinaryConfigError = cloudinaryConfigured
  ? null
  : 'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.'

export function cloudinaryDeliveryUrl(url: string, transform: string = 'f_auto,q_auto'): string {
  // Convert .../image/upload/... -> .../image/upload/<transform>/...
  try {
    const u = new URL(url)
    if (!u.hostname.includes('res.cloudinary.com')) return url
    u.pathname = u.pathname.replace('/image/upload/', `/image/upload/${transform}/`)
    return u.toString()
  } catch {
    return url
  }
}

export async function uploadToCloudinary(params: {
  userId: string
  file: File
}): Promise<NoteImage> {
  if (!cloudinaryConfigured) {
    throw new Error(cloudinaryConfigError || 'Cloudinary not configured')
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`
  const form = new FormData()
  form.set('file', params.file)
  form.set('upload_preset', uploadPreset)
  form.set('folder', `${folderBase}/${params.userId}`)

  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Cloudinary upload failed (${res.status}). ${text}`)
  }

  const data = (await res.json()) as { secure_url?: string; public_id?: string }
  if (!data.secure_url) throw new Error('Cloudinary response missing secure_url')

  return {
    kind: 'cloudinary',
    url: data.secure_url,
    publicId: data.public_id,
  }
}

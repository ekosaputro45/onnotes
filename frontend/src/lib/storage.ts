import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getStorageClient } from './firebase'
import type { NoteImage } from '../types'
import { cloudinaryConfigured, uploadToCloudinary } from './cloudinary'
import { prepareImageForUpload } from './imagePrep'

export async function uploadNoteImage(params: {
  userId: string
  file: File
}): Promise<NoteImage> {
  const preparedFile = await prepareImageForUpload(params.file)

  if (cloudinaryConfigured) {
    return uploadToCloudinary({ userId: params.userId, file: preparedFile })
  }

  const storage = getStorageClient()
  const ext = preparedFile.name.split('.').pop() || 'bin'
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const id = crypto.randomUUID()

  const path = `notes/${params.userId}/${id}.${safeExt}`
  const r = ref(storage, path)
  await uploadBytes(r, preparedFile, {
    contentType: preparedFile.type || 'application/octet-stream',
  })
  const url = await getDownloadURL(r)

  return {
    kind: 'storage',
    url,
    storagePath: path,
  }
}

export async function deleteNoteImage(image: NoteImage | null | undefined) {
  if (!image) return
  if (image.kind !== 'storage') return
  if (!image.storagePath) return

  const storage = getStorageClient()
  await deleteObject(ref(storage, image.storagePath))
}

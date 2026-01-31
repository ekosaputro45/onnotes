import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getStorageClient } from './firebase'
import type { NoteImage } from '../types'

export async function uploadNoteImage(params: {
  userId: string
  file: File
}): Promise<NoteImage> {
  const storage = getStorageClient()
  const ext = params.file.name.split('.').pop() || 'bin'
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const id = crypto.randomUUID()

  const path = `notes/${params.userId}/${id}.${safeExt}`
  const r = ref(storage, path)
  await uploadBytes(r, params.file, {
    contentType: params.file.type || 'application/octet-stream',
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

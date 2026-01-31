export type Category = {
  id: string
  name: string
  createdAt: number
}

export type NoteImage = {
  kind: 'storage' | 'external' | 'cloudinary'
  url: string
  storagePath?: string
  publicId?: string
}

export type Note = {
  id: string
  userId: string
  title: string
  content: string
  categoryId?: string | null
  image?: NoteImage | null
  createdAt: number
  updatedAt: number
}

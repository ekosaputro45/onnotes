import type { Timestamp } from 'firebase/firestore'

export type NoteImage =
  | {
      kind: 'storage'
      url: string
      storagePath: string
    }
  | {
      kind: 'url'
      url: string
    }

export type NoteDoc = {
  uid: string
  title: string
  body: string
  categoryId?: string | null
  createdAt?: Timestamp
  updatedAt?: Timestamp
  image?: NoteImage | null
}

export type CategoryDoc = {
  uid: string
  name: string
  createdAt?: Timestamp
}

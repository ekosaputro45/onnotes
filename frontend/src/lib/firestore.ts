import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDb } from './firebase'
import type { Category, Note, NoteImage } from '../types'

export async function listCategories(userId: string): Promise<Category[]> {
  const db = getDb()
  const categoriesCol = collection(db, 'categories')
  const q = query(categoriesCol, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.get('name'),
    createdAt: d.get('createdAt') ?? Date.now(),
  }))
}

export async function createCategory(userId: string, name: string) {
  const db = getDb()
  const categoriesCol = collection(db, 'categories')
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Category name is required')

  await addDoc(categoriesCol, {
    userId,
    name: trimmed,
    createdAt: Date.now(),
    createdAtServer: serverTimestamp(),
  })
}

export async function deleteCategory(categoryId: string) {
  const db = getDb()
  await deleteDoc(doc(db, 'categories', categoryId))
}

export async function listNotes(userId: string, categoryId?: string | null): Promise<Note[]> {
  const db = getDb()
  const notesCol = collection(db, 'notes')
  const constraints: any[] = [where('userId', '==', userId), orderBy('createdAt', 'desc')]
  if (categoryId) constraints.unshift(where('categoryId', '==', categoryId))

  const q = query(notesCol, ...constraints)
  const snap = await getDocs(q)

  return snap.docs.map((d) => ({
    id: d.id,
    userId: d.get('userId'),
    title: d.get('title') || '',
    content: d.get('content') || '',
    categoryId: d.get('categoryId') ?? null,
    image: (d.get('image') as NoteImage | null) ?? null,
    createdAt: d.get('createdAt') ?? Date.now(),
    updatedAt: d.get('updatedAt') ?? d.get('createdAt') ?? Date.now(),
  }))
}

export async function createNote(params: {
  userId: string
  title: string
  content: string
  categoryId?: string | null
  image?: NoteImage | null
}) {
  const db = getDb()
  const notesCol = collection(db, 'notes')
  const title = params.title.trim()
  const content = params.content.trim()

  if (!title && !content && !params.image) {
    throw new Error('Note is empty')
  }

  await addDoc(notesCol, {
    userId: params.userId,
    title,
    content,
    categoryId: params.categoryId ?? null,
    image: params.image ?? null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdAtServer: serverTimestamp(),
    updatedAtServer: serverTimestamp(),
  })
}

export async function getNote(noteId: string): Promise<Note | null> {
  const db = getDb()
  const ref = doc(db, 'notes', noteId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null

  return {
    id: snap.id,
    userId: snap.get('userId'),
    title: snap.get('title') || '',
    content: snap.get('content') || '',
    categoryId: snap.get('categoryId') ?? null,
    image: (snap.get('image') as NoteImage | null) ?? null,
    createdAt: snap.get('createdAt') ?? Date.now(),
    updatedAt: snap.get('updatedAt') ?? snap.get('createdAt') ?? Date.now(),
  }
}

export async function updateNote(noteId: string, patch: {
  title?: string
  content?: string
  categoryId?: string | null
  image?: NoteImage | null
}) {
  const db = getDb()
  const ref = doc(db, 'notes', noteId)
  await updateDoc(ref, {
    ...patch,
    updatedAt: Date.now(),
    updatedAtServer: serverTimestamp(),
  })
}

export async function deleteNote(noteId: string) {
  const db = getDb()
  await deleteDoc(doc(db, 'notes', noteId))
}

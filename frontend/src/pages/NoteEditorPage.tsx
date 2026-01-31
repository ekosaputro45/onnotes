import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import type { Category, NoteImage } from '../types'
import {
  createNote,
  getNote,
  listCategories,
  updateNote,
} from '../lib/firestore'
import { deleteNoteImage, uploadNoteImage } from '../lib/storage'

export function NoteEditorPage({ mode }: { mode: 'create' | 'edit' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { noteId } = useParams()

  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const [existingImage, setExistingImage] = useState<NoteImage | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)

  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [pastedFile, setPastedFile] = useState<File | null>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!user) return
    listCategories(user.uid).then(setCategories)
  }, [user])

  useEffect(() => {
    if (mode !== 'edit') return
    if (!noteId) return

    setLoading(true)
    getNote(noteId)
      .then((n) => {
        if (!n) throw new Error('Note not found')
        setTitle(n.title)
        setContent(n.content)
        setCategoryId(n.categoryId ?? null)
        setExistingImage(n.image ?? null)
      })
      .catch((e: any) => setError(e?.message || 'Failed to load note'))
      .finally(() => setLoading(false))
  }, [mode, noteId])

  useEffect(() => {
    const url = imageUrl.trim()
    if (url) {
      setPreviewUrl(url)
      return
    }
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile)
      setPreviewUrl(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
    if (pastedFile) {
      const objectUrl = URL.createObjectURL(pastedFile)
      setPreviewUrl(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }

    if (removeExistingImage) {
      setPreviewUrl(null)
      return
    }

    setPreviewUrl(existingImage?.url ?? null)
  }, [imageUrl, imageFile, pastedFile, existingImage, removeExistingImage])

  const hasNewImage = useMemo(
    () => !!imageUrl.trim() || !!imageFile || !!pastedFile,
    [imageUrl, imageFile, pastedFile],
  )

  function clearNewImageInputs() {
    setImageUrl('')
    setImageFile(null)
    setPastedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function clearAllImages() {
    clearNewImageInputs()
    setExistingImage(null)
    setRemoveExistingImage(true)
  }

  async function handlePasteFromClipboard() {
    setError(null)
    try {
      // Prefer Clipboard API image
      const items = await navigator.clipboard.read()
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const file = new File([blob], `pasted.${type.split('/')[1] || 'png'}`, {
              type,
            })
            setPastedFile(file)
            setImageFile(null)
            setImageUrl('')
            return
          }
        }
      }
      setError('No image found in clipboard')
    } catch (e: any) {
      setError(e?.message || 'Clipboard paste not supported in this browser')
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setError(null)
    setSaving(true)

    try {
      let finalImage: NoteImage | null = existingImage

      // If removing existing image and not replacing
      if (removeExistingImage && !hasNewImage) {
        await deleteNoteImage(existingImage)
        finalImage = null
      }

      // If new image provided, replace existing
      if (hasNewImage) {
        await deleteNoteImage(existingImage)

        if (imageUrl.trim()) {
          finalImage = { kind: 'external', url: imageUrl.trim() }
        } else {
          const file = imageFile || pastedFile
          if (!file) throw new Error('Image file missing')
          finalImage = await uploadNoteImage({ userId: user.uid, file })
        }
      }

      if (mode === 'create') {
        await createNote({
          userId: user.uid,
          title,
          content,
          categoryId,
          image: finalImage,
        })
      } else {
        if (!noteId) throw new Error('Missing note id')
        await updateNote(noteId, {
          title,
          content,
          categoryId,
          image: finalImage,
        })
      }

      navigate('/', { replace: true })
    } catch (e: any) {
      setError(e?.message || 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {mode === 'create' ? 'Create note' : 'Edit note'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">Instagram-like editor with image preview.</p>
        </div>
        <Link
          to="/"
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
              placeholder="(optional)"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full min-h-[140px] rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
              placeholder="Write something…"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="imageFile">
              Image upload
            </label>
            <input
              ref={fileInputRef}
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null
                setImageFile(f)
                if (f) {
                  setImageUrl('')
                  setPastedFile(null)
                }
              }}
              className="mt-1 block w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="imageUrl">
              Image URL
            </label>
            <input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                if (e.target.value.trim()) {
                  setImageFile(null)
                  setPastedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }
              }}
              placeholder="https://..."
              className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Paste image
            </button>

            <button
              type="button"
              onClick={clearNewImageInputs}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear new image
            </button>

            <button
              type="button"
              onClick={clearAllImages}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Remove image
            </button>
          </div>
        </div>

        {previewUrl ? (
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-black">
              <img src={previewUrl} alt="Preview" className="w-full max-h-[520px] object-cover" />
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : mode === 'create' ? 'Post' : 'Save'}
          </button>
        </div>

        {loading ? <div className="text-sm text-gray-500">Loading note…</div> : null}
      </form>
    </div>
  )
}

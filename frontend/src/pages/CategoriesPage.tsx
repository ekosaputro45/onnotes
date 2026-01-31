import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import type { Category } from '../types'
import { createCategory, deleteCategory, listCategories } from '../lib/firestore'
import { Modal } from '../components/Modal'

export function CategoriesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  async function reload() {
    if (!user) return
    setError(null)
    setLoading(true)
    try {
      const cats = await listCategories(user.uid)
      setCategories(cats)
    } catch (e: any) {
      setError(e?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    try {
      await createCategory(user.uid, name)
      setName('')
      await reload()
    } catch (e: any) {
      setError(e?.message || 'Failed to create category')
    }
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return
    await deleteCategory(deleteTarget.id)
    setDeleteTarget(null)
    await reload()
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900">Categories</h2>
        <p className="mt-1 text-sm text-gray-500">Organize your notes by topic.</p>

        <form onSubmit={onCreate} className="mt-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
          />
          <button className="rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
            Add
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 text-sm font-semibold text-gray-900">
          Your categories
        </div>

        {loading ? (
          <div className="p-5 text-sm text-gray-500">Loading…</div>
        ) : null}

        {!loading && categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No categories yet.</div>
        ) : null}

        <div className="divide-y divide-gray-100">
          {categories.map((c) => (
            <div key={c.id} className="px-5 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{c.name}</div>
              </div>
              <button
                onClick={() => setDeleteTarget(c)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!deleteTarget}
        title="Delete this category?"
        description="Notes will not be deleted, but may lose their category."
        confirmText="Delete"
        cancelText="Cancel"
        confirmTone="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
      />
    </div>
  )
}

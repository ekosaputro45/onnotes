import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import type { Category, Note } from '../types'
import { listCategories, listNotes, deleteNote } from '../lib/firestore'
import { Modal } from '../components/Modal'

function formatTime(ts: number) {
  return new Date(ts).toLocaleString()
}

export function FeedPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategoryId = searchParams.get('category')

  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)

  const pills = useMemo(() => {
    return [
      {
        id: null as string | null,
        name: 'All',
        active: !activeCategoryId,
      },
      ...categories.map((c) => ({
        id: c.id,
        name: c.name,
        active: activeCategoryId === c.id,
      })),
    ]
  }, [categories, activeCategoryId])

  async function reload() {
    if (!user) return
    setError(null)
    setLoading(true)
    try {
      const [cats, nts] = await Promise.all([
        listCategories(user.uid),
        listNotes(user.uid, activeCategoryId),
      ])
      setCategories(cats)
      setNotes(nts)
    } catch (e: any) {
      setError(e?.message || 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, activeCategoryId])

  function setCategory(id: string | null) {
    if (!id) {
      searchParams.delete('category')
      setSearchParams(searchParams, { replace: true })
      return
    }
    searchParams.set('category', id)
    setSearchParams(searchParams, { replace: true })
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await deleteNote(deleteTarget.id)
    setDeleteTarget(null)
    await reload()
  }

  return (
    <div>
      <div className="mb-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max">
          {pills.map((p) => (
            <button
              key={p.id ?? 'all'}
              onClick={() => setCategory(p.id)}
              className={
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ' +
                (p.active
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50')
              }
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : null}

      {!loading && notes.length === 0 ? (
        <div className="bg-white sm:rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400 p-[3px]">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No notes yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start capturing your thoughts and ideas.</p>
          <Link
            to="/notes/new"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create your first note
          </Link>
        </div>
      ) : null}

      <div className="space-y-5">
        {notes.map((n) => (
          <article
            key={n.id}
            className="bg-white sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400 p-[2px]">
                  <div className="h-full w-full rounded-full bg-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {n.title || 'Untitled'}
                  </div>
                  <div className="text-xs text-gray-500">{formatTime(n.createdAt)}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to={`/notes/${n.id}/edit`}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteTarget(n)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {n.image?.url ? (
              <div className="bg-black">
                <img src={n.image.url} alt="" className="w-full max-h-[520px] object-cover" />
              </div>
            ) : null}

            <div className="px-4 py-3">
              {n.content ? (
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{n.content}</p>
              ) : null}

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-400">Updated: {formatTime(n.updatedAt)}</div>
                <Link
                  to={`/notes/${n.id}/edit`}
                  className="text-xs font-semibold text-gray-700 hover:underline"
                >
                  Open
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={!!deleteTarget}
        title="Delete this note?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmTone="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

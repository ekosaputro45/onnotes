import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { firebaseConfigError, getAuthClient } from '../lib/firebase'

function BrandHeader() {
  return (
    <div className="mb-6 flex flex-col items-center">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400" />
        <span className="text-2xl font-bold tracking-tight text-gray-900">OnNotes</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">Create your account</p>
    </div>
  )
}

export function RegisterPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && user) return <Navigate to="/" replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const cred = await createUserWithEmailAndPassword(
        getAuthClient(),
        email,
        password,
      )
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() })
      }
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center px-4 py-8 bg-[#fafafa]">
      <BrandHeader />

      <div className="w-full max-w-md px-8 py-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
        {firebaseConfigError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {firebaseConfigError}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5" aria-disabled={!!firebaseConfigError}>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-gray-400 focus:ring-gray-200 focus:bg-white transition"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !!firebaseConfigError}
            className="w-full rounded-full bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gray-900 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>

      <p className="mt-6 text-xs text-gray-400">&copy; {new Date().getFullYear()} OnNotes</p>
    </div>
  )
}

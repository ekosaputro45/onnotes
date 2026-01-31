import { firebaseConfigError, firebaseMissingKeys } from '../lib/firebase'

export function FirebaseSetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-soft p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400" />
          <div>
            <div className="text-lg font-bold text-gray-900">Configure Firebase</div>
            <div className="text-sm text-gray-500">React app needs Firebase env vars.</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {firebaseConfigError}
        </div>

        <div className="mt-4">
          <div className="text-sm font-semibold text-gray-900">Missing keys</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
            {firebaseMissingKeys.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5 text-sm text-gray-700 space-y-2">
          <p>
            1) Copy <span className="font-mono">frontend/.env.example</span> to{' '}
            <span className="font-mono">frontend/.env</span>
          </p>
          <p>
            2) Fill values from Firebase Console → Project Settings → Your apps (Web)
          </p>
          <p>
            3) Enable Auth (Email/Password), create Firestore Database, and enable Storage
          </p>
        </div>
      </div>
    </div>
  )
}

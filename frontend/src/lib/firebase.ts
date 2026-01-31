import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
}

const requiredKeys: Array<keyof typeof firebaseConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

export const firebaseMissingKeys = requiredKeys.filter((k) => !firebaseConfig[k])
export const firebaseConfigured = firebaseMissingKeys.length === 0

export const firebaseConfigError = firebaseConfigured
  ? null
  : `Firebase is not configured. Missing: ${firebaseMissingKeys.join(', ')}. Copy .env.example to .env and fill values.`

export const firebaseApp = firebaseConfigured ? initializeApp(firebaseConfig) : null

export function getAuthClient() {
  if (!firebaseApp) throw new Error(firebaseConfigError || 'Firebase not configured')
  return getAuth(firebaseApp)
}

export function getDb() {
  if (!firebaseApp) throw new Error(firebaseConfigError || 'Firebase not configured')
  return getFirestore(firebaseApp)
}

export function getStorageClient() {
  if (!firebaseApp) throw new Error(firebaseConfigError || 'Firebase not configured')
  return getStorage(firebaseApp)
}

import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { firebaseConfigError, getAuthClient } from '../lib/firebase'

type AuthContextValue = {
  user: FirebaseUser | null
  loading: boolean
  configError: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (firebaseConfigError) {
      setLoading(false)
      setUser(null)
      return
    }

    const auth = getAuthClient()
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const value = useMemo(
    () => ({ user, loading, configError: firebaseConfigError }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

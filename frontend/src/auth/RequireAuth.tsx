import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { FullPageSpinner } from '../components/Spinner'
import { FirebaseSetupNotice } from '../components/FirebaseSetupNotice'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, configError } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />

  if (configError) return <FirebaseSetupNotice />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

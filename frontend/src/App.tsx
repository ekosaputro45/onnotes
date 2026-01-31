import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './components/AppShell'
import { CategoriesPage } from './pages/CategoriesPage'
import { FeedPage } from './pages/FeedPage'
import { LoginPage } from './pages/LoginPage'
import { NoteEditorPage } from './pages/NoteEditorPage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<FeedPage />} />
        <Route path="notes/new" element={<NoteEditorPage mode="create" />} />
        <Route path="notes/:noteId/edit" element={<NoteEditorPage mode="edit" />} />
        <Route path="categories" element={<CategoriesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

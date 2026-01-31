import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { getAuthClient } from '../lib/firebase'

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400" />
      <span className="text-lg font-bold tracking-tight text-gray-900">OnNotes</span>
    </Link>
  )
}

function Icon({ name }: { name: 'home' | 'plus' | 'tag' }) {
  if (name === 'home') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z" />
      </svg>
    )
  }
  if (name === 'plus') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 5v14M5 12h14" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M7 7h.01M3 7a4 4 0 0 1 4-4h4l10 10a2 2 0 0 1 0 2.828l-5.172 5.172a2 2 0 0 1-2.828 0L3 11V7Z" />
    </svg>
  )
}

function DesktopNav() {
  const base =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition'
  const active = 'bg-gray-900 text-white'
  const inactive = 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'

  return (
    <div className="hidden sm:flex items-center gap-2">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <span className="-ml-1">
          <Icon name="home" />
        </span>
        Feed
      </NavLink>

      <NavLink
        to="/notes/new"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <span className="-ml-1">
          <Icon name="plus" />
        </span>
        Create Note
      </NavLink>

      <NavLink
        to="/categories"
        className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
      >
        <span className="-ml-1">
          <Icon name="tag" />
        </span>
        Categories
      </NavLink>
    </div>
  )
}

export function AppShell() {
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(getAuthClient())
    navigate('/login', { replace: true })
  }

  const linkBase =
    'flex flex-col items-center justify-center gap-1 text-xs font-medium'

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3">
            <DesktopNav />
            <button
              onClick={handleLogout}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/90 backdrop-blur sm:hidden">
        <div className="mx-auto max-w-2xl px-4 py-2 flex items-center justify-between">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-gray-900' : 'text-gray-500'}`
            }
          >
            <Icon name="home" />
            Feed
          </NavLink>

          <NavLink
            to="/notes/new"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-gray-900' : 'text-gray-500'}`
            }
          >
            <div className="-mt-6 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-400 p-[3px] shadow-soft">
              <div className="rounded-2xl bg-white px-4 py-3 text-gray-900">
                <Icon name="plus" />
              </div>
            </div>
            New
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'text-gray-900' : 'text-gray-500'}`
            }
          >
            <Icon name="tag" />
            Categories
          </NavLink>
        </div>
      </nav>
    </div>
  )
}

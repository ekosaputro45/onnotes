import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function resolveBase(): string {
  const repo = process.env.GITHUB_REPOSITORY // e.g. "ekosaputro45/onnotes"
  if (!repo) return '/'

  const [owner, name] = repo.split('/')
  if (!owner || !name) return '/'

  // User/Org Pages repo -> served at domain root.
  if (name.toLowerCase() === `${owner.toLowerCase()}.github.io`) return '/'

  // Project Pages -> served under /<repo>/
  return `/${name}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: resolveBase(),
  plugins: [react()],
})

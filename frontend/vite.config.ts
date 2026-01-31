import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeBase(value: string): string {
  let base = value.trim()
  if (!base.startsWith('/')) base = `/${base}`
  if (!base.endsWith('/')) base = `${base}/`
  return base
}

function resolveBase(): string {
  // Manual override (useful for Firebase Hosting / custom domains)
  const override = process.env.VITE_DEPLOY_BASE
  if (override) return normalizeBase(override)

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

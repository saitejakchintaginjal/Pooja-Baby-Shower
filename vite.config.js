import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Link previews (WhatsApp, Instagram, Facebook, iMessage…) need an ABSOLUTE image address.
// On Vercel this is filled in automatically from the project's own address; to use a custom
// domain, set VITE_SITE_URL (e.g. https://pooja-shower.com) in the Vercel project settings.
function siteUrl() {
  if (process.env.VITE_SITE_URL) return process.env.VITE_SITE_URL.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return '' // local dev: falls back to a relative path
}
const siteMeta = {
  name: 'site-meta',
  transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl()),
}

export default defineConfig({ plugins: [react(), tailwindcss(), siteMeta] })

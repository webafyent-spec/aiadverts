import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://aiadverts.co.za',
  integrations: [sitemap()],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    plugins: [tailwindcss()]
  }
})

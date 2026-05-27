import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://manvu.ca',
  base: '/super-flow-web/',
  trailingSlash: 'always',
  integrations: [react(), mdx(), sitemap()],
  build: {
    format: 'directory',
  },
})

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://econopedia101.com',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'passthrough',
  }),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: ['econopedia101.com'],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  markdown: {
    shikiConfig: { theme: 'github-dark-default' },
  },
});

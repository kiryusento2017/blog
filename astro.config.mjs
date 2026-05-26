// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://zmspblog.us.kg',
  server: { host: '0.0.0.0' },
  integrations: [react(), sitemap()]
});
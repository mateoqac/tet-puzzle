// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Calculate cutoff date for sitemap (60 days ago)
const SITEMAP_DAYS_LIMIT = 60;
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - SITEMAP_DAYS_LIMIT);
const cutoffDateString = cutoffDate.toISOString().split('T')[0];

// https://astro.build/config
export default defineConfig({
  site: 'https://tetonor.app',
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    preact(),
    tailwind(),
    sitemap({
      filter: (page) => {
        // Check if this is a daily puzzle page
        const dailyMatch = page.match(/\/daily\/(\d{4}-\d{2}-\d{2})\/?$/);
        if (dailyMatch) {
          const pageDate = dailyMatch[1];
          // Only include pages from the last 60 days
          return pageDate >= cutoffDateString;
        }
        // Include all other pages
        return true;
      },
    }),
  ],
});
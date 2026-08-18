import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * The backend serves the built app in production, so there is one origin and no CORS. In
 * development the app runs on Vite and the API is proxied to keep that same-origin shape — a
 * request to `/api/...` is a relative request in both places.
 */
const apiTarget = process.env.SHOPARCHIVE_API_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    // The app is used from the shop's phones and tablets, so the dev server has to be reachable
    // from the LAN rather than from localhost only.
    host: true,
    port: 5173,
    // Vite refuses a Host header it does not recognise. Addresses are allowed already; `.local`
    // covers the mDNS name a phone uses when it reaches the machine by name rather than by IP.
    allowedHosts: ['.local'],
    proxy: {
      '/api': { target: apiTarget, changeOrigin: false },
    },
  },
  build: {
    // Fonts are cut into unicode-range subsets: inlining a small subset as a data URI would make
    // every device download it whether or not it renders that script.
    assetsInlineLimit: (filePath) => (filePath.endsWith('.woff2') ? false : undefined),
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
  },
});

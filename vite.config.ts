import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 4000,
      host: '0.0.0.0',
      proxy: {
        '/api/pvgis': {
          target: 'https://re.jrc.ec.europa.eu/api/v5_2',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/pvgis/, ''),
        },
        '/api/geocode': {
          target: 'https://nominatim.openstreetmap.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/geocode/, '/search'),
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: '分时电价洞察',
          short_name: '电价洞察',
          description: '分时电价洞察 PWA（只读展示版）',
          theme_color: '#0f172a',
          background_color: '#f8fafc',
          display: 'standalone',
          scope: '/',
          start_url: '/?entry=pwa',
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    test: {
      exclude: ['**/node_modules/**', '**/.worktrees/**', '**/dist/**'],
    }
  };
});

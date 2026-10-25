import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { answer } from './server/chat-core.js';

// Serves POST /api/chat on your own computer (npm run dev / npm run preview),
// reading GEMINI_API_KEY from the .env file. On Vercel/Netlify the files in api/ and netlify/ do the same job.
function localChatApi(env) {
  const handle = (req, res, next) => {
    if (req.url.split('?')[0] !== '/api/chat') return next();
    const send = (status, obj) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(obj));
    };
    if (req.method !== 'POST') return send(405, { error: 'method_not_allowed' });
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 20000) req.destroy(); });
    req.on('end', async () => {
      let body = null;
      try { body = JSON.parse(raw); } catch { body = null; }
      const { status, body: out } = await answer(body, env);
      if (status !== 200) console.log(`[api/chat] ${status} ${out.error}`);
      send(status, out);
    });
  };
  return {
    name: 'local-chat-api',
    configureServer(server) { server.middlewares.use(handle); },
    configurePreviewServer(server) { server.middlewares.use(handle); },
  };
}

// base './' lets the built app open from any folder or static host.
// The PWA plugin makes the app installable and caches it, so it works offline after the first visit.
export default defineConfig(({ mode }) => {
  // '' prefix = read all variables; only the server uses them, none are sent to the browser
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return {
  plugins: [
    react(),
    localChatApi(env),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Licence Saathi',
        short_name: 'Licence Saathi',
        description: 'A calm, step-by-step guide to your driving licence, in Hindi and English.',
        theme_color: '#1E4D3F',
        background_color: '#F6F3EE',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // The app, fonts and all content (src/data is bundled into the JS) are cached up front
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
        globIgnores: ['ocr/**'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // The ID reader is large, so it is cached only after someone uses it once
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/ocr/'),
            handler: 'CacheFirst',
            options: { cacheName: 'ocr', expiration: { maxEntries: 10 } },
          },
        ],
      },
    }),
  ],
  base: './',
  };
});

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isDev = mode === 'development'

  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
    ],
    server: {
      host: true,
      port: 5173,
      headers: isDev
        ? {
          // CSP permisivo para desarrollo en local
          'Content-Security-Policy': `
              default-src 'self' http://localhost:5173 http://127.0.0.1:* 'unsafe-inline' 'unsafe-eval';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              connect-src 'self' http://localhost:8000 https://api.cloudinary.com ws://localhost:5173 ws://127.0.0.1:*;
              img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://cdn.pixabay.com;
              font-src 'self' data:;
            `.replace(/\s+/g, ' ')
        }
        : undefined,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  }
})

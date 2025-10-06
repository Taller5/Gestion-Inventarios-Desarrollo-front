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
          // CSP completamente permisiva para desarrollo
          'Content-Security-Policy': `
              default-src * 'unsafe-inline' 'unsafe-eval' blob: data: ws:;
              script-src * 'unsafe-inline' 'unsafe-eval' blob:;
              worker-src * blob:;
              style-src * 'unsafe-inline';
              connect-src * ws: wss:;
              img-src * data: blob:;
              font-src * data:;
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

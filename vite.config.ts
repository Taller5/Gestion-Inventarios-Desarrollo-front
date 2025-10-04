import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
    ],
    server: {
      host: true,
      port: 5173,
      headers: {
        // CSP ajustada para permitir tu backend de desarrollo
        'Content-Security-Policy': "connect-src 'self' ws: https://res.cloudinary.com http://localhost:8000;"
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL, // http://localhost:8000
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'), 
        },
      }
    },
  }
})

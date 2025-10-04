import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  server: {
    host: true, // permite que Docker acceda a la app
    port: 5173, // puerto de desarrollo
    // Proxy dentro de 'server'
    proxy: {
      '/api': {
        target: 'https://gestion-inventarios-desarrollo-back.vercel.app/api/index.php', // aquí va el backend real y también se cambia en el index linea 14
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/index.php/api'),
      },
    },
  },
})

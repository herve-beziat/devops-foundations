import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // équivalent à --host
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
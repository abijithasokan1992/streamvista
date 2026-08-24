import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? './' : '/',
  server: { proxy: { '/api': 'http://localhost:3000' } },
  plugins: [
    react(),
    tailwindcss(),
  ],
})

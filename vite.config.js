import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   base: '/',   // 👈 Keep this (important for Vercel)
  build: {
    outDir: 'dist'
  },
  define: {
    global: "window",   // 👈 ye line important hai
    "process.env": {},   
  },
})

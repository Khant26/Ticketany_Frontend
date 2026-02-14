import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Ensure environment variables are accessible via import.meta.env
    'process.env': JSON.stringify(process.env)
  },
  server: {
    historyApiFallback: true
  }
})

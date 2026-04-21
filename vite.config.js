import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/dev-tools/',
  server: {
    watch: {
      usePolling: true,
    }
  }
})
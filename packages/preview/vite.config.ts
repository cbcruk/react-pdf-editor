import { defineConfig } from 'vite-plus'
import react from '@vitejs/plugin-react'
import { migratePlugin } from './migrate-plugin.ts'

export default defineConfig({
  plugins: [react(), migratePlugin()],
})

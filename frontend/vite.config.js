import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { sessionDbPlugin } from './sessionDbPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sessionDbPlugin()],
})

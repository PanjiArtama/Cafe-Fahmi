import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    onConsoleLog(log, type) {
      if (log.includes('was not wrapped in act(...)')) return false;
      if (log.includes('Each child in a list should have a unique "key" prop.')) return false;
    }
  }
})

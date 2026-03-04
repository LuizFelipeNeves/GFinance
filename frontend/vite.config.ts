import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('react/')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack') || id.includes('sonner') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-form';
            }
            if (id.includes('papaparse')) {
              return 'vendor-csv';
            }
          }
        },
      },
    },
  },
})

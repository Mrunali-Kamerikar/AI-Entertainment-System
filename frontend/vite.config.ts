import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Server configuration for development
  server: {
    host: true, // Listen on all network interfaces
    port: 5173,
    strictPort: false,
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'ui-vendor': ['motion', 'lucide-react'],
          'charts-vendor': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // Environment variable configuration
  // Vite exposes env variables that start with VITE_ to the client
  envPrefix: 'VITE_',
})

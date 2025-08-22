import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  publicDir: 'public',
  server: {
    middleware: [
      // This middleware runs before React Router
      (req, res, next) => {
        // Log all requests for debugging
        console.log(`🔍 Request: ${req.method} ${req.url}`)
        
        // Handle the farcaster.json endpoint specifically
        if (req.url === '/.well-known/farcaster.json') {
          console.log('✅ Serving farcaster.json')
          try {
            // Read the file from the public directory
            const farcasterPath = join(__dirname, 'public', 'farcaster.json')
            console.log('📁 Reading from:', farcasterPath)
            
            const farcasterContent = readFileSync(farcasterPath, 'utf-8')
            console.log('📄 Content length:', farcasterContent.length)
            
            // Set proper headers
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Cache-Control', 'no-cache')
            
            // Send the response and end here - don't call next()
            console.log('📤 Sending response')
            res.end(farcasterContent)
            return
          } catch (error) {
            console.error('❌ Error serving farcaster.json:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to serve farcaster.json' }))
            return
          }
        }
        
        // For all other requests, continue to the next middleware/plugin
        console.log('➡️ Continuing to next middleware')
        next()
      }
    ]
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
  ],
  server: {
    cors: true,
    https: {
      key: fs.readFileSync('./.certs/key.pem'),
      cert: fs.readFileSync('./.certs/cert.pem'),
    },
    headers: {
      'Access-Control-Allow-Origin': 'https://www.owlbear.rodeo',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  },
})

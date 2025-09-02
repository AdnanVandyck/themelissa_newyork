// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     host: true
//   }
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { webcrypto } from 'node:crypto'

// // Polyfill for Node.js 16
// if (!globalThis.crypto) {
//   globalThis.crypto = webcrypto
// }

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     host: true
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'node:crypto'

// More explicit polyfill for Node.js 16
if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto
}
// Also ensure getRandomValues is available
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = crypto.webcrypto.getRandomValues
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
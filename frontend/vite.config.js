import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const backendEnvDir = fileURLToPath(new URL('../backend', import.meta.url))

export default defineConfig(({ mode }) => {
  const backendEnv = loadEnv(mode, backendEnvDir, '')
  const apiTarget = process.env.API_PROXY_TARGET || backendEnv.API_PROXY_TARGET || `http://localhost:${backendEnv.PORT || 5000}`

  return {
    plugins: [react()],
    server: { port: 5173, proxy: { '/api': apiTarget } },
  }
})

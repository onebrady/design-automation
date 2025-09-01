import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    {
      name: 'agentic-server-manager',
      configureServer(server) {
        let child: ChildProcess | null = null
        const isRunning = () => !!(child && child.exitCode === null)

        server.middlewares.use('/manage/status', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ running: isRunning(), pid: child?.pid || null }))
        })

        server.middlewares.use('/manage/start', async (_req, res) => {
          if (!isRunning()) {
            child = spawn(process.execPath, ['apps/server/index.js'], {
              stdio: ['ignore','pipe','pipe'],
              env: process.env,
              cwd: process.cwd()
            })
            const fs = await import('fs')
            const log = 'logs/server-dev.log'
            fs.mkdirSync('logs', { recursive: true })
            child.stdout?.on('data', (d)=>fs.appendFileSync(log, d))
            child.stderr?.on('data', (d)=>fs.appendFileSync(log, d))
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true, running: isRunning(), pid: child?.pid || null }))
        })

        server.middlewares.use('/manage/stop', (_req, res) => {
          if (child && child.exitCode === null) child.kill()
          child = null
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true, running: false }))
        })
      }
    }
  ],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8901', changeOrigin: true }
    }
  }
})

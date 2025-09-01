import { test, expect } from '@playwright/test'
import { spawn, ChildProcess } from 'child_process'
import http from 'http'

async function waitForHttp(url: string, timeoutMs = 8000) {
  const start = Date.now()
  return new Promise<void>((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, res => {
        res.resume()
        if (res.statusCode && res.statusCode < 500) return resolve()
        retry()
      })
      req.on('error', retry)
      function retry(){
        if (Date.now() - start > timeoutMs) reject(new Error('timeout'))
        else setTimeout(attempt, 250)
      }
    }
    attempt()
  })
}

test('dashboard screenshot with styles', async ({ page }) => {
  // Start backend
  const server: ChildProcess = spawn(process.execPath, ['apps/server/index.js'], { stdio: 'ignore' })
  await waitForHttp('http://localhost:3001/api/health', 15000)

  // Dev server (simpler in CI env)
  const preview: ChildProcess = spawn('pnpm', ['-C','apps/studio','dev','--port','4173','--strictPort'], { stdio: 'ignore' })
  await waitForHttp('http://localhost:4173', 20000)

  await page.goto('/')
  await page.getByText('Dashboard').first().waitFor()
  // Give time for health/context to load
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'reports/playwright/dashboard.png', fullPage: true })

  // Teardown
  preview.kill()
  server.kill()
})

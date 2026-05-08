import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import type { Connect } from 'vite'

function devApiMiddleware(): { name: string; configureServer: (server: any) => void } {
  return {
    name: 'dev-api-middleware',
    configureServer(server: any) {
      // Save entries to JSON file
      server.middlewares.use('/api/save-entries', (req: Connect.IncomingMessage, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        let body = ''
        req.on('data', (chunk: string) => { body += chunk })
        req.on('end', () => {
          try {
            const { citySlug, entries } = JSON.parse(body)
            const filePath = path.resolve(__dirname, `src/data/${citySlug}.json`)
            fs.writeFileSync(filePath, JSON.stringify(entries, null, 2))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })

      // Save photo to public/photos/
      server.middlewares.use('/api/save-photo', (req: Connect.IncomingMessage, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        let body = ''
        req.on('data', (chunk: string) => { body += chunk })
        req.on('end', () => {
          try {
            const { entryId, dataUrl } = JSON.parse(body)
            const photosDir = path.resolve(__dirname, 'public/photos')
            if (!fs.existsSync(photosDir)) {
              fs.mkdirSync(photosDir, { recursive: true })
            }
            // Strip data URL prefix and write binary
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
            const filePath = path.join(photosDir, `${entryId}.jpg`)
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ path: `/photos/${entryId}.jpg` }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })

      // Save itineraries to JSON file
      server.middlewares.use('/api/save-itineraries', (req: Connect.IncomingMessage, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }
        let body = ''
        req.on('data', (chunk: string) => { body += chunk })
        req.on('end', () => {
          try {
            const { citySlug, itineraries } = JSON.parse(body)
            const filePath = path.resolve(__dirname, `src/data/${citySlug}-itineraries.json`)
            fs.writeFileSync(filePath, JSON.stringify(itineraries, null, 2))
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiMiddleware()],
})

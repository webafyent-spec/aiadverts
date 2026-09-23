// Local test harness for the forms: serves the built site from dist/ and routes
// /api/contact through the real handler with a recording mail sender, so forms can
// be driven in a browser without sending real email. Run `npm run build` first.
//   GET  /__test/last            -> last raw JSON payload received + the email that would be sent
//   GET  /__test/mode?set=ok|fail|unconfigured  -> switch the fake provider's outcome
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHandler } from '../api/_lib/handler.js'

const PORT = Number(process.env.PORT || 4400)
const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' }

let mode = 'ok'
let lastPayload = null
let lastEmail = null

const send = async (msg) => {
  lastEmail = { replyTo: msg.replyTo, subject: msg.subject, text: msg.text }
  if (mode === 'fail') return { ok: false, reason: 'send_failed', provider: 'test' }
  if (mode === 'unconfigured') return { ok: false, reason: 'not_configured', provider: 'none' }
  return { ok: true, provider: 'test' }
}
const api = createHandler({ send, allowedOrigins: [`http://localhost:${PORT}`] })

const readBody = (req) => new Promise((resolve) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
})

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (url.pathname === '/api/contact') {
    if (req.method === 'POST') {
      const raw = await readBody(req)
      lastPayload = raw
      req.body = raw
    }
    return api(req, res)
  }
  if (url.pathname === '/__test/last') {
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ mode, payload: lastPayload ? JSON.parse(lastPayload) : null, email: lastEmail }))
  }
  if (url.pathname === '/__test/mode') {
    mode = url.searchParams.get('set') || 'ok'
    lastPayload = null
    lastEmail = null
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ mode }))
  }

  let file = path.join(DIST, decodeURIComponent(url.pathname))
  if (!path.extname(file)) file = path.join(file, 'index.html')
  if (!file.startsWith(DIST) || !fs.existsSync(file)) {
    res.statusCode = 404
    return res.end('Not found')
  }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream')
  fs.createReadStream(file).pipe(res)
}).listen(PORT, () => console.log(`forms harness on http://localhost:${PORT}`))

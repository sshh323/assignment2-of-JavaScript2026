// A tiny static file server so the game can be played with `npm start`.
// Uses only Node.js built-in modules.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    let pathname = decodeURIComponent(url.pathname)
    if (pathname === '/') pathname = '/index.html'

    const filePath = normalize(join(root, pathname))
    if (!filePath.startsWith(resolve(root) + sep) && filePath !== resolve(root)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' })
      res.end('Forbidden')
      return
    }

    const data = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
})

const PORT = process.env.PORT ?? 3000
server.listen(PORT, () => {
  console.log(`🧙 Adventure game running at http://localhost:${PORT}`)
})

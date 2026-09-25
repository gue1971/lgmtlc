import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8788);
const assets = new Map([
  ['/index.html', 'text/html; charset=utf-8'],
  ['/style.css', 'text/css; charset=utf-8'],
  ['/app.js', 'text/javascript; charset=utf-8'],
  ['/data.js', 'text/javascript; charset=utf-8'],
  ['/sw.js', 'text/javascript; charset=utf-8'],
  ['/manifest.webmanifest', 'application/manifest+json'],
  ['/icons/icon-192.png', 'image/png'],
  ['/icons/icon-512.png', 'image/png'],
  ['/icons/icon-maskable-512.png', 'image/png'],
  ['/icons/apple-touch-icon.png', 'image/png']
]);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be between 1 and 65535');
}

createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const asset = path === '/' ? '/index.html' : path;
  const contentType = assets.get(asset);
  if (!contentType || (req.method !== 'GET' && req.method !== 'HEAD')) {
    res.writeHead(404).end();
    return;
  }

  try {
    const body = await readFile(join(root, asset.slice(1)));
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': body.length,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Lingua PWA: http://127.0.0.1:${port}/`);
});

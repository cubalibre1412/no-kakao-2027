import http from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const args = process.argv.slice(2);
const portIndex = args.findIndex(value => value === '--port' || value === '-p');
const inlinePort = args.find(value => value.startsWith('--port='))?.split('=')[1];
const port = Number(portIndex >= 0 ? args[portIndex + 1] : inlinePort || process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8'
};
export const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache');
  const reply = (status, message) => { res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(message); };
  if (req.method !== 'GET' && req.method !== 'HEAD') { reply(405, 'Method not allowed'); return; }
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/healthz') { reply(200, 'ok'); return; }
    // Support both root serving and direct navigation to the original dist folder.
    if (pathname === '/dist') pathname = '/';
    else if (pathname.startsWith('/dist/')) pathname = pathname.slice(5);
    if (pathname.includes('\0') || pathname.includes('\\')) { reply(400, 'Invalid path'); return; }
    if (pathname.endsWith('/')) pathname += 'index.html';
    const filename = path.resolve(root, '.' + pathname);
    if (!filename.startsWith(root)) { reply(403, 'Forbidden'); return; }
    const info = await stat(filename);
    if (!info.isFile()) { reply(404, 'Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(filename).toLowerCase()] || 'application/octet-stream', 'Content-Length': info.size });
    res.end(req.method === 'HEAD' ? undefined : await readFile(filename));
  } catch (error) {
    if (res.headersSent) { res.destroy(); return; }
    reply(error instanceof URIError ? 400 : error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500, 'Unable to serve file');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Kakao profile badge ready on http://0.0.0.0:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));

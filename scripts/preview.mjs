import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const distDir = resolve('dist');
const port = 4173;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm'
};

const server = createServer((req, res) => {
  const url = req.url && req.url !== '/' ? req.url : '/index.html';
  const filePath = join(distDir, url);

  try {
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      res.writeHead(301, { Location: `${url}/` });
      res.end();
      return;
    }

    const stream = createReadStream(filePath);
    const type = mimeTypes[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    stream.pipe(res);
  } catch (error) {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Preview server running at http://0.0.0.0:${port}`);
});

import { mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import esbuild from 'esbuild';

const distDir = resolve('dist');
const assetFile = resolve(distDir, 'assets/main.js');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(resolve(distDir, 'assets'), { recursive: true });
copyFileSync(resolve('index.html'), resolve(distDir, 'index.html'));

await esbuild.build({
  entryPoints: [resolve('src/main.tsx')],
  outfile: assetFile,
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  minify: true,
  sourcemap: false,
  alias: {
    '@': resolve('src')
  },
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});

console.log('Build completed.');

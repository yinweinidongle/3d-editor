import { mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import esbuild from 'esbuild';

const distDir = resolve('dist');
const assetFile = resolve(distDir, 'assets/main.js');

mkdirSync(resolve(distDir, 'assets'), { recursive: true });
copyFileSync(resolve('index.html'), resolve(distDir, 'index.html'));

esbuild
  .serve(
    {
      servedir: distDir,
      port: 5173,
      host: '0.0.0.0'
    },
    {
      entryPoints: [resolve('src/main.tsx')],
      outfile: assetFile,
      bundle: true,
      sourcemap: true,
      format: 'esm',
      jsx: 'automatic',
      alias: {
        '@': resolve('src')
      },
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx'
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('development')
      }
    }
  )
  .then(({ host, port }) => {
    console.log(`Dev server running at http://${host}:${port}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

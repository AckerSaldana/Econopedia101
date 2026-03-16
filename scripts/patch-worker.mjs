/**
 * Post-build script: Injects a MessageChannel polyfill into the Cloudflare Worker
 * chunks so React 19 SSR works without nodejs_compat.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const POLYFILL = `if(typeof globalThis.MessageChannel==="undefined"){globalThis.MessageChannel=class{constructor(){this.port1={onmessage:null,postMessage(d){if(this._other.onmessage)this._other.onmessage({data:d})}};this.port2={onmessage:null,postMessage(d){if(this._other.onmessage)this._other.onmessage({data:d})}};this.port1._other=this.port2;this.port2._other=this.port1;}};}\n`;

const chunksDir = join(process.cwd(), 'dist', '_worker.js', 'chunks');

const files = await readdir(chunksDir);
let patched = 0;

for (const file of files) {
  if (file.includes('astro-renderers') && file.endsWith('.mjs')) {
    const filePath = join(chunksDir, file);
    const content = await readFile(filePath, 'utf-8');
    await writeFile(filePath, POLYFILL + content);
    patched++;
    console.log(`Patched: ${file}`);
  }
}

if (patched === 0) {
  console.warn('Warning: No astro-renderer chunks found to patch');
} else {
  console.log(`MessageChannel polyfill injected into ${patched} file(s)`);
}

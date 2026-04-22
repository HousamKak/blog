import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

// Dev-only endpoints used by /tools/hero-composer.
//   POST /api/save-media    → writes a composed image to public/media/<dir>/<file>
//   POST /api/upload-media  → stashes an uploaded source into public/media/uploads/<file>
//   GET  /api/list-media    → lists everything under public/media/ recursively
// Attached to the Vite dev server only (apply:'serve'), so nothing of this
// ships in the production static build.
import { readdir, stat } from 'node:fs/promises';

const MEDIA_ROOT_REL = ['public', 'media'];
const SAFE_EXT = /^(png|jpe?g|webp)$/i;
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function resolveSafe(dirParam, fileParam, rootCwd) {
  const mediaRoot = resolve(rootCwd, ...MEDIA_ROOT_REL);
  const extMatch = /\.([A-Za-z0-9]+)$/.exec(fileParam || '');
  if (!extMatch || !SAFE_EXT.test(extMatch[1])) return { err: 'extension must be png/jpg/jpeg/webp' };
  if (!SAFE_NAME.test(fileParam)) return { err: 'filename has unsafe characters' };

  const dir = (dirParam || '').replace(/^\/+|\/+$/g, '');
  if (dir) {
    const parts = dir.split('/');
    for (const p of parts) {
      if (p === '..' || p === '.' || p === '' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(p)) {
        return { err: 'unsafe dir segment: ' + p };
      }
    }
  }

  const outPath = dir
    ? resolve(mediaRoot, ...dir.split('/'), fileParam)
    : resolve(mediaRoot, fileParam);
  const rel = outPath.slice(mediaRoot.length);
  if (!outPath.startsWith(mediaRoot + (rel.startsWith('/') || rel.startsWith('\\') ? '' : ''))) {
    return { err: 'path escapes media root' };
  }
  return { outPath, mediaRoot };
}

async function readBody(req, limit) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > limit) throw new Error('payload too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function walkMedia(dir, baseLen) {
  const out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) {
      const nested = await walkMedia(p, baseLen);
      out.push(...nested);
    } else if (e.isFile() && /\.(png|jpe?g|webp|gif|svg)$/i.test(e.name)) {
      const s = await stat(p);
      out.push({ path: '/media' + p.slice(baseLen).replace(/\\/g, '/'), size: s.size });
    }
  }
  return out;
}

const mediaComposerDevApi = {
  name: 'media-composer-dev-api',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url) return next();
      const url = new URL(req.url, 'http://localhost');

      // ---- SAVE composed image (POST image/* body)
      if (req.method === 'POST' && url.pathname === '/api/save-media') {
        try {
          const filename = url.searchParams.get('filename') || '';
          const dir = url.searchParams.get('dir') || 'posts/kiddycody';
          const r = resolveSafe(dir, filename, process.cwd());
          if (r.err) { res.statusCode = 400; res.end(r.err); return; }
          const body = await readBody(req, 15 * 1024 * 1024);
          if (body.length === 0) { res.statusCode = 400; res.end('empty body'); return; }
          await mkdir(dirname(r.outPath), { recursive: true });
          await writeFile(r.outPath, body);
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: true, path: '/media' + r.outPath.slice(r.mediaRoot.length).replace(/\\/g, '/'), bytes: body.length }));
        } catch (e) {
          res.statusCode = 500;
          res.end(String(e && e.message ? e.message : e));
        }
        return;
      }

      // ---- UPLOAD a source image into public/media/uploads/
      if (req.method === 'POST' && url.pathname === '/api/upload-media') {
        try {
          const filename = url.searchParams.get('filename') || '';
          const dir = url.searchParams.get('dir') || 'uploads';
          const r = resolveSafe(dir, filename, process.cwd());
          if (r.err) { res.statusCode = 400; res.end(r.err); return; }
          const body = await readBody(req, 25 * 1024 * 1024);
          if (body.length === 0) { res.statusCode = 400; res.end('empty body'); return; }
          await mkdir(dirname(r.outPath), { recursive: true });
          await writeFile(r.outPath, body);
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: true, path: '/media' + r.outPath.slice(r.mediaRoot.length).replace(/\\/g, '/'), bytes: body.length }));
        } catch (e) {
          res.statusCode = 500;
          res.end(String(e && e.message ? e.message : e));
        }
        return;
      }

      // ---- LIST images under public/media/ for the source gallery
      if (req.method === 'GET' && url.pathname === '/api/list-media') {
        try {
          const mediaRoot = resolve(process.cwd(), ...MEDIA_ROOT_REL);
          const items = await walkMedia(mediaRoot, mediaRoot.length);
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ items }));
        } catch (e) {
          res.statusCode = 500;
          res.end(String(e && e.message ? e.message : e));
        }
        return;
      }

      next();
    });
  },
};

export default defineConfig({
  site: 'https://blog.housamkak.com',
  integrations: [
    mdx(),
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss(), mediaComposerDevApi],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

// Dev-only POST endpoint used by /tools/kiddycody-hero to save the composed
// thumbnail directly to public/. Attached to the Vite dev server only — adds
// nothing to the production build.
const kiddycodyHeroSaver = {
  name: 'kiddycody-hero-saver',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.method !== 'POST' || !req.url || !req.url.startsWith('/api/save-kiddycody-hero')) {
        return next();
      }
      try {
        const url = new URL(req.url, 'http://localhost');
        const filename = url.searchParams.get('filename') || 'hero-logo-terrain.png';
        const allowed = new Set(['hero-logo-terrain.png', 'hero-logo-terrain-alt.png']);
        if (!allowed.has(filename)) {
          res.statusCode = 400;
          res.end('Filename not allowed: ' + filename);
          return;
        }
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = Buffer.concat(chunks);
        if (body.length === 0) { res.statusCode = 400; res.end('Empty body'); return; }
        if (body.length > 10 * 1024 * 1024) { res.statusCode = 413; res.end('Too large'); return; }
        const outPath = resolve(process.cwd(), 'public', 'media', 'posts', 'kiddycody', filename);
        await mkdir(dirname(outPath), { recursive: true });
        await writeFile(outPath, body);
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ ok: true, path: outPath, bytes: body.length }));
      } catch (e) {
        res.statusCode = 500;
        res.end(String(e && e.message ? e.message : e));
      }
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
    plugins: [tailwindcss(), kiddycodyHeroSaver],
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

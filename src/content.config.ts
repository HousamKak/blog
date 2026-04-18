import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const themeEnum = z.enum(['default', 'pixel']).default('default');
const langEnum = z.enum(['en', 'ar']).default('en');

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    lang: langEnum,
    draft: z.boolean().default(false),
    theme: themeEnum,
  }),
});

const papers = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/papers' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    authors: z.array(z.string()),
    pdfUrl: z.string(),
    tags: z.array(z.string()).default([]),
    venue: z.string().optional(),
    doi: z.string().optional(),
    publications: z.array(z.object({
      name: z.string(),
      url: z.string().optional(),
    })).default([]),
    lang: langEnum,
    draft: z.boolean().default(false),
    theme: themeEnum,
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: langEnum,
    draft: z.boolean().default(false),
    theme: themeEnum,
  }),
});

const renders = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/renders' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    thumbnail: z.string(),
    mediaType: z.enum(['2d', '3d']),
    mediaUrl: z.string(),
    tags: z.array(z.string()).default([]),
    software: z.string().optional(),
    lang: langEnum,
    draft: z.boolean().default(false),
    theme: themeEnum,
  }),
});

const library = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/library' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    thumbnail: z.string(),
    tags: z.array(z.string()).default([]),
    lang: langEnum,
    draft: z.boolean().default(false),
    theme: themeEnum,
  }),
});

const frontpages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/frontpages' }),
  schema: z.object({
    title: z.string(),
    edition: z.string(),              // "Vol. I", "Vol. II", etc.
    pubDate: z.coerce.date(),
    description: z.string(),
    thumbnail: z.string(),            // snapshot image of the frontpage
    tagline: z.string().optional(),   // a line printed under the title
    tags: z.array(z.string()).default([]),
    lang: langEnum,
    draft: z.boolean().default(false),
    theme: themeEnum,
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    thumbnail: z.string().optional(),
    url: z.string().url().optional(),        // external repo or live link
    status: z.enum(['active', 'shipped', 'archived', 'wip']).default('active'),
    tags: z.array(z.string()).default([]),
    lang: langEnum,
    draft: z.boolean().default(false),
    theme: themeEnum,
  }),
});

export const collections = { posts, papers, notes, renders, library, frontpages, projects };

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryIds } from './data/categories';

// One YAML file per document, written by the admin page (Sveltia CMS), e.g.:
//   title: Regulamentul intern 2026–2027
//   category: organizare
//   date: 2026-10-16
//   file: /fisiere/regulamentul-intern-2026-2027.pdf
const documente = defineCollection({
  loader: glob({ pattern: '**/*.{yml,yaml}', base: './src/content/documente' }),
  schema: z.object({
    title: z.string().min(1),
    category: z.enum(categoryIds),
    date: z.coerce.date(),
    file: z
      .string()
      .regex(/^(\/fisiere\/|https:\/\/)/, 'Must be an uploaded file (/fisiere/...) or an https:// link'),
    description: z.string().nullish(),
  }),
});

export const collections = { documente };

import type { APIRoute } from 'astro';
import { categories } from '../../data/categories';
import { site } from '../../data/site';
import { MAX_FILE_SIZE } from '../../lib/documents';

// Sveltia CMS configuration for the admin page (/admin/), generated at build time so the
// category dropdown always matches src/data/categories.ts. JSON is valid YAML, so the CMS
// reads it like a regular config.yml. Docs: https://sveltiacms.app/en/docs
const config = {
  app_title: 'Administrare documente · Liceul „Max Ausnit”',
  logo: { src: '/favicon.svg' },
  backend: {
    name: 'github',
    repo: site.repo,
    branch: 'main',
    // GitHub sign-in is handled by this site's own Worker (worker/index.ts).
    base_url: site.url,
    auth_endpoint: 'oauth/authorize',
  },
  site_url: site.url,
  media_folder: 'public/fisiere',
  public_folder: '/fisiere',
  media_libraries: {
    default: {
      config: { max_file_size: MAX_FILE_SIZE, slugify_filename: true },
    },
  },
  slug: { encoding: 'ascii', clean_accents: true },
  output: { omit_empty_optional_fields: true },
  collections: [
    {
      name: 'documente',
      label: 'Documente',
      label_singular: 'Document',
      description: 'Documentele de interes public afișate pe pagina /documente/ a site-ului.',
      folder: 'src/content/documente',
      format: 'yml',
      create: true,
      delete: true,
      slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
      sortable_fields: {
        fields: ['date', 'title', 'category'],
        default: { field: 'date', direction: 'descending' },
      },
      view_filters: categories.map((category) => ({
        label: category.label,
        field: 'category',
        pattern: `^${category.id}$`,
      })),
      editor: { preview: false },
      fields: [
        {
          name: 'title',
          label: 'Titlu',
          widget: 'string',
          hint: 'Așa cum va apărea pe site, de exemplu „Regulamentul intern 2026–2027”.',
        },
        {
          name: 'category',
          label: 'Categorie',
          widget: 'select',
          options: categories.map((category) => ({ label: category.label, value: category.id })),
        },
        {
          name: 'date',
          label: 'Data publicării',
          widget: 'datetime',
          type: 'date',
          default: '{{now}}',
        },
        {
          name: 'file',
          label: 'Fișier',
          widget: 'file',
          choose_url: false,
          hint: 'De preferat PDF. Dimensiune maximă: 25 MB.',
        },
        {
          name: 'description',
          label: 'Descriere',
          widget: 'text',
          required: false,
          hint: 'Opțional. Apare sub titlu, pe site.',
        },
      ],
    },
  ],
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(config, null, 2), {
    headers: { 'Content-Type': 'text/yaml; charset=utf-8' },
  });

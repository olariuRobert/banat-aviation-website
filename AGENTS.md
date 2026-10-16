## Project

Website of Liceul Tehnologic „Max Ausnit” Caransebeș (Romanian only), deployed to Cloudflare Workers from `main`.

- Documents: one YAML entry per document in `src/content/documente/` (schema in `src/content.config.ts`), files in
  `public/fisiere/`. Staff publish them through Sveltia CMS at `/admin/`, which commits to this repo.
- `src/pages/admin/config.yml.ts` generates the CMS config; categories come from `src/data/categories.ts`.
- `worker/index.ts` only handles GitHub OAuth for the CMS (`/oauth/*`); everything else is static assets.
- Run `npm run check` (Astro + Worker types) and `npm run build` before committing.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

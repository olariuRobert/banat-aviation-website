# Liceul Tehnologic „Max Ausnit” Caransebeș

Website of the aviation high school at Banat Airport Caransebeș: <https://banataviation.ro>

- Static [Astro](https://astro.build) site, served by Cloudflare Workers (static assets).
- Documents of public interest are published from the admin page at `/admin/` ([Sveltia CMS](https://sveltiacms.app)).
  Every upload is a commit to this repository, and Cloudflare redeploys the site automatically.

## Publicarea documentelor (ghid pentru personal)

1. Deschideți <https://banataviation.ro/admin/> și apăsați **Sign In with GitHub**.
2. Alegeți **Documente** → **New Document**.
3. Completați titlul, categoria și data publicării, apoi încărcați fișierul (de preferat PDF, maxim 25 MB).
4. Apăsați **Save**. Documentul apare pe site în 1–2 minute.

Pentru a modifica sau șterge un document, deschideți-l din listă. Fiecare persoană are nevoie de un cont GitHub,
adăugat ca colaborator la acest repository (Settings → Collaborators).

## Development

```sh
npm install
npm run dev       # http://localhost:4321 (admin page: /admin/index.html)
npm run preview   # build, then serve the site and Worker with wrangler at http://localhost:8787
npm run check     # type-check the site and the Worker
```

- Site details (name, contact info, navigation): `src/data/site.ts`. Empty contact fields are hidden.
- Document categories: `src/data/categories.ts`. The admin page's category dropdown is generated from it.
- Documents are YAML files in `src/content/documente/` pointing to files in `public/fisiere/`. The build fails if a
  referenced file is missing or larger than 25 MB (Cloudflare's per-file limit).
- To try the admin page without GitHub sign-in, open <http://localhost:4321/admin/index.html> in Chrome or Edge and
  choose **Work with Local Repository**.

## Deployment (one-time setup)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → this repository.
   Build command `npm run build`, deploy command `npx wrangler deploy`. Every push to `main` deploys.
2. Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**: `banataviation.ro`, then
   `www.banataviation.ro`.
3. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**:
   - Homepage URL: `https://banataviation.ro`
   - Authorization callback URL: `https://banataviation.ro/oauth/redirect`
4. Worker → **Settings** → **Variables and Secrets**: add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (type
   Secret) from the OAuth app.

## Structure

```
src/data/site.ts           name, contact details, navigation
src/data/categories.ts     document categories
src/content/documente/     one .yml per document (written by the admin page)
src/content.config.ts      document schema
src/lib/documents.ts       loading, grouping and file checks for documents
src/pages/                 home, /documente/, /confidentialitate/, 404, /admin/config.yml
public/admin/index.html    Sveltia CMS
public/fisiere/            uploaded documents
worker/index.ts            GitHub sign-in for the admin page (/oauth/*)
wrangler.jsonc             Cloudflare Worker configuration
```

# Alkinum Official

Official open-source website for [Alkinum](https://github.com/alkinum), an organization fusing code with creativity to spark digital alchemy.

The site is a full-viewport Astro experience with a Svelte and Three.js interactive rendering of the Alkinum mark.

## Features

- Server-rendered, crawlable Astro HTML
- Svelte-powered navigation and About drawer
- Three.js sphere model based on the official GitHub organization icon
- Off-main-thread Three.js and procedural grain rendering with OffscreenCanvas
- Responsive desktop and mobile composition
- Fine, low-saturation procedural color film grain with no repeating motion path
- Open Graph, Twitter Card, JSON-LD, sitemap, robots, and canonical metadata
- Cloudflare Workers Static Assets deployment and GitHub Actions workflow

## Technology

- Astro 7
- Svelte 5
- Three.js
- TypeScript
- Cloudflare Workers Static Assets and Wrangler

## Local development

Node.js 24 or newer is recommended.

```bash
npm install
npm run dev
```

The Astro development server is available at `http://localhost:4321` by default.

## Commands

| Command                     | Purpose                                                |
| --------------------------- | ------------------------------------------------------ |
| `npm run dev`               | Start the Astro development server                     |
| `npm run build`             | Type-check and build the production site               |
| `npm run preview`           | Preview the Astro production build                     |
| `npm run format`            | Format project files                                   |
| `npm run cloudflare:whoami` | Verify Cloudflare authentication                       |
| `npm run cloudflare:dev`    | Run the production output in the local Workers runtime |
| `npm run cloudflare:deploy` | Build and deploy to Cloudflare Workers                 |

## Domains and SEO

The final site is intended to be served directly from both root domains:

- `https://alkinum.io`
- `https://alkinum.com`

Both domains are configured as Custom Domains for the same `alkinum-official-site` Worker. Cloudflare creates and manages their DNS records and certificates. No domain redirect is configured. `alkinum.io` remains the canonical SEO URL so search engines treat both hosts as one site.

The generated sitemap and structured data also use `https://alkinum.io` as the canonical origin.

## Cloudflare Workers

The project is configured through [`wrangler.jsonc`](./wrangler.jsonc). Account identifiers and credentials are intentionally excluded from the repository.

Authenticate once:

```bash
npm run cloudflare:whoami
npx wrangler login
```

Select the deployment account at runtime without writing it to a tracked file:

```bash
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

Preview the production output locally:

```bash
npm run cloudflare:dev
```

Deploy:

```bash
npm run cloudflare:deploy
```

The `wrangler.jsonc` file deploys `dist/` through Workers Static Assets with nearest `404.html` handling. Its Custom Domain routes attach both `alkinum.io` and `alkinum.com` directly, while `_headers` configures security headers and long-lived caching for hashed assets.

For CI, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to the GitHub repository secrets. The token needs Account Read, Workers Scripts Edit, and Workers Routes Edit permissions. The included workflow builds every push to `main` and deploys when both secrets are available.

## Project structure

```text
src/components/Experience.svelte  Interactive Svelte UI
src/lib/                           Rendering controllers and Three.js scene
src/workers/                       OffscreenCanvas rendering workers
src/layouts/BaseLayout.astro       Shared SEO and document metadata
src/pages/index.astro              Home page and structured data
src/pages/404.astro                Custom noindex error page
public/                            Static assets, headers, robots, and manifest
```

The production UI is server-rendered so core content remains visible before JavaScript loads. Three.js shader compilation and continuously randomized grain generation run in workers on supported browsers, keeping the main thread available for navigation and drawer interactions. Browsers without OffscreenCanvas use a dynamically loaded fallback.

## Contributing

Issues and pull requests are welcome. Keep changes focused, preserve accessibility and responsive behavior, and run the following before submitting:

```bash
npm run format
npm run build
```

## License

Copyright (c) 2026 Alkinum.

The source code and repository-owned site assets are released under the [MIT License](./LICENSE). Third-party packages remain under their respective licenses.

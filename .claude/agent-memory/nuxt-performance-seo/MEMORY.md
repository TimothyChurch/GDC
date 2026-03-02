# Nuxt Performance & SEO Memory

## Project Architecture
- See CLAUDE.md for full project structure
- Public pages need SEO: homepage, bottles, cocktails, visit, about
- Admin pages (`/admin/**`) don't need SEO
- Chart.js registered in `plugins/chartjs.ts`
- Images via Cloudinary and `public/images/`

## Implemented Optimizations
- SEO meta added to all public pages (Phase 3 of improvements)
- `@nuxt/image` module installed and configured
- Hybrid rendering via `routeRules` in nuxt.config.ts:
  - Static pages prerendered (`/`, `/about`, `/privacy`, `/contact`)
  - SWR caching on API routes and admin pages
- Route rules configured for SSR/SSG/SWR as appropriate

## Notes
- Record performance findings, bundle analysis results, and SEO audit results here

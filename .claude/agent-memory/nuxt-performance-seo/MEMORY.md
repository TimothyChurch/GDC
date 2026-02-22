# Nuxt Performance & SEO Memory

## Project Architecture
- See CLAUDE.md for full project structure
- Public pages need SEO: homepage, bottles, cocktails, visit, about
- Admin pages (`/admin/**`) don't need SEO
- Chart.js registered in `plugins/chartjs.ts`
- Images via Cloudinary and `public/images/`

## Key Patterns
- SEO meta already added to public pages (Phase 3 of improvements)
- No hybrid rendering configured yet (all routes use default SSR)
- No @nuxt/image module installed yet

## Notes
- Record performance findings, bundle analysis results, and SEO audit results here

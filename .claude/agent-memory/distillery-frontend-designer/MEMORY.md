# GDC Frontend Designer Memory

## Project Structure (Public-Facing)

### Public Pages
- `pages/index.vue` -- Homepage: SiteHero, SiteCategories, SiteNewsletter
- `pages/menu.vue` -- Cocktail menu: search filter + CardCocktail grid
- `pages/bottles.vue` -- Bottle list: CardBottle grid (flat file, no detail routes yet)
- `pages/events.vue` -- Parent route with `<NuxtPage />`
- `pages/events/index.vue` -- Skeleton events page (barely started)
- `pages/events/cocktailClass.vue` -- Stripe checkout embed
- `pages/login.vue` -- Admin login
- `pages/calculator.vue` -- Proofing calculator (admin tool)

### Public Components
- `components/Site/SiteHeader.vue` -- Logo + nav, Events commented out, mobile dropdown
- `components/Site/SiteFooter.vue` -- 3-col grid, hidden on mobile (`hidden sm:grid`)
- `components/Site/SiteHero.vue` -- Split hero, uses wrong `public/images/hero.jpg` path
- `components/Site/SiteCategories.vue` -- 3 cards with placeholder nonsense descriptions
- `components/Site/SiteNewsletter.vue` -- Email signup, uses indigo colors
- `components/Card/CardCocktail.vue` -- Name, price, ingredients (minimal)
- `components/Card/CardBottle.vue` -- UCard: name, price, class/type (no image, no link)
- `components/Modal/ModalAge.vue` -- Age gate modal

### Design System
- **Color tokens** in `assets/css/main.css` and `assets/css/theme.css`
- Light bg: `#f3e2c6`, Dark bg: `#1a120c`, Gold: `#d6b169`, Copper: `#b88a4f`
- Fonts: Merriweather (body via `--font-primary`), Cormorant Garamond (h1-h4 in theme.css)
- Problem: several components use hardcoded `gray-*` and `indigo-*` Tailwind classes

### Data Models (Public-Relevant)
- **Bottle**: `_id, name, class, type, abv, price, img, description, recipe(ObjectId), inStock`
- **Cocktail**: `_id, name, glassware, ingredients[{item,amount,unit}], cost, price, menu, description, directions, visible`
- **Item**: `_id, name, type, brand, vendor, inventoryUnit, pricePerUnit`
- Cocktail `menu` field = category for filtering (e.g., "Signature", "Classic")
- Bottle `img` field exists but CardBottle never renders it

### Utilities
- `Dollar` formatter in `utils/formatting.ts` -- auto-imported
- `ageVerified` ref in `composables/status.ts` -- auto-imported
- `isDark` / `toggleDark` in `composables/dark.ts` -- VueUse useDark
- `liquorClasses` in `composables/definitions.ts` -- spirit class/type definitions

### Images Available
- `public/images/`: Logo.png, MainLogo.png, hero.jpg, cocktail.jpg, absinthe.jpg, class.jpg, landing-hero.png

## Key Plan: FRONTEND_PLAN.md
Created comprehensive 8-phase improvement plan at `/home/timothy/Coding/GDC/FRONTEND_PLAN.md`
- Phase 1: Color consistency fixes
- Phase 2: Navigation/layout overhaul (sticky header, footer redesign)
- Phase 3: Homepage redesign (full-viewport hero, brand story, featured sections)
- Phase 4: Cocktail menu (category filtering via `menu` field, card redesign)
- Phase 5: Bottle detail pages (`pages/bottles/[id].vue`)
- Phase 6: Events page rebuild
- Phase 7: Shared components and polish
- Phase 8: Images and assets

## Technical Notes
- Tailwind v4: CSS-based config, custom colors via CSS custom properties
- Nuxt UI v3: UButton, UCard, UModal, UDrawer available
- Dark mode via VueUse `useDark()` -- CSS vars in main.css handle switching
- For bottles detail route: restructure from flat `pages/bottles.vue` to parent+child pattern (same as events)

# Galveston Distilling Co -- Frontend Improvement Plan

## Current State Assessment

### Public Pages Inventory
| Route | File | Status |
|---|---|---|
| `/` | `pages/index.vue` | Basic -- hero, categories, newsletter. Placeholder descriptions. |
| `/menu` | `pages/menu.vue` | Functional -- search only, no category filtering, minimal card design. |
| `/bottles` | `pages/bottles.vue` | Bare grid of CardBottle components. No detail pages. |
| `/events` | `pages/events.vue` + `pages/events/index.vue` | Skeleton -- four text labels, a Stripe link, no design. |
| `/events/cocktailClass` | `pages/events/cocktailClass.vue` | Stripe checkout embed, no surrounding content. |
| `/login` | `pages/login.vue` | Functional, plain styling. |
| `/calculator` | `pages/calculator.vue` | Proofing calculator wrapper -- admin-facing, no changes needed. |

### Public Components Inventory
| Component | Location | Status |
|---|---|---|
| `SiteHeader` | `components/Site/SiteHeader.vue` | Logo + nav links + dark toggle + mobile dropdown. Events link commented out. |
| `SiteFooter` | `components/Site/SiteFooter.vue` | Location/hours/contact in 3-column grid. Hidden on mobile (`hidden sm:grid`). |
| `SiteHero` | `components/Site/SiteHero.vue` | Split hero with text + image. Uses indigo CTA colors (wrong palette). |
| `SiteCategories` | `components/Site/SiteCategories.vue` | 3-card grid linking to menu/bottles/events. Placeholder descriptions are nonsensical lorem-style text. |
| `SiteNewsletter` | `components/Site/SiteNewsletter.vue` | Email signup. Uses indigo colors (wrong palette). Not functional (no backend). |
| `CardCocktail` | `components/Card/CardCocktail.vue` | Name, price, ingredient list. Very minimal, no visual appeal. |
| `CardBottle` | `components/Card/CardBottle.vue` | Name, price, class/type. Uses UCard. No image, no link to detail. |
| `ModalAge` | `components/Modal/ModalAge.vue` | Age gate on site entry. Functional. |

### Design System (Current)
- **Color tokens** (in `assets/css/main.css` and `assets/css/theme.css`):
  - Light bg: `#f3e2c6` (warm parchment), Dark bg: `#1a120c` (deep espresso)
  - Light text: `#3f2b1d` (dark brown), Dark text: `#f3e2c6` (warm cream)
  - Accent: `#d6b169` (gold), Shadow: `#b88a4f` (warm copper)
  - Border: light `#1a120c`, dark `#b88a4f`
- **Fonts**: Merriweather (body via `--font-primary`), Cormorant Garamond (headings via `theme.css` h1-h4)
- **Problem**: Several components use hardcoded `text-gray-900`, `bg-gray-50`, `bg-indigo-600` instead of the design tokens -- these break the warm distillery palette.

### Images Available
```
public/images/
  Logo.png, MainLogo.png, Logo 2.png  -- Brand logos
  hero.jpg                              -- Hero image
  cocktail.jpg                          -- Cocktail photo
  absinthe.jpg                          -- Absinthe bottle
  class.jpg                             -- Cocktail class photo
  landing-hero.png                      -- Landing hero
  20231017_104945.jpg                   -- Misc photo
  20231205_174024 (3).jpg               -- Misc photo
```

### Data Models (Public-Relevant Fields)
**Bottle**: `_id, name, class, type, abv, price, img, description, recipe (ObjectId), inStock`
**Cocktail**: `_id, name, glassware, ingredients[{item, amount, unit}], cost, price, menu, description, directions, visible`
**Item**: `_id, name, type, brand, vendor, inventoryUnit, pricePerUnit`
**Recipe**: `_id, name, class, type, volume, volumeUnit, items[{item, amount, unit}], directions`

### Key Observations
1. The `menu` field on Cocktail can be used for category filtering (e.g., "Signature", "Classic", "Seasonal")
2. Bottles have an `img` field but no images are currently rendered on CardBottle
3. Bottles have no detail page route -- only a flat grid
4. The events section is barely scaffolded
5. Color inconsistency: components mix Tailwind gray/indigo defaults with the warm distillery palette
6. The footer is completely hidden on mobile
7. Navigation has Events commented out
8. SiteHero references `public/images/hero.jpg` with a `public/` prefix (should be `/images/hero.jpg`)
9. SiteCategories has placeholder descriptions unrelated to a distillery

---

## Phase 1: Design Foundation and Color Consistency

**Goal**: Establish a consistent visual language across all public pages before adding new features.

### 1.1 Define Tailwind Color Tokens
**File**: `assets/css/main.css`

Extend the CSS variables and create Tailwind-compatible utility classes so components can use classes like `bg-distillery-bg`, `text-distillery-accent` etc. rather than hardcoded gray/indigo values. Alternatively, leverage the existing CSS custom properties more consistently.

Recommended palette (already partially in place):
```
Parchment (bg):     #f3e2c6 (light) / #1a120c (dark)
Espresso (text):    #3f2b1d (light) / #f3e2c6 (dark)
Gold (accent):      #d6b169
Copper (shadow):    #b88a4f
Deep Amber:         #c8944a (new -- warm mid-tone for CTAs)
Charcoal:           #2a1f17 (new -- dark section backgrounds)
Cream White:        #faf5ed (new -- lighter bg variant for contrast sections)
```

### 1.2 Fix Color Inconsistencies Across Existing Components
Replace every occurrence of:
- `bg-indigo-600`, `hover:bg-indigo-500`, `text-indigo-600` --> warm gold/copper CTA colors
- `text-gray-900`, `text-gray-500`, `bg-gray-50` --> proper theme-aware classes
- `focus-visible:outline-indigo-600` --> gold/copper focus ring

**Files to update**:
- `components/Site/SiteHero.vue` -- CTA button, text colors
- `components/Site/SiteNewsletter.vue` -- subscribe button, input focus ring, privacy link
- `components/Site/SiteCategories.vue` -- `text-gray-900` and `text-gray-500` on category text
- `pages/login.vue` -- `bg-gray-50`, `text-gray-900` background/text

### 1.3 Fix SiteHero Image Path
**File**: `components/Site/SiteHero.vue`

Change `src="public/images/hero.jpg"` to `src="/images/hero.jpg"` -- the `public/` prefix is incorrect for Nuxt asset references.

### 1.4 Fix SiteCategories Placeholder Text
**File**: `components/Site/SiteCategories.vue`

Replace the lorem-style descriptions with actual distillery-appropriate text:
- Cocktail Collection: "Handcrafted cocktails featuring our house-distilled spirits, designed to showcase the unique character of each bottle."
- Bottles: "Our full lineup of small-batch spirits -- from smooth vodkas to complex whiskeys, each crafted with island character."
- Events: "Join us for cocktail classes, distillery tours, tastings, and more at our Galveston tasting room."

### 1.5 Fix SiteFooter Mobile Visibility
**File**: `components/Site/SiteFooter.vue`

The footer is `hidden sm:grid` which hides it entirely on mobile. Change to a stacked single-column layout on mobile, 3-column grid on desktop.

---

## Phase 2: Navigation and Layout Overhaul

**Goal**: Create a polished, sticky navigation and improved default layout that feels premium.

### 2.1 Redesign SiteHeader
**File**: `components/Site/SiteHeader.vue`

Current issues:
- Not sticky/transparent -- sits as a static block
- Events nav link is commented out
- Mobile uses a dropdown menu rather than a slide-out drawer
- No visual depth -- no background treatment

**Improvements**:
- Make header sticky with `position: sticky; top: 0; z-index: 50`
- Add a semi-transparent background that transitions to solid on scroll (use `@vueuse/core`'s `useWindowScroll` -- already installed)
- Uncomment Events nav link
- Redesign mobile nav as a slide-out drawer (UDrawer/USlideover from Nuxt UI, or a custom sidebar) with smooth animation
- Add subtle bottom border using the copper/gold accent color
- Reduce logo size slightly for a cleaner header
- Add social media icons (Instagram, Facebook) to header or make them accessible

**Navigation structure**:
```
Desktop: Home | Menu | Bottles | Events     [Logo Center]     [DarkToggle] [Admin]
Mobile:  [Logo]                                                [Hamburger]
```

### 2.2 Redesign Default Layout
**File**: `layouts/default.vue`

- Currently `overflow-clip` on the main container -- this may cause issues with sticky header and parallax effects. Evaluate and adjust.
- Add scroll behavior: `scroll-smooth` on the outer container
- Ensure the slot content takes up remaining vertical space with `flex-grow`

### 2.3 Create SiteFooter Redesign
**File**: `components/Site/SiteFooter.vue`

Transform from a simple 3-column text block into a rich footer:
- Dark background section (`bg-[#2a1f17]` or similar)
- Logo at the top of the footer
- 4 columns: Location + Map link | Hours | Quick Links (nav) | Newsletter signup (move from homepage)
- Social media icons row
- Copyright bar at bottom
- Mobile: stack all columns vertically

---

## Phase 3: Homepage Redesign

**Goal**: Transform the homepage into a compelling storytelling experience.

### 3.1 Redesign Page Structure
**File**: `pages/index.vue`

Replace the current flat layout with a narrative flow:

```
1. Full-width Hero Section (atmospheric, full viewport height)
2. Brand Story Section (split layout: image + text)
3. Featured Spirits Section (horizontal scroll or 3-card grid)
4. Cocktail Highlights Section (2-3 featured cocktails with images)
5. Visit Us CTA Section (full-width image background with overlay)
6. Newsletter Section (integrated into footer or as a standalone band)
```

### 3.2 Redesign SiteHero Component
**File**: `components/Site/SiteHero.vue`

Transform from a split-column layout to a full-viewport atmospheric hero:
- Full-width, full-height (100vh) background image with dark overlay gradient
- Centered text: large Cormorant Garamond heading, Merriweather subtext
- Two CTA buttons: "Explore Our Spirits" + "Visit Us"
- Subtle scroll-down indicator (animated chevron)
- Background image should use `object-cover` and `loading="eager"` (above the fold)

### 3.3 Create SiteBrandStory Component
**File**: `components/Site/SiteBrandStory.vue` (new)

A split section (image left, text right):
- Heading: "Crafted on the Island"
- Short brand narrative paragraph
- Decorative divider using the gold accent color
- Link to full About/Our Story page (future)

### 3.4 Create SiteFeaturedSpirits Component
**File**: `components/Site/SiteFeaturedSpirits.vue` (new)

- Section heading: "Our Spirits"
- Pull from `useBottleStore` -- show 3-4 featured bottles (could filter by `inStock: true` and pick the first few, or add a `featured` field later)
- Each card: bottle image (from `img` field or placeholder), name, class, ABV, price
- "View All Spirits" link at the bottom
- Horizontal scroll on mobile, grid on desktop

### 3.5 Create SiteFeaturedCocktails Component
**File**: `components/Site/SiteFeaturedCocktails.vue` (new)

- Section heading: "From Our Bar"
- Pull from `useCocktailStore` -- show 3 cocktails (filter by `visible: true`)
- Card with cocktail name, description, ingredients summary, price
- "View Full Menu" link
- Alternating background color for visual rhythm

### 3.6 Create SiteVisitCTA Component
**File**: `components/Site/SiteVisitCTA.vue` (new)

Full-width call-to-action section:
- Background image with dark overlay
- "Visit Our Tasting Room" heading
- Address, hours summary
- "Get Directions" and "Book a Tasting" buttons
- Could use a parallax-style fixed background

### 3.7 Relocate or Integrate Newsletter
Move newsletter signup into the footer (Phase 2.3) rather than as a standalone homepage section, or restyle it as a visually distinct band with a warm background.

---

## Phase 4: Cocktail Menu Page Redesign

**Goal**: Add category filtering, improve card design, and create a visually appealing menu experience.

### 4.1 Add Category Filtering System
**File**: `pages/menu.vue`

The `menu` field on the Cocktail model is the natural category key. Common values might include: "Signature", "Classic", "Seasonal", "Tiki", etc.

**Implementation**:
```typescript
// Extract unique menu categories from cocktail data
const categories = computed(() => {
  const menus = cocktailStore.cocktails
    .filter(c => c.visible)
    .map(c => c.menu)
    .filter(Boolean);
  return ['All', ...new Set(menus)];
});

const activeCategory = ref('All');

const filteredCocktails = computed(() => {
  let result = cocktailStore.cocktails.filter(c => c.visible);
  if (activeCategory.value !== 'All') {
    result = result.filter(c => c.menu === activeCategory.value);
  }
  if (search.value) {
    result = result.filter(c =>
      c.name.toLowerCase().includes(search.value.toLowerCase()) ||
      c.ingredients.some(ing =>
        itemStore.getItemById(ing.item.toString())?.name
          .toLowerCase().includes(search.value.toLowerCase())
      )
    );
  }
  return result;
});
```

**UI**: Horizontal pill/tab bar above the search input showing each category. Active category highlighted with gold accent. Search below the tabs for further refinement within a category.

### 4.2 Redesign Menu Page Layout
**File**: `pages/menu.vue`

```
1. Page Hero Banner (smaller than homepage -- "Our Cocktail Menu" with atmospheric bg)
2. Category Filter Tabs (horizontal scrollable pills)
3. Search Input (with clear button -- keep existing)
4. Cocktail Grid (2-col on tablet, 1-col on mobile)
5. Empty State (when no cocktails match filter/search)
```

### 4.3 Redesign CardCocktail Component
**File**: `components/Card/CardCocktail.vue`

Current: just name, price, and comma-separated ingredient list. No visual structure.

**New design**:
- Card container with subtle border and hover effect (lift shadow on hover)
- Top section: cocktail name (Cormorant Garamond, large) and price (right-aligned or below)
- Divider line (thin gold rule)
- Ingredients list styled elegantly -- each ingredient on its own line or as a flowing comma-separated list in italic
- Description text (if present) in smaller body font
- Glassware icon or text indicator (coupe, rocks, highball, etc.)
- Optional: color accent stripe on the left edge based on spirit category
- Subtle hover: slight scale or shadow increase

### 4.4 Create SiteMenuHero Component
**File**: `components/Site/SiteMenuHero.vue` (new)

A reusable page-level hero banner (shorter than the homepage hero):
- Background image with dark overlay
- Page title centered
- Optional subtitle
- Can be reused for Bottles page, Events page, etc.
- Props: `title`, `subtitle`, `backgroundImage`

This should be extracted as a generic `SitePageHero` component usable across pages.

---

## Phase 5: Bottle Detail Pages

**Goal**: Create individual bottle pages with an appealing product template.

### 5.1 Create Bottle Detail Route
**File**: `pages/bottles/[id].vue` (new)

Dynamic route that renders a full product page for a single bottle.

**Layout structure**:
```
1. Page Hero / Product Header
   - Large bottle image (from bottle.img or placeholder)
   - Bottle name (large Cormorant Garamond)
   - Class and type badges (e.g., "Whisky -- Bourbon Whisky")
   - Price display
   - ABV / Proof display
   - In-stock indicator

2. Product Details Section
   - Description (full text from bottle.description)
   - Tasting notes section (could derive from description or add fields later)
   - Specifications table: ABV, Proof, Volume, Class, Type

3. Related Cocktails Section
   - Query cocktails that use items from this bottle's recipe
   - Or manually curate -- for now, show cocktails that match the bottle's spirit class
   - Grid of CardCocktail components

4. Back to All Bottles link
```

**Data fetching**:
```typescript
const route = useRoute();
const bottleStore = useBottleStore();
const bottle = computed(() =>
  bottleStore.getBottleById(route.params.id as string)
);
```

### 5.2 Restructure Bottles List Page
**File**: `pages/bottles.vue` --> Move to `pages/bottles/index.vue`

To support the `[id].vue` dynamic route, the bottle listing should live at `pages/bottles/index.vue`. Add a parent `pages/bottles.vue` with just `<NuxtPage />`.

**Improvements to the listing page**:
- Add a page hero banner (reuse `SitePageHero`)
- Add spirit class filter tabs (Whisky, Vodka, Gin, Rum, etc.) from `liquorClasses` in definitions
- Improve grid layout with better spacing
- Each card links to `/bottles/{id}`

### 5.3 Redesign CardBottle Component
**File**: `components/Card/CardBottle.vue`

Current: basic UCard with name, price, class/type text. No image, no link.

**New design**:
- Wrap in `NuxtLink` to `/bottles/${bottle._id}` for clickability
- Bottle image area (top of card) -- show `bottle.img` if available, otherwise a placeholder silhouette
- Name below image (Cormorant Garamond)
- Class / Type as subtle badges or text
- Price displayed prominently
- ABV / Proof indicator
- "In Stock" / "Out of Stock" badge
- Hover effect: subtle scale-up and shadow
- `loading="lazy"` on images

### 5.4 Add Placeholder Bottle Images
**Directory**: `public/images/bottles/`

Download or create placeholder images for spirit categories:
- `bottle-whiskey-placeholder.jpg`
- `bottle-vodka-placeholder.jpg`
- `bottle-gin-placeholder.jpg`
- `bottle-rum-placeholder.jpg`
- `bottle-default-placeholder.jpg`

These serve as fallbacks when `bottle.img` is not set. Map bottle class to the appropriate placeholder.

---

## Phase 6: Events Page

**Goal**: Build a proper events page with upcoming events, recurring classes, and news.

### 6.1 Redesign Events Index Page
**File**: `pages/events/index.vue`

Current: a skeleton grid with four text labels and a Stripe link. Needs a complete rebuild.

**Layout structure**:
```
1. Page Hero Banner (reuse SitePageHero -- "Events & Experiences")

2. Featured Event / Next Event
   - Large card or banner for the next upcoming event
   - Date, title, description, CTA button

3. Recurring Events Section
   - Cocktail Classes (link to /events/cocktailClass)
   - Distillery Tours
   - Weekly Specials / Happy Hours
   - Each as a visually distinct card with image, description, schedule

4. Calendar / Upcoming Events List
   - Chronological list of dated events
   - For now, hardcode a few representative events
   - Future: connect to a backend events model

5. Private Events CTA
   - "Host Your Event" section
   - Description of private event offerings
   - Contact button
```

### 6.2 Redesign Cocktail Class Page
**File**: `pages/events/cocktailClass.vue`

Current: just a Stripe checkout embed with "Testing" text.

**New layout**:
```
1. Page Hero Banner
2. What to Expect section (description, duration, what's included)
3. Pricing and booking info
4. Stripe checkout embed (styled, integrated into the page design)
5. FAQ section
6. Testimonials/reviews (placeholder)
```

### 6.3 Create Event Card Components
**File**: `components/Site/SiteEventCard.vue` (new)

Reusable card for displaying an event:
- Props: `title, date, time, description, image, link, price`
- Image at top, content below
- Date badge overlay on image
- CTA button at bottom

### 6.4 Uncomment Events Navigation
**File**: `components/Site/SiteHeader.vue`

Uncomment the Events link in both `navList` and `mobileNav` arrays.

---

## Phase 7: Shared Components and Polish

### 7.1 Create SitePageHero Component (Generic)
**File**: `components/Site/SitePageHero.vue` (new)

Reusable hero banner for interior pages:
```vue
<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}>();
</script>
```

- Full-width, ~40vh height
- Background image with dark gradient overlay
- Title centered in Cormorant Garamond
- Optional subtitle below
- Default background if no image provided (use a solid dark color with texture)

### 7.2 Create SiteSectionHeading Component
**File**: `components/Site/SiteSectionHeading.vue` (new)

Consistent section headings across all pages:
- Heading text (Cormorant Garamond)
- Optional subtitle (Merriweather, smaller)
- Decorative gold divider line or ornament below
- Centered or left-aligned variants

### 7.3 Create SiteSpiritBadge Component
**File**: `components/Site/SiteSpiritBadge.vue` (new)

Small badge/pill for displaying spirit classifications:
- Props: `label, variant ('class' | 'type' | 'abv' | 'stock')`
- Color-coded by spirit class (whiskey=amber, vodka=silver, gin=green, rum=copper, etc.)
- Used in CardBottle and the bottle detail page

### 7.4 Smooth Scroll and Micro-Interactions
- Add `scroll-behavior: smooth` to the html/body
- Hover effects on all cards (subtle transform scale + shadow)
- Transition effects on category filter tabs
- Fade-in animations on sections as they scroll into view (CSS-only using `@keyframes` and `animation-timeline: view()` or IntersectionObserver)

### 7.5 Image Optimization
- Add `loading="lazy"` to all below-the-fold images
- Use `decoding="async"` on images
- Ensure all images have descriptive `alt` text
- Consider using `<NuxtImg>` if `@nuxt/image` is installed (check first -- do not install without confirmation)

---

## Phase 8: Additional Images and Assets

### 8.1 Source Placeholder Photos
Download high-quality, royalty-free photos for:
- **Hero backgrounds**: distillery interior, barrel room, copper stills
- **Cocktail imagery**: styled cocktail photos for the menu page hero
- **Bottles**: spirit bottle photography or silhouettes
- **Events**: people in a tasting room, cocktail class setting
- **Textures**: subtle dark wood grain or copper texture for backgrounds
- **Galveston/coastal**: ocean, pier, island scenery for brand sections

Store in `public/images/` with descriptive names:
```
public/images/
  hero-distillery.jpg
  hero-barrel-room.jpg
  hero-cocktails.jpg
  bg-dark-wood.jpg
  bg-copper-texture.jpg
  bottles/
    bottle-whiskey-placeholder.jpg
    bottle-vodka-placeholder.jpg
    bottle-gin-placeholder.jpg
    bottle-rum-placeholder.jpg
    bottle-default.jpg
  events/
    event-cocktail-class.jpg
    event-tour.jpg
    event-tasting.jpg
  galveston/
    galveston-pier.jpg
    galveston-beach.jpg
```

### 8.2 Age Gate Enhancement
**File**: `components/Modal/ModalAge.vue`

- Add a background image or branding to the age gate modal
- Display the GDC logo above the question
- Style the buttons with the warm palette (gold/copper)
- Add a brief "Welcome to Galveston Distilling Co" text

---

## Implementation Priority Order

The phases are ordered by impact and dependency. Here is the recommended implementation sequence:

### Sprint 1: Foundation (Phases 1 + 2)
**Estimated effort: 2-3 sessions**
1. Fix all color inconsistencies (Phase 1.1-1.2)
2. Fix SiteHero image path (Phase 1.3)
3. Fix SiteCategories descriptions (Phase 1.4)
4. Fix SiteFooter mobile visibility (Phase 1.5)
5. Redesign SiteHeader with sticky nav (Phase 2.1)
6. Update default layout (Phase 2.2)
7. Redesign SiteFooter (Phase 2.3)

### Sprint 2: Homepage (Phase 3)
**Estimated effort: 2 sessions**
1. Create SitePageHero generic component (Phase 7.1) -- needed by multiple pages
2. Redesign SiteHero for full-viewport hero (Phase 3.2)
3. Create SiteBrandStory (Phase 3.3)
4. Create SiteFeaturedSpirits (Phase 3.4)
5. Create SiteFeaturedCocktails (Phase 3.5)
6. Create SiteVisitCTA (Phase 3.6)
7. Assemble new homepage (Phase 3.1)

### Sprint 3: Cocktail Menu (Phase 4)
**Estimated effort: 1-2 sessions**
1. Redesign CardCocktail (Phase 4.3)
2. Add category filtering (Phase 4.1)
3. Redesign menu page layout with hero (Phase 4.2)

### Sprint 4: Bottles (Phase 5)
**Estimated effort: 2 sessions**
1. Redesign CardBottle with images and links (Phase 5.3)
2. Restructure bottles routes (Phase 5.2)
3. Create bottle detail page (Phase 5.1)
4. Add placeholder bottle images (Phase 5.4)

### Sprint 5: Events (Phase 6)
**Estimated effort: 1-2 sessions**
1. Uncomment events nav (Phase 6.4)
2. Create SiteEventCard (Phase 6.3)
3. Redesign events index (Phase 6.1)
4. Redesign cocktail class page (Phase 6.2)

### Sprint 6: Polish (Phases 7 + 8)
**Estimated effort: 1-2 sessions**
1. Create remaining shared components (Phase 7.2-7.3)
2. Add scroll/hover micro-interactions (Phase 7.4)
3. Image optimization pass (Phase 7.5)
4. Source and add placeholder photos (Phase 8.1)
5. Enhance age gate (Phase 8.2)

---

## Files to Create (New)
```
components/Site/SitePageHero.vue
components/Site/SiteBrandStory.vue
components/Site/SiteFeaturedSpirits.vue
components/Site/SiteFeaturedCocktails.vue
components/Site/SiteVisitCTA.vue
components/Site/SiteSectionHeading.vue
components/Site/SiteSpiritBadge.vue
components/Site/SiteEventCard.vue
pages/bottles/index.vue         (move from pages/bottles.vue)
pages/bottles/[id].vue          (new detail page)
pages/bottles.vue               (parent route with <NuxtPage />)
```

## Files to Modify (Existing)
```
assets/css/main.css             (extend color tokens)
layouts/default.vue             (scroll behavior, layout fix)
components/Site/SiteHeader.vue  (sticky nav, events link, mobile drawer)
components/Site/SiteFooter.vue  (full redesign, mobile support)
components/Site/SiteHero.vue    (full-viewport hero, fix image path)
components/Site/SiteCategories.vue (fix descriptions, palette)
components/Site/SiteNewsletter.vue (fix palette, possibly relocate to footer)
components/Card/CardCocktail.vue   (visual redesign)
components/Card/CardBottle.vue     (image, link, visual redesign)
components/Modal/ModalAge.vue      (branding enhancement)
pages/index.vue                    (new section flow)
pages/menu.vue                     (category filtering, hero, layout)
pages/events/index.vue             (complete rebuild)
pages/events/cocktailClass.vue     (content wrapper around Stripe embed)
```

## Files NOT to Touch
```
pages/admin/**                  -- Admin pages
pages/login.vue                 -- Functional, low priority
pages/calculator.vue            -- Admin tool
components/Admin/**             -- Admin components
components/Dashboard/**         -- Admin dashboard
components/Form/**              -- Admin forms
components/Table/**             -- Admin tables
components/Modal/** (except ModalAge) -- Admin modals
stores/**                       -- No store logic changes
server/**                       -- No API changes
types/**                        -- No type changes (unless adding optional fields)
```

---

## Technical Notes

### Tailwind v4 Considerations
- Tailwind v4 uses CSS-based configuration rather than `tailwind.config.js`
- Custom colors are defined via CSS custom properties in `assets/css/main.css`
- Use `var(--ui-accent)` etc. via arbitrary value syntax: `bg-[var(--ui-accent)]` or extend in the CSS file with `@theme`

### Nuxt UI v3 Component Usage
- Use `UButton`, `UCard`, `UInput`, `UBadge` where they add value
- For custom card designs, plain HTML + Tailwind is often more flexible than forcing Nuxt UI card patterns
- `UDrawer` or `USlideover` for mobile navigation drawer

### Dark Mode
- Already implemented via `@vueuse/core`'s `useDark()` / `useToggle()`
- CSS custom properties in `main.css` already handle light/dark switching
- New components should use the CSS variables or theme-aware Tailwind classes
- Test both light and dark modes for every component

### Route Structure
- Current: `pages/bottles.vue` (flat file)
- Target: `pages/bottles.vue` (parent with `<NuxtPage />`), `pages/bottles/index.vue` (list), `pages/bottles/[id].vue` (detail)
- Same pattern already used by `pages/events.vue` + `pages/events/index.vue`

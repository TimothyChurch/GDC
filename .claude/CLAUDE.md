# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Galveston Distilling Co (GDC) — a full-stack Nuxt 3 + TypeScript distillery management application. Manages batch tracking (brewing through bottling), inventory, production records, cocktail menus, vessels, and recipes. Uses MongoDB (Mongoose) for data, Pinia for state management, and Nuxt UI v3 for the component library.

## Commands

```bash
npm run dev        # Dev server on port 3001
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run Vitest unit tests
```

## Architecture

### API Layer (`server/api/`)
File-based REST API routes using Nuxt's `defineEventHandler()`. Standard CRUD pattern per resource:
- `GET /api/{resource}` — list all
- `GET /api/{resource}/[id]` — get one
- `POST /api/{resource}/create` — create
- `PUT /api/{resource}/[id]` — update
- `DELETE /api/{resource}/[id]` — delete

Resources: batch, bottle, cocktail, contact, inventory, item, production, purchaseOrder, recipe, users, vessel.

### Database (`server/models/`)
Mongoose schemas via `nuxt-mongoose` module. MongoDB Atlas connection configured through `NUXT_ENV_MONGODB_URI` env var. Prisma is installed but not actively used — Mongoose is the primary ORM.

### State Management (`stores/`)
Pinia stores follow a consistent pattern: each store fetches its data on instantiation, exposes reactive state, and provides async CRUD actions that call `/api/` endpoints with `$fetch`. One store per resource (e.g., `useBatchStore`, `useBottleStore`).

### Types (`types/interfaces/`)
TypeScript interfaces for each domain model. Imported throughout components and stores.

### Components (`components/`)
Auto-imported by Nuxt, organized by function:
- **Form/** — CRUD forms for each entity
- **Table/** — Data table components using Nuxt UI's UTable
- **Modal/** — Modal dialogs wrapping forms
- **Dashboard/** — Admin dashboard cards and widgets
- **Site/** — Public-facing components

### Authentication
Custom cookie-based auth via `composables/useAuth.ts`. Login hits `PUT /api/users/find`, stores user in cookie. Route guard middleware in `middleware/auth.ts` protects `/admin/*` routes. Note: `@sidebase/nuxt-auth` and `next-auth` are installed but the app uses the custom implementation.

### Key Composables (`composables/`)
- `useAuth.ts` — login/logout/auth state
- `useProofingCalculator.ts` — alcohol proofing calculations
- `definitions.ts` — liquor class/type definitions and constants
- `modalStatus.ts` — shared modal open/close state
- `status.ts` — batch status definitions

### Layouts
- `default.vue` — public-facing layout
- `admin.vue` — admin dashboard layout with navigation

## Domain Model

Batches progress through stages: **Upcoming → Brewing → Fermenting → Distilling → Storage → Barreled → Bottled**. Each stage tracks specific data (fermentation readings, distillation cuts, barrel aging). Batches link to Recipes (ingredient lists), Vessels (fermentation tanks/barrels), and ultimately to Bottles (finished products) via Production records.

## Integrations

- **Stripe** — payment processing via `@unlok-co/nuxt-stripe` module, endpoints in `server/api/stripe/`
- **Meta Pixel** — Facebook analytics tracking via `nuxt-meta-pixel`
- **Chart.js** — registered in `plugins/chartjs.ts` for inventory/batch visualizations
- **Socket.io** — installed for real-time features

## Style & Conventions

- Vue 3 Composition API with `<script setup lang="ts">` in all components
- Nuxt UI v3 components (UTable, UButton, UModal, UForm, etc.)
- Tailwind CSS v4 for styling; custom fonts Merriweather and Cormorant Garamond
- camelCase for functions/variables, PascalCase for components and types
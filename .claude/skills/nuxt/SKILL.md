---
name: nuxt
description: "Nuxt 4 reference skill. Load specific topic references on demand to minimize context. Covers server/Nitro, data fetching, performance, routing, config, errors, TypeScript, testing, deployment, composables, and migration."
argument-hint: "[topic: all|server|data|performance|routing|config|errors|typescript|testing|deployment|composables|migration]"
disable-model-invocation: false
allowed-tools: Read, Glob, Grep
---

<objective>
Nuxt 4 expert assistant. Loads only the reference files needed for the user's question to minimize context usage. Covers server/Nitro, data fetching, performance, routing, config, errors, TypeScript, testing, deployment, composables, and migration.
</objective>

<quick_start>
- `/nuxt server` — Nitro, H3, API routes, caching, route rules
- `/nuxt data` — useFetch, useAsyncData, $fetch, Pinia SSR
- `/nuxt performance` — SEO, rendering modes, images, lazy hydration
- `/nuxt migration` — All Nuxt 3 → 4 breaking changes
</quick_start>

<routing>
Based on `$ARGUMENTS` (or the user's question context), load the appropriate reference file(s) from `.claude/skills/nuxt/`:

| Argument | File | Covers |
|----------|------|--------|
| `server` | `ref-server.md` | Nitro, H3, API routes, caching, route rules, server middleware, plugins |
| `data` | `ref-data-fetching.md` | useFetch, useAsyncData, $fetch, useState, Pinia SSR, hydration |
| `performance` | `ref-performance-seo.md` | SEO meta, rendering modes, images, lazy hydration, Core Web Vitals |
| `routing` | `ref-routing.md` | Pages, definePageMeta, route middleware, NuxtLink, navigateTo |
| `config` | `ref-config-modules.md` | nuxt.config.ts, app.config.ts, runtime config, modules, layers |
| `errors` | `ref-error-handling.md` | error.vue, NuxtErrorBoundary, showError, createError |
| `typescript` | `ref-typescript.md` | Project refs, auto-imports, type augmentation, strict patterns |
| `testing` | `ref-testing.md` | Vitest, @nuxt/test-utils, mocking, GDC test structure |
| `deployment` | `ref-deployment.md` | Netlify, env vars, build optimization, preview |
| `composables` | `ref-composables-plugins.md` | callOnce, useCookie, plugins, hooks, custom composables |
| `migration` | `ref-nuxt4-migration.md` | All Nuxt 3 → 4 breaking changes consolidated |
| `all` | All files | Complete reference (use sparingly) |
</routing>

<instructions>
1. **If `$ARGUMENTS` is provided**, read that specific reference file and present the relevant information.

2. **If no argument is provided**, determine the topic from context:
   - Server routes, API handlers, Nitro, H3 → `ref-server.md`
   - useFetch, useAsyncData, $fetch, Pinia, stores → `ref-data-fetching.md`
   - SEO, meta tags, images, lazy loading, CWV → `ref-performance-seo.md`
   - Pages, middleware, navigation, NuxtLink → `ref-routing.md`
   - nuxt.config, modules, runtime config → `ref-config-modules.md`
   - Errors, error pages, error boundaries → `ref-error-handling.md`
   - TypeScript, types, auto-imports → `ref-typescript.md`
   - Tests, Vitest, mocking → `ref-testing.md`
   - Deploy, Netlify, build, env vars → `ref-deployment.md`
   - Composables, plugins, hooks, callOnce → `ref-composables-plugins.md`
   - Migration, breaking changes, Nuxt 3 vs 4 → `ref-nuxt4-migration.md`
   - If unclear → `ref-nuxt4-migration.md` as a starting point

3. **Cross-reference loading**: If a question spans multiple topics (e.g., "SSR data fetching with error handling"), load both relevant files.

4. **Present concisely**: Don't dump the entire file. Extract and present only the parts relevant to the user's specific question.
</instructions>

<topic_index>
**Server**: defineEventHandler, readValidatedBody, createError, defineCachedEventHandler, server middleware, server plugins, route rules
**Data**: useFetch, useAsyncData, $fetch, useState, Pinia SSR, getCachedData, hydration, payload
**Performance**: useSeoMeta, useHead, NuxtImg, lazy hydration, route rules, prerendering, CWV
**Routing**: definePageMeta, defineNuxtRouteMiddleware, navigateTo, NuxtLink, useRoute, useRouter
**Config**: nuxt.config.ts, app.config.ts, useRuntimeConfig, useAppConfig, modules, layers
**Errors**: error.vue, NuxtErrorBoundary, showError, clearError, createError (client vs server)
**TypeScript**: #imports, #components, #server, project references, import.meta.client
**Testing**: Vitest, @nuxt/test-utils, mockNuxtImport, registerEndpoint, mountSuspended
**Deployment**: Netlify preset, NUXT_ env mapping, build optimization, common issues
**Composables**: callOnce, useCookie, defineNuxtPlugin, app hooks, auto-import dirs
**Migration**: All Nuxt 3 → 4 breaking changes (directory, data, errors, TS, composables)
</topic_index>

<success_criteria>
- Correct reference file(s) loaded based on user's question or argument
- Only relevant sections presented (not entire file dumps)
- Cross-references loaded when question spans multiple topics
- User gets accurate, actionable Nuxt 4 guidance
</success_criteria>

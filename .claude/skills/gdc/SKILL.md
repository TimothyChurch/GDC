---
name: gdc
description: "Galveston Distilling Co codebase reference. Load specific topic references on demand to minimize context. Covers architecture, all 18 domain models, 102 API routes, 17 stores, 142 components, integrations, compliance, and 70+ tech-debt items."
argument-hint: "[topic: all|architecture|conventions|api|stores|components|auth|batches|transfers|inventory|recipes|bottles|production|cocktails|contacts|events|vessels|compliance|integrations|tech-debt]"
disable-model-invocation: false
allowed-tools: Read, Glob, Grep
---

<objective>
Domain reference for the GDC distillery management app. Loads only the topic file(s) needed for the current task. Use this BEFORE reading source code so you know which files to open and what patterns to follow.
</objective>

<quick_start>
- `/gdc tech-debt` — Known issues, dead code, security gaps, mid-flight refactors. **Read first** before recommending changes.
- `/gdc architecture` — Overall structure, layers, data flow, what lives where
- `/gdc conventions` — Coding patterns: API routes, stores, components, validation
- `/gdc batches` — Batch lifecycle (most complex domain, ⚠️ mid-revamp)
- `/gdc compliance` — TTB/TABC reports, regulatory data flow
</quick_start>

<routing>
Based on `$ARGUMENTS` (or task context), load the appropriate file(s) from `.claude/skills/gdc/`:

| Argument | File | Covers |
|----------|------|--------|
| `architecture` | `architecture.md` | Layers, file structure, data flow, tech stack (actual not aspirational) |
| `conventions` | `conventions.md` | Coding patterns, naming, validation, TypeScript/Vue style |
| `api` | `api.md` | All 102 server routes (incl. transfer/reporting-period), auth/RBAC, validation patterns, api-handler factory |
| `stores` | `stores.md` | All 17 Pinia stores, the `useCrudStore` factory, state patterns |
| `components` | `components.md` | All 142 components by group, Panel/Table patterns, page→component map |
| `auth` | `auth.md` | Login/logout/session, RBAC, route protection, password handling |
| `batches` | `batches.md` | Batch schema (most complex), 13 stages, pipeline templates, ⚠️ mid-revamp |
| `transfers` | `transfers.md` | Transfer + ReportingPeriod system (engine + 7 routes + store all built; ⚠️ 5 components still bypass engine — see tech-debt §14) |
| `inventory` | `inventory.md` | Inventory + Item, categories, stock calculations, low-stock alerts |
| `recipes` | `recipes.md` | Recipe schema, items + bulkSpirits, pipeline templates |
| `bottles` | `bottles.md` | Bottle (finished goods), public catalog, archived flag |
| `production` | `production.md` | Production records, cost breakdown, bottling materials |
| `cocktails` | `cocktails.md` | Cocktail menu, ingredient resolution (item vs bottle), public menu |
| `contacts` | `contacts.md` | Contact CRM, Message (inbox), merge logic, newsletter |
| `events` | `events.md` | Event bookings, Square checkout integration, public requests |
| `vessels` | `vessels.md` | Vessels (tanks/stills/barrels), contents[] multi-slot model |
| `compliance` | `compliance.md` | TTB/TABC reports, useTABCCalculations, useComplianceDeadlines |
| `integrations` | `integrations.md` | Square (payments), Cloudinary (uploads), Meta Pixel, sitemap |
| `tech-debt` | `tech-debt.md` | Dead code, security gaps, schema drift, mid-flight work, recommendations |
| `all` | All files | Complete reference (avoid — high token cost) |
</routing>

<instructions>
1. **If `$ARGUMENTS` is provided**, read that specific reference file and present what's relevant to the user's question.

2. **If no argument is provided**, determine the topic from context:
   - "Add a field to X" / "How does X work?" → load the resource topic file (`batches`, `inventory`, etc.)
   - "Why is X failing?" / "Is this a bug?" → load `tech-debt.md` first, then the resource file
   - "Add an endpoint" → load `api.md` + the resource file
   - "Add a store action" → load `stores.md` + the resource file
   - "Add a component / page" → load `components.md` + the resource file
   - "Refactor / cleanup / consolidation" → load `tech-debt.md` (it has the priority list)

3. **Cross-reference loading**: For multi-domain tasks (e.g., "wire batch advance to vessel transfer"), load both `batches.md` and `vessels.md`, plus `tech-debt.md` if either is mid-revamp.

4. **Always check `tech-debt.md`** before recommending architectural changes. The batch transfer system is being rewritten (PLAN-PIPELINE-REVAMP.md, started 2026-05-07, 0% complete) — don't suggest changes that conflict.

5. **Present concisely**: Don't dump the entire file. Extract and present only the parts relevant to the user's specific question.
</instructions>

<topic_index>
**Architecture**: Nuxt 4, MongoDB Atlas via Mongoose, Pinia, Nuxt UI v4, Square (NOT Stripe), Cloudinary, custom session auth. 18 schemas, 102 API routes, 17 stores, 142 components, 73 pages.

**Auth**: cookie-based session via `useSession`, 7d, RBAC (Admin/Manager/Staff/ReadOnly) in `server/utils/rbac.ts`, login rate-limited, bcrypt with plaintext-migration on first login.

**Batches**: 13-stage pipeline (Mashing → Fermenting → Distilling → Storage → Barreled → Bottled). Most complex schema. ⚠️ Active integration: 5 distillation components still bypass the Transfer Engine.

**Transfers**: Immutable ledger system. Engine (`transferEngine.ts` 622 LOC), 7 routes, `useTransferStore` all BUILT. `useBatchStore.advanceToStage` already engine-routed. ⚠️ 5 components in tech-debt §14 still bypass it — those create the period-lock + audit-trail gaps.

**Inventory**: `Inventory` (point-in-time count records) + `Item` (master). 5 categories. Stock = latest record per item.

**Compliance**: TTB Forms 5110.40/.11/.28 + TABC monthly. Reports computed from batches/productions (current) or transfer ledger (when integration sweep completes).

**Integrations**: Square (payments + webhook + bookings; ⚠️ webhook HMAC is string-equality — timing vuln), Cloudinary (image uploads, max 10MB), Meta Pixel (analytics), `@nuxtjs/sitemap` (public SEO).

**Known issues** (`/gdc tech-debt` for full list of 70+): TLS keys in git, multiple routes missing RBAC (transfer/reporting-period/contact-merge/upload-delete), Square webhook timing-attack vuln, `false/` junk dir (36 files), 5 components bypass transfer engine, 12 unused components + 6 root orphans, oversized components (`BatchAdvanceAction` 928 LOC, `BatchBarrelAging` 851), 5 hardcoded inventory pages duplicate `[slug].vue`, ~250 `any` types, missing reusable form primitives (FormVolumeInput, DataRow, FormFooter).
</topic_index>

<success_criteria>
- Correct topic file(s) loaded based on user's question or argument
- Only relevant sections presented (not entire file dumps)
- `tech-debt.md` consulted before recommending architectural changes
- User gets accurate guidance grounded in actual codebase state, not aspirational docs
</success_criteria>

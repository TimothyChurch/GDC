---
name: nuxt-ui
description: "Nuxt UI v4 reference skill. Load specific component/topic references on demand to minimize context. Covers all 67+ components, composables, theming, and best practices."
argument-hint: "[topic: all|forms|table|overlays|composables|navigation|display|layout|theming|best-practices]"
disable-model-invocation: false
allowed-tools: Read, Glob, Grep
---

<objective>
Nuxt UI v4 expert assistant. Loads only the reference files needed for the user's question to minimize context usage. Covers all 67+ components, composables, theming, and best practices.
</objective>

<quick_start>
- `/nuxt-ui forms` — Form components (UForm, UInput, USelect, etc.)
- `/nuxt-ui table` — UTable with TanStack (columns, sorting, pagination)
- `/nuxt-ui overlays` — UModal, USlideover, UDrawer, UPopover, etc.
- `/nuxt-ui theming` — Colors, design tokens, icons, CSS vars
</quick_start>

<routing>
Based on `$ARGUMENTS` (or the user's question context), load the appropriate reference file(s) from `.claude/skills/nuxt-ui/`:

| Argument | File | Covers |
|----------|------|--------|
| `theming` | `ref-theming.md` | Colors, design tokens, icons, ui prop, app.config, CSS vars, color mode |
| `forms` | `ref-forms.md` | UForm, UFormField, UInput, UTextarea, USelect, USelectMenu, UInputMenu, UInputNumber, UInputDate, UInputTime, UInputTags, UCheckbox, URadioGroup, USwitch, UColorPicker, USlider, UPinInput, UFileUpload |
| `table` | `ref-table.md` | UTable (TanStack), columns, sorting, pagination, row selection, grouping, virtualization, UPagination |
| `overlays` | `ref-overlays.md` | UModal, USlideover, UDrawer, UPopover, UTooltip, UDropdownMenu, UContextMenu |
| `composables` | `ref-composables.md` | useOverlay, useToast, defineShortcuts, useCommandPalette |
| `navigation` | `ref-navigation.md` | UTabs, UBreadcrumb, UNavigationMenu, UStepper, UCommandPalette |
| `display` | `ref-display.md` | UButton, UBadge, UCard, UAlert, UAvatar, UAvatarGroup, UChip, UAccordion, UCalendar, UCarousel, UProgress, USkeleton, USeparator, UKbd, UCollapsible, UTree, UTimeline, UEmpty |
| `layout` | `ref-layout.md` | UApp, UContainer, ULink, UIcon, UFieldGroup, UToast |
| `best-practices` | `ref-best-practices.md` | Patterns, gotchas, migration notes, GDC-specific conventions |
| `all` | All files | Complete reference (use sparingly) |
</routing>

<instructions>
1. **If `$ARGUMENTS` is provided**, read that specific reference file and present the relevant information.

2. **If no argument is provided**, determine the topic from context:
   - Form component work → load `ref-forms.md`
   - UTable or columns → load `ref-table.md`
   - Modals, slideovers, dropdowns, tooltips → load `ref-overlays.md`
   - useOverlay, useToast, or shortcuts → load `ref-composables.md`
   - Tabs, breadcrumbs, navigation, stepper → load `ref-navigation.md`
   - Buttons, badges, cards, alerts, avatars → load `ref-display.md`
   - Colors, theming, icons, design tokens → load `ref-theming.md`
   - UApp, layout, links → load `ref-layout.md`
   - If unclear → load `ref-best-practices.md` as a starting point

3. **Cross-reference loading**: If a question spans multiple topics (e.g., "form with modal"), load both relevant files.

4. **Present concisely**: Don't dump the entire file. Extract and present only the parts relevant to the user's specific question.
</instructions>

<component_index>
**Forms**: UForm, UFormField, UInput, UTextarea, USelect, USelectMenu, UInputMenu, UInputNumber, UInputDate, UInputTime, UInputTags, UCheckbox, UCheckboxGroup, URadioGroup, USwitch, UColorPicker, USlider, UPinInput, UFileUpload
**Table**: UTable, UPagination
**Overlays**: UModal, USlideover, UDrawer, UPopover, UTooltip, UDropdownMenu, UContextMenu
**Navigation**: UTabs, UBreadcrumb, UNavigationMenu, UStepper, UCommandPalette
**Display**: UButton, UBadge, UCard, UAlert, UAvatar, UAvatarGroup, UChip, UAccordion, UCalendar, UCarousel, UProgress, UMeter, USkeleton, USeparator, UKbd, UCollapsible, UTree, UTimeline, UEmpty, UMarquee, UScrollArea, UUser
**Layout**: UApp, UContainer, ULink, UIcon, UFieldGroup, UToast, UError, UFooter, UHeader, UMain, UTheme
</component_index>

<success_criteria>
- Correct reference file(s) loaded based on user's question or argument
- Only relevant sections presented (not entire file dumps)
- Cross-references loaded when question spans multiple topics
- User gets accurate, actionable Nuxt UI v4 guidance
</success_criteria>

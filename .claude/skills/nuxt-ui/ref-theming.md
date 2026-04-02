# Nuxt UI v4 — Theming & Configuration (v4.5.1)

Built on Reka UI primitives, Tailwind CSS v4, and Iconify icons (200,000+).

## Installation

```bash
pnpm add @nuxt/ui tailwindcss
```

CSS file (`~/assets/css/main.css`):
```css
@import "tailwindcss";
@import "@nuxt/ui";
```

App wrapper (required for Toaster, Tooltip, Overlay providers):
```vue
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

## nuxt.config.ts Options

```ts
ui: {
  prefix: 'U',                    // Component prefix (default: 'U')
  fonts: true,                     // Auto-register @nuxt/fonts
  colorMode: true,                 // Auto-register @nuxt/color-mode
  theme: {
    colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error'],
    transitions: true,             // CSS transitions on components
    defaultVariants: {
      color: 'primary',
      size: 'md'
    },
    prefix: 'tw'                   // Tailwind CSS prefix (v4.2+)
  },
  experimental: {
    componentDetection: false       // Tree-shaking (v4.1+)
  }
}
```

## Semantic Colors

| Name | Default | Purpose |
|------|---------|---------|
| `primary` | `green` | Main CTAs, active navigation, brand |
| `secondary` | `blue` | Secondary buttons, alternative actions |
| `success` | `green` | Positive confirmations, completed states |
| `info` | `blue` | Alerts, tooltips, help text |
| `warning` | `yellow` | Pending states, attention-needed items |
| `error` | `red` | Error messages, destructive actions |
| `neutral` | `slate` | Text, borders, backgrounds, disabled states |

Configure in `app.config.ts` (runtime, no restart needed):
```ts
export default defineAppConfig({
  ui: {
    colors: { primary: 'amber', secondary: 'purple', neutral: 'stone' },
    icons: {
      loading: 'i-lucide-loader-circle',
      close: 'i-lucide-x',
      search: 'i-lucide-search'
    }
  }
})
```

Additional semantic colors: 1) register in `theme.colors`, 2) map in `ui.colors`, 3) use via `color` prop.

## Design Tokens (CSS Custom Properties)

Auto-adapt to light/dark mode:

| Tailwind Class | Light Default | Dark Default |
|---|---|---|
| `text-default` | neutral-700 | neutral-200 |
| `text-dimmed` | neutral-400 | neutral-500 |
| `text-muted` | neutral-500 | neutral-400 |
| `text-toned` | neutral-600 | neutral-300 |
| `text-highlighted` | neutral-900 | white |
| `text-inverted` | white | neutral-900 |
| `bg-default` | white | neutral-900 |
| `bg-muted` | neutral-50 | neutral-800 |
| `bg-elevated` | neutral-100 | neutral-800 |
| `bg-accented` | neutral-200 | neutral-700 |
| `bg-inverted` | neutral-900 | white |
| `border-default` | neutral-200 | neutral-800 |
| `border-accented` | neutral-300 | neutral-700 |

Override in CSS: `html { --ui-bg: #f3e2c6; --ui-text: #3f2b1d; }`

Custom design tokens via `@theme`:
```css
@theme {
  --font-sans: 'Inter', sans-serif;
  --color-brand-50: #f0f9ff;
  /* ... 50-950 shades required for custom colors */
}
```

## Color Mode

`@nuxtjs/color-mode` is auto-registered. Built-in components: `ColorModeButton`, `ColorModeSwitch`, `ColorModeSelect`, `ColorModeAvatar`, `ColorModeImage`.

```ts
const colorMode = useColorMode()
colorMode.preference = 'dark' // 'light' | 'dark' | 'system'
```

Wrap in `<ClientOnly>` to prevent hydration mismatches.

## The `ui` Prop System

Every component accepts a `ui` prop for per-instance style overrides. Keys are **slot names** mapping to Tailwind classes:
```vue
<UButton :ui="{ base: 'rounded-full', leadingIcon: 'text-gold' }" />
<UTable :ui="{ tr: 'cursor-pointer', th: 'text-gold' }" />
<UModal :ui="{ content: 'bg-charcoal', title: 'text-gold' }" />
```

Global theme overrides: `app.config.ts` under `ui.{componentName}`.

## Icons (Iconify)

Format: `i-{collection}-{icon-name}`. Default collection: `lucide`.
```vue
<UIcon name="i-lucide-home" class="size-5" />
<UButton icon="i-lucide-plus" label="Add" />
<UInput icon="i-lucide-search" />
```

Install icon data locally: `pnpm i @iconify-json/lucide`

Custom local collections:
```ts
// nuxt.config.ts
icon: {
  customCollections: [
    { prefix: 'custom', dir: './app/assets/icons' }
  ]
}
```

## Shared Props (most components)

- **color**: `'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'`
- **variant**: `'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'` (varies)
- **size**: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`

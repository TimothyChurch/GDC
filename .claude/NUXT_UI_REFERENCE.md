# Nuxt UI v4 Reference (v4.5.1)

> Comprehensive reference for all Nuxt UI v4 components, composables, theming, and patterns. Built on Reka UI primitives, Tailwind CSS v4, and Iconify icons (200,000+). 125+ accessible components. 946K+ monthly downloads.

## Table of Contents
- [Configuration & Theming](#configuration--theming)
- [Form Components](#form-components)
- [Table (TanStack)](#table-tanstack)
- [Overlay Components](#overlay-components)
- [Composables](#composables)
- [Navigation Components](#navigation-components)
- [Data Display Components](#data-display-components)
- [Layout Components](#layout-components)
- [Complete Component Index](#complete-component-index)
- [Key Differences from v2/v3](#key-differences-from-v2v3)

---

## Configuration & Theming

### Installation
```bash
pnpm add @nuxt/ui tailwindcss
```

CSS file (e.g., `~/assets/css/main.css`):
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

### nuxt.config.ts Options
```ts
ui: {
  prefix: 'U',                    // Component prefix (default: 'U')
  fonts: true,                     // Auto-register @nuxt/fonts (default: true)
  colorMode: true,                 // Auto-register @nuxt/color-mode (default: true)
  mdc: false,                      // Force Prose components without @nuxtjs/mdc
  content: false,                  // Force Prose/UContent without @nuxt/content
  theme: {
    colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error'], // Semantic colors
    transitions: true,             // CSS transitions on components (default: true)
    defaultVariants: {             // Override default color and size variants
      color: 'primary',           // default: 'primary'
      size: 'md'                  // default: 'md'
    },
    prefix: 'tw'                  // Tailwind CSS prefix (v4.2+, requires CSS: @import "tailwindcss" prefix(tw))
  },
  experimental: {
    componentDetection: false      // Tree-shaking via auto component detection (v4.1+)
    // Can be boolean or array of component names for dynamic usage
  }
}
```

### Semantic Colors (defaults)
| Name | Default | Purpose |
|------|---------|---------|
| `primary` | `green` | Main CTAs, active navigation, brand elements |
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
    icons: { loading: 'i-lucide-loader-circle', close: 'i-lucide-x', search: 'i-lucide-search' }
  }
})
```

Additional semantic colors can be added by: 1) registering in `theme.colors`, 2) mapping in `ui.colors`, 3) using via the `color` prop.

### Design Tokens (CSS Custom Properties)
All components reference these tokens which auto-adapt to light/dark mode:

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

Custom design tokens via `@theme` directive:
```css
@theme {
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'Fira Code', monospace;
  --color-brand-50: #f0f9ff;
  /* ... 50-950 shades required for custom colors */
  --breakpoint-3xl: 1920px;
}
```

### Color Mode
`@nuxtjs/color-mode` is auto-registered. Components available:
- `ColorModeButton`, `ColorModeSwitch`, `ColorModeSelect` -- control components
- `ColorModeAvatar`, `ColorModeImage` -- display components

```ts
const colorMode = useColorMode()
colorMode.preference = 'dark' // 'light' | 'dark' | 'system'
```

Wrap in `<ClientOnly>` to prevent hydration mismatches.

### The `ui` Prop System
Every component accepts a `ui` prop for per-instance style overrides. Keys are **slot names** mapping to Tailwind classes:
```vue
<UButton :ui="{ base: 'rounded-full', leadingIcon: 'text-gold' }" />
<UTable :ui="{ tr: 'cursor-pointer', th: 'text-gold' }" />
<UModal :ui="{ content: 'bg-charcoal', title: 'text-gold' }" />
```

Global theme overrides go in `app.config.ts` under `ui.{componentName}`.

### Icons (Iconify)
Format: `i-{collection}-{icon-name}`. Default collection: `lucide`.
```vue
<UIcon name="i-lucide-home" class="size-5" />
<UButton icon="i-lucide-plus" label="Add" />
<UInput icon="i-lucide-search" />
```

Install icon data locally for performance:
```bash
pnpm i @iconify-json/lucide
```

Custom local collections via `nuxt.config.ts`:
```ts
icon: {
  customCollections: [
    { prefix: 'custom', dir: './app/assets/icons' }
  ]
}
```

### Component Color/Variant/Size Props (shared across most components)
- **color**: `'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'`
- **variant**: `'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'` (varies by component)
- **size**: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`

---

## Form Components

### UForm
Top-level form wrapper. Handles validation and error distribution to child UFormField components.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string \| number` | - | Unique identifier |
| `schema` | `SchemaObject` | - | Yup/Zod/Valibot/Joi/Superstruct schema (Standard Schema) |
| `state` | `Partial<InferInput<S>>` | - | Reactive form state |
| `validate` | `(state) => FormError[] \| Promise<FormError[]>` | - | Custom validation function |
| `validateOn` | `FormInputEvents[]` | - | Events: `'input'`, `'change'`, `'blur'` |
| `validateOnInputDelay` | `number` | `300` | Debounce for input validation (ms) |
| `disabled` | `boolean` | `false` | Disable all controls |
| `name` | `string` | - | Nested form path in parent state |
| `transform` | `boolean` | `true` | Apply schema transforms on submit |
| `nested` | `boolean` | - | Attach to parent form validation |
| `loadingAuto` | `boolean` | `true` | Auto-disable elements during async submit |

**Events**: `@submit(FormSubmitEvent<T>)`, `@error(FormErrorEvent)`

**Template Ref Methods**:
| Method | Signature | Returns |
|--------|-----------|---------|
| `submit()` | `() => Promise<void>` | Triggers HTML5 validation + submit |
| `validate()` | `(opts?: { name?, silent?, nested?, transform? }) => Promise<T>` | Validated data |
| `clear()` | `(path?: keyof T \| RegExp) => void` | Clears errors |
| `getErrors()` | `(path?) => FormError[]` | Gets errors by path |
| `setErrors()` | `(errors[], name?) => void` | Sets errors |

**Reactive Refs**: `errors`, `disabled`, `dirty`, `dirtyFields`, `touchedFields`, `blurredFields`

**FormError Interface**:
```ts
interface FormError { message: string; name: string; id?: string; }
```

**Validation Libraries**: Valibot, Zod, Regle, Yup, Joi, Superstruct -- all work via Standard Schema.

**Supports native `<form>` attributes**: `action`, `method`, `enctype`, `target`, `autocomplete`, `novalidate`, `acceptcharset`

**Yup Pattern (this project)**:
```vue
<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  name: yup.string().required('Required')
})
type Schema = yup.InferType<typeof schema>

const state = reactive({ email: undefined, name: undefined })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // event.data is typed and validated
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormField>
    <UButton type="submit">Submit</UButton>
  </UForm>
</template>
```

### UFormField (replaces v2's UFormGroup)
Wraps form controls. Auto-receives validation errors from parent UForm by matching `name` prop.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `any` | - | Element/component to render as |
| `name` | `string` | - | Must match schema/state key |
| `errorPattern` | `RegExp` | - | Regex for error name matching |
| `label` | `string` | - | Label text |
| `description` | `string` | - | Below label |
| `help` | `string` | - | Below input |
| `hint` | `string` | - | Right of label |
| `error` | `string \| boolean` | - | Manual error (auto-set by UForm; takes precedence over help) |
| `required` | `boolean` | `false` | Adds asterisk |
| `size` | Size | `'md'` | Proxied to child controls |
| `eagerValidation` | `boolean` | - | Validate immediately instead of on blur |
| `validateOnInputDelay` | `number` | - | Override parent's delay |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |

**Slots**: `default`, `label`, `hint`, `description`, `help`, `error`

**Auto ID**: Label `for` and form control are auto-associated with unique `id`.

### UInput
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `HTMLInputAttribute` | `'text'` | HTML input type |
| `placeholder` | `string` | - | Placeholder |
| `modelValue` | `any` | - | v-model binding |
| `defaultValue` | `any` | - | Initial value |
| `color` | Color | `'primary'` | Focus ring color |
| `variant` | `'outline' \| 'soft' \| 'subtle' \| 'ghost' \| 'none'` | `'outline'` | Style |
| `size` | Size | `'md'` | Size |
| `highlight` | `boolean` | - | Show ring color like focus state |
| `fixed` | `boolean` | - | Keep mobile text size on all breakpoints |
| `icon` / `leadingIcon` / `trailingIcon` | `string` | - | Icons |
| `leading` / `trailing` | `boolean` | - | Show icon position |
| `avatar` | `AvatarProps` | - | Leading avatar |
| `loading` | `boolean` | `false` | Loading spinner |
| `loadingIcon` | `string` | `'i-lucide-loader-circle'` | Loading icon |
| `disabled` / `readonly` | `boolean` | `false` | States |
| `required` | `boolean` | - | Required field |
| `autocomplete` | `string` | `'off'` | Autocomplete |
| `autofocus` | `boolean` | - | Focus on mount |
| `autofocusDelay` | `number` | `0` | Delay before focus |

**Slots**: `leading`, `default`, `trailing`
**Events**: `update:modelValue`, `blur(FocusEvent)`, `change(Event)`
**Expose**: `inputRef: Ref<HTMLInputElement | null>`

**Supports HTML attributes**: `id`, `name`, `form`, `list`, `min`, `max`, `step`, `maxlength`, `minlength`, `pattern`, `enterKeyHint`, `formaction`, `formenctype`, `formmethod`, `formnovalidate`, `formtarget`

### UTextarea
All UInput props plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `3` | Number of rows |
| `autoresize` | `boolean` | - | Dynamic height adjustment |
| `maxrows` | `number` | `0` | Max rows during autoresize (0 = unlimited) |
| `autoresizeDelay` | `number` | `0` | Delay before resizing |

**Slots**: `leading`, `default`, `trailing`
**Events**: `update:modelValue`, `blur(FocusEvent)`, `change(Event)`
**Expose**: `textareaRef: Ref<HTMLTextAreaElement | null>`

### USelect
Native-like dropdown. **v-model binds to the VALUE property**.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Options (strings, numbers, or objects) |
| `modelValue` | `any` | - | v-model binding |
| `defaultValue` | `any` | - | Initial value |
| `multiple` | `boolean` | `false` | Multi-select |
| `valueKey` | `string` | `'value'` | Object property for value |
| `labelKey` | `string` | `'label'` | Object property for display |
| `descriptionKey` | `string` | `'description'` | Object property for description |
| `placeholder` | `string` | - | Empty state text |
| `color` | Color | - | Ring color |
| `variant` | `'outline' \| 'soft' \| 'subtle' \| 'ghost' \| 'none'` | `'outline'` | Style |
| `size` | Size | `'md'` | Size |
| `icon` / `leadingIcon` / `trailingIcon` | `string` | - | Icons |
| `selectedIcon` | `string` | `'i-lucide-check'` | Selected item checkmark |
| `avatar` | `AvatarProps` | - | Leading avatar |
| `loading` | `boolean` | - | Loading state |
| `highlight` | `boolean` | - | Focus ring styling |
| `open` / `defaultOpen` | `boolean` | - | Menu visibility control |
| `content` | `object` | - | Menu positioning (align, side) |
| `arrow` | `boolean` | - | Show arrow |
| `portal` | `boolean` | `true` | Render in portal |
| `clear` | `boolean` | - | Clear button |
| `disabled` / `required` | `boolean` | - | States |

**Slots**: `leading`, `default`, `trailing`, `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `content-top`, `content-bottom`
**Events**: `update:modelValue`, `update:open`, `change`, `blur`, `focus`
**Expose**: `triggerRef`, `viewportRef`

**Item Object Structure**:
```ts
{ label?, value?, type?: 'label' | 'separator' | 'item', icon?, avatar?, chip?, disabled?, class?, ui? }
```

```vue
<USelect v-model="status" :items="['active', 'completed', 'cancelled']" />
<USelect v-model="unitId" :items="units" value-key="_id" label-key="name" />
```

### USelectMenu
Advanced searchable select. **v-model binds to the WHOLE OBJECT by default** (use `value-key` to bind to a property).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Options (strings, numbers, objects, nested arrays for groups) |
| `modelValue` | `any` | - | v-model binding |
| `valueKey` | `string` | - | Bind to property instead of whole object |
| `labelKey` | `string` | `'label'` | Display property |
| `descriptionKey` | `string` | `'description'` | Description field |
| `searchInput` | `boolean \| InputProps` | - | Search config or false to hide |
| `searchTerm` | `string` | - | v-model:search-term |
| `ignoreFilter` | `boolean` | `false` | For server-side search |
| `filterFields` | `string[]` | `[labelKey]` | Fields to search |
| `createItem` | `boolean \| 'always' \| object` | - | Allow creating new items |
| `virtualize` | `boolean \| { estimateSize, overscan }` | - | Virtual scrolling |
| `multiple` | `boolean` | `false` | Multi-select |
| `clear` | `boolean` | `false` | Show clear button |
| `clearIcon` | `string` | `'i-lucide-x'` | Clear icon |
| `selectedIcon` | `string` | `'i-lucide-check'` | Selected item icon |
| `by` | `string \| Function` | - | Compare objects by field or function |
| `color` | Color | - | Ring color |
| `variant` | `'outline' \| 'soft' \| 'subtle' \| 'ghost' \| 'none'` | - | Style |
| `size` | Size | - | Size |
| `highlight` | `boolean` | - | Validation focus styling |
| `highlightOnHover` | `boolean` | - | Highlight items on hover |
| `content` | `object` | - | Menu positioning |
| `arrow` | `boolean` | - | Show arrow |
| `portal` | `boolean` | `true` | Render in portal |
| `open` / `defaultOpen` | `boolean` | - | Menu visibility |
| `resetSearchTermOnBlur` | `boolean` | `true` | Clear search on blur |
| `resetSearchTermOnSelect` | `boolean` | `true` | Clear search after selection |
| `resetModelValueOnClear` | `boolean` | `true` | Reset to null/[] on clear |
| `loading` / `disabled` / `required` | `boolean` | - | States |

**Slots**: `leading`, `default`, `trailing`, `empty`, `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `content-top`, `content-bottom`, `create-item-label`
**Events**: `update:modelValue`, `update:open`, `update:searchTerm`, `change`, `blur`, `focus`, `create`, `clear`, `highlight`
**Expose**: `triggerRef`, `viewportRef`

**When to use USelect vs USelectMenu:**
- **USelect**: Small static list (<20 items), no search needed, simple value binding
- **USelectMenu**: Need search/filter, create items, object binding, large lists, multi-select

### UInputMenu
Autocomplete input with real-time suggestions. Built on Reka UI's Combobox. Similar to SelectMenu but rendered as an input field.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Options (strings, numbers, objects, nested arrays for groups) |
| `modelValue` | `any` | - | v-model binding |
| `autocomplete` | `boolean` | - | Free-form text input with suggestions (makes modelValue a string) |
| `multiple` | `boolean` | - | Multi-select (displays as tags) |
| `valueKey` | `string` | - | Bind to object property |
| `labelKey` | `string` | `'label'` | Display property |
| `descriptionKey` | `string` | `'description'` | Description field |
| `by` | `string \| Function` | - | Object comparison |
| `filterFields` | `string[]` | `[labelKey]` | Fields to search |
| `ignoreFilter` | `boolean` | - | Disable internal filtering |
| `createItem` | `boolean \| 'always' \| object` | - | Allow custom values |
| `searchTerm` | `string` | - | v-model:search-term |
| `placeholder` | `string` | - | Input placeholder |
| `color` / `variant` / `size` | standard | standard | Styling |
| `highlight` / `fixed` | `boolean` | - | Focus styling / mobile text |
| `icon` / `leadingIcon` / `trailingIcon` | `string` | - | Icons |
| `selectedIcon` | `string` | `'i-lucide-check'` | Selected indicator |
| `deleteIcon` | `string` | `'i-lucide-x'` | Tag delete icon (multiple mode) |
| `clear` | `boolean \| ButtonProps` | - | Clear button |
| `open` / `defaultOpen` | `boolean` | - | Menu visibility |
| `openOnClick` / `openOnFocus` | `boolean` | - | Auto-open triggers |
| `content` | `object` | - | Menu positioning |
| `arrow` / `portal` | standard | standard | Display options |
| `virtualize` | `boolean \| config` | - | Virtual scrolling |

**Slots**: `leading`, `trailing`, `empty`, `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `tags-item-text`, `tags-item-delete`, `content-top`, `content-bottom`, `create-item-label`
**Events**: `update:modelValue`, `update:open`, `update:searchTerm`, `change`, `blur`, `focus`, `create`, `clear`, `highlight`, `remove-tag`
**Expose**: `inputRef`, `viewportRef`

**Note**: When `autocomplete` is enabled, `multiple`, `by`, and `resetSearchTermOnSelect` are unavailable.

### UInputNumber
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | - | v-model binding |
| `min` / `max` / `step` | `number` | - | Range and step |
| `stepSnapping` | `boolean` | `true` | Snap to step increments |
| `formatOptions` | `Intl.NumberFormatOptions` | - | Currency, percent, decimal styles |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Button layout |
| `increment` / `decrement` | `boolean \| ButtonProps` | `true` | +/- buttons |
| `incrementIcon` | `string` | `'i-lucide-plus'` | Increment icon |
| `decrementIcon` | `string` | `'i-lucide-minus'` | Decrement icon |
| `incrementDisabled` / `decrementDisabled` | `boolean` | - | Disable individual buttons |
| `disableWheelChange` | `boolean` | - | Prevent wheel scroll changes |
| `invertWheelChange` | `boolean` | - | Reverse wheel direction |
| `focusOnChange` | `boolean` | - | Focus on value change |
| `color` / `variant` / `size` | standard | standard | Styling |
| `highlight` / `fixed` | `boolean` | - | Focus styling / mobile text |

**Slots**: `increment`, `decrement`
**Events**: `update:modelValue`, `blur(FocusEvent)`, `change(Event)`
**Expose**: `inputRef: Ref<HTMLInputElement | null>`

```vue
<UInputNumber v-model="price" :format-options="{ style: 'currency', currency: 'USD' }" />
```

### UInputDate
Date input using `@internationalized/date` for locale-aware formatting.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `null \| CalendarDate \| CalendarDateTime \| ZonedDateTime \| DateRange` | - | v-model binding |
| `range` | `boolean` | `false` | Date range selection |
| `granularity` | `Granularity` | `'day'` / `'minute'` | Formatting granularity |
| `hourCycle` | `HourCycle` | locale-dependent | 12 or 24 hour format |
| `step` | `DateStep` | `1` | Stepping interval |
| `hideTimeZone` | `boolean` | `false` | Hide timezone segment |
| `minValue` / `maxValue` | `DateValue` | - | Date constraints |
| `isDateUnavailable` | `Matcher` | - | Unavailable date function |
| `separatorIcon` | `string` | - | Range separator icon |
| `color` / `variant` / `size` | standard | standard | Styling |
| `icon` / `leadingIcon` / `trailingIcon` | `string` | - | Icons |

**Slots**: `leading`, `default`, `trailing`, `separator`
**Events**: `update:modelValue`, `update:placeholder`, `change`, `blur`, `focus`

### UInputTime
Time input using `@internationalized/date`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `null \| Time \| CalendarDateTime \| ZonedDateTime` | - | v-model binding |
| `granularity` | `'hour' \| 'minute' \| 'second'` | `'minute'` | Time precision |
| `hourCycle` | `HourCycle` | locale-dependent | 12/24 format |
| `step` | `DateStep` | `1` | Stepping interval |
| `stepSnapping` | `boolean` | `false` | Snap to step |
| `hideTimeZone` | `boolean` | - | Hide timezone |
| `minValue` / `maxValue` | `TimeValue` | - | Time constraints |
| `color` / `variant` / `size` | standard | standard | Styling |

**Slots**: `leading`, `default`, `trailing`
**Events**: `update:modelValue`, `update:placeholder`, `blur`, `focus`, `change`

### UInputTags
Interactive tag input.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T[] \| null` | - | v-model binding |
| `defaultValue` | `T[]` | - | Initial tags |
| `placeholder` | `string` | - | Input placeholder |
| `maxLength` | `number` | - | Max chars per tag |
| `max` | `number` | - | Max number of tags |
| `deleteIcon` | `string` | `'i-lucide-x'` | Remove tag icon |
| `addOnPaste` | `boolean` | - | Add tags on paste |
| `addOnTab` | `boolean` | - | Add tags on Tab |
| `addOnBlur` | `boolean` | - | Add tags on blur |
| `duplicate` | `boolean` | - | Allow duplicates |
| `delimiter` | `string \| RegExp` | - | Tag delimiter |
| `convertValue` | `(value: string) => T` | - | Convert input to type |
| `displayValue` | `(value: T) => string` | - | Format display |
| `color` / `variant` / `size` | standard | standard | Styling |

**Slots**: `leading`, `default`, `trailing`, `item-text`, `item-delete`
**Events**: `update:modelValue`, `change`, `blur`, `focus`, `invalid(T)`, `addTag(T)`, `removeTag(T)`
**Expose**: `inputRef: Ref<HTMLInputElement | null>`

### UCheckbox
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T \| 'indeterminate' \| null` | - | v-model binding |
| `defaultValue` | `T \| 'indeterminate'` | - | Initial value |
| `label` | `string` | - | Label text |
| `description` | `string` | - | Description text |
| `color` | Color | `'primary'` | Indicator color |
| `variant` | `'card' \| 'list'` | `'list'` | Visual variant |
| `size` | Size | `'md'` | Size |
| `indicator` | `'start' \| 'end' \| 'hidden'` | `'start'` | Checkbox position |
| `icon` | `string` | `'i-lucide-check'` | Checked icon |
| `indeterminateIcon` | `string` | `'i-lucide-minus'` | Indeterminate icon |
| `trueValue` | `T` | `true` | Value when checked |
| `falseValue` | `T` | `false` | Value when unchecked |
| `disabled` / `required` | `boolean` | - | States |

**Slots**: `label`, `description`
**Events**: `update:modelValue`, `change(Event)`

### URadioGroup
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `any` | - | v-model: selected value |
| `items` | `Array` | - | Options (strings, numbers, or objects) |
| `valueKey` | `string` | `'value'` | Value property |
| `labelKey` | `string` | `'label'` | Label property |
| `descriptionKey` | `string` | `'description'` | Description property |
| `legend` | `string` | - | Group legend label |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout |
| `variant` | `'list' \| 'card' \| 'table'` | `'list'` | Visual style |
| `color` | Color | `'primary'` | Accent color |
| `size` | Size | `'md'` | Size |
| `indicator` | `'start' \| 'end' \| 'hidden'` | `'start'` | Indicator position |
| `loop` | `boolean` | - | Keyboard navigation looping |
| `disabled` / `required` | `boolean` | - | States |

**Slots**: `legend`, `label`, `description`
**Events**: `update:modelValue`, `change(Event)`

### USwitch
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T \| null` | - | v-model binding |
| `defaultValue` | `T` | - | Initial value |
| `label` | `string` | - | Label text |
| `description` | `string` | - | Description text |
| `color` | Color | `'primary'` | Color |
| `size` | Size | `'md'` | Size |
| `loading` | `boolean` | `false` | Loading state |
| `loadingIcon` | `string` | `'i-lucide-loader-circle'` | Loading icon |
| `checkedIcon` | `string` | - | Icon when checked |
| `uncheckedIcon` | `string` | - | Icon when unchecked |
| `trueValue` | `T` | `true` | Value when on |
| `falseValue` | `T` | `false` | Value when off |
| `disabled` / `required` | `boolean` | - | States |

**Slots**: `label`, `description`
**Events**: `update:modelValue`, `change(Event)`

### UColorPicker
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | - | v-model binding |
| `defaultValue` | `string` | `'#FFFFFF'` | Initial color |
| `format` | `'hex' \| 'rgb' \| 'hsl' \| 'cmyk' \| 'lab'` | `'hex'` | Output format |
| `size` | Size | `'md'` | Size |
| `throttle` | `number` | `50` | Throttle time (ms) |
| `disabled` | `boolean` | `false` | Disable |

**Events**: `update:modelValue`

### USlider
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number \| number[]` | - | v-model (array for range) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction |
| `tooltip` | `boolean \| TooltipProps` | - | Show value tooltip |
| `inverted` | `boolean` | `false` | Reverse display |
| `minStepsBetweenThumbs` | `number` | - | Min distance for range |
| `color` | Color | `'primary'` | Color |
| `size` | Size | `'md'` | Size |
| `disabled` | `boolean` | `false` | Disable |

**Events**: `update:modelValue`, `change(Event)`

### UPinInput
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `PinInputValue<T> \| null` | - | v-model binding |
| `length` | `string \| number` | `5` | Number of input fields |
| `type` | `'text' \| 'number'` | `'text'` | Input type |
| `mask` | `boolean` | - | Hide input (password-like) |
| `otp` | `boolean` | - | OTP auto-detection on mobile |
| `placeholder` | `string` | - | Placeholder character |
| `color` / `variant` / `size` | standard | standard | Styling |
| `highlight` / `fixed` | `boolean` | - | Focus styling / mobile text |
| `disabled` / `required` | `boolean` | - | States |

**Events**: `update:modelValue`, `complete`, `change`, `blur`
**Expose**: `inputsRef` -- array of input component instances

### UFileUpload
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `File \| File[] \| null` | - | v-model binding |
| `accept` | `string` | `'*'` | MIME types/extensions |
| `multiple` | `boolean` | `false` | Multi-file |
| `variant` | `'area' \| 'button'` | `'area'` | Visual style (button only for single file) |
| `layout` | `'list' \| 'grid'` | `'grid'` | File preview layout (area variant) |
| `position` | `'inside' \| 'outside'` | `'outside'` | File position (area + list layout) |
| `icon` | `string` | `'i-lucide-upload'` | Upload icon |
| `label` | `string` | - | Label text |
| `description` | `string` | - | Description text |
| `dropzone` | `boolean` | `true` | Enable drag-drop |
| `interactive` | `boolean` | `true` | Clickable dropzone |
| `preview` | `boolean` | `true` | Show file previews |
| `reset` | `boolean` | `false` | Reset input on dialog open |
| `fileDelete` | `boolean \| ButtonProps` | `true` | Delete button config |
| `color` / `size` | standard | standard | Styling |
| `highlight` | `boolean` | - | Focus styling |
| `disabled` / `required` | `boolean` | - | States |

**Slots**: `default`, `leading`, `label`, `description`, `actions({ open, removeFile })`, `files`, `files-top({ open, files })`, `files-bottom({ removeFile, files })`, `file`, `file-leading`, `file-name`, `file-size`, `file-trailing`
**Events**: `update:modelValue`, `change(Event)`
**Expose**: `inputRef`, `dropzoneRef`

---

## Table (TanStack)

UTable is built on TanStack Table. Import type: `import type { TableColumn } from '@nuxt/ui'`

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | - | Row data (**not** `rows`) |
| `columns` | `TableColumn<T>[]` | - | Column definitions |
| `caption` | `string` | - | Table caption |
| `loading` | `boolean` | `false` | Loading state |
| `loadingColor` | Color | - | Loading indicator color |
| `loadingAnimation` | `'carousel' \| 'swing' \| 'elastic'` | - | Animation |
| `empty` | `string` | - | Empty state text |
| `sticky` | `boolean \| 'header' \| 'footer'` | - | Sticky positioning |
| `virtualize` | `boolean \| { estimateSize, overscan }` | - | Virtual scrolling (1000+ rows) |
| `getSubRows` | `Function` | - | Access nested/tree row data |
| `getRowId` | `Function` | - | Custom row identifier |
| `meta` | `object` | - | Metadata for table instance |
| `watchOptions` | `object` | `{ deep: true }` | Reactivity depth control |

**v-model State Props**: `globalFilter`, `columnFilters`, `sorting`, `rowSelection`, `expanded`, `pagination` (`{ pageIndex: number, pageSize: number }`), `columnVisibility`, `columnPinning`, `grouping`, `columnOrder`, `columnSizing`

**Options Props** (TanStack config): `paginationOptions`, `sortingOptions`, `globalFilterOptions`, `expandedOptions`, `rowSelectionOptions`, `groupingOptions`, `columnFiltersOptions`

### Column Definition
```ts
const columns: TableColumn<MyType>[] = [
  {
    accessorKey: 'name',          // Data property key
    // OR: accessorFn: (row) => row.firstName + ' ' + row.lastName,
    id: 'name',                   // Unique ID (auto-derived from accessorKey)
    header: 'Name',               // String or render function
    // header: ({ column }) => h(UButton, { onClick: () => column.toggleSorting() }, 'Name'),
    cell: ({ row }) => row.original.name,  // Cell render function
    // footer: ({ column }) => h(...),
    enableSorting: true,
    enableHiding: true,
    size: 200,                    // Column width
    meta: {
      class: { th: 'text-right', td: 'text-right font-mono' },
      style: { th: '', td: '' },
      colspan: { td: 2 },        // Number or function
      rowspan: { td: 1 }         // Number or function
    }
  },
  { id: 'actions', cell: ({ row }) => h(UDropdownMenu, { items: getActions(row) }, ...) }
]
```

**Sortable Header Pattern**:
```ts
header: ({ column }) => {
  const isSorted = column.getIsSorted()
  return h(UButton, {
    color: 'neutral', variant: 'ghost', label: 'Column Name',
    icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
    class: '-mx-2.5',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
  })
}
```

**Render components in columns**: Use `resolveComponent('UButton')` or import from `#components`.

### Slots
| Slot | Props | Description |
|------|-------|-------------|
| `#[columnId]-header` | `{ column, header, table }` | Custom header per column |
| `#[columnId]-cell` | `{ row, cell, column, getValue, table }` | Custom cell per column |
| `#expanded` | `{ row }` | Expanded row content |
| `#empty` | - | Custom empty state |
| `#loading` | - | Custom loading state |
| `#caption` | - | Custom caption |
| `#body-top` | - | Content above body rows |
| `#body-bottom` | - | Content below body rows |

### Events
| Event | Signature | Description |
|-------|-----------|-------------|
| `@select` | `(e: Event, row: TableRow<T>) => void` | Row click |
| `@hover` | `(e: Event, row: TableRow<T> \| null) => void` | Row hover |
| `@contextmenu` | `(e: Event, row: TableRow<T>) => void` | Right-click on row |

### Styling
```vue
<UTable
  :ui="{ root: '', base: 'min-w-full', thead: '', tbody: '', tr: 'cursor-pointer', th: 'px-4 py-3.5', td: 'p-4 text-sm', separator: '', empty: 'py-6 text-center', loading: '' }"
/>
```

### Table API Access
```vue
<UTable ref="table" ... />
<script setup>
const table = useTemplateRef('table')
// table.value?.tableApi?.getFilteredRowModel().rows.length
// table.value?.tableApi?.setPageIndex(0)
// table.value?.tableApi?.getColumn('email')?.setFilterValue(...)
// table.value?.tableApi?.getFilteredSelectedRowModel()
// table.value?.tableApi?.toggleAllPageRowsSelected()
</script>
```

### Pagination Integration
```vue
<UTable ref="table" v-model:pagination="pagination" :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }" />
<UPagination
  :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
  :items-per-page="table?.tableApi?.getState().pagination.pageSize"
  :total="table?.tableApi?.getFilteredRowModel().rows.length"
  @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
/>
```
Note: UPagination is 1-based, TanStack is 0-based.

### Advanced Table Features
- **Row Selection**: Add checkbox column with `row.toggleSelected()`, bind `v-model:row-selection`
- **Column Pinning**: `column.pin('left'|'right')`, bind `v-model:column-pinning`
- **Grouping**: Pass `grouping` array + `getGroupedRowModel()`, use `row.getIsGrouped()`
- **Tree Data**: Provide `getSubRows` function returning children array
- **Virtualization**: Set `virtualize` prop (requires fixed height container); disables sticky and row dividers
- **Hover with Popover**: Use `refDebounced` to prevent flicker

### UPagination
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | - | Current page (v-model:page, 1-based) |
| `total` | `number` | `0` | Total items |
| `itemsPerPage` | `number` | `10` | Per page |
| `siblingCount` | `number` | `2` | Sibling buttons |
| `showControls` | `boolean` | `true` | Prev/next/first/last buttons |
| `showEdges` | `boolean` | `false` | First/last always shown |
| `color` | Color | `'neutral'` | Inactive button color |
| `variant` | Variant | `'outline'` | Inactive button variant |
| `activeColor` | Color | `'primary'` | Active button color |
| `activeVariant` | Variant | `'solid'` | Active button variant |
| `size` | Size | `'md'` | Button size |
| `disabled` | `boolean` | - | Disable controls |
| `to` | `(page: number) => string \| object` | - | Transform buttons into links |

**Slots**: `first`, `prev`, `next`, `last`, `ellipsis`, `item`
**Events**: `update:page`

---

## Overlay Components

### UModal
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title |
| `description` | `string` | - | Header description |
| `open` | `boolean` | - | v-model:open |
| `defaultOpen` | `boolean` | - | Initial state |
| `overlay` | `boolean` | `true` | Backdrop |
| `transition` | `boolean` | `true` | Animations |
| `fullscreen` | `boolean` | - | Full screen |
| `scrollable` | `boolean` | `false` | Scrollable content (v4.2+, incompatible with modal: false) |
| `close` | `boolean \| ButtonProps` | `true` | Close button |
| `closeIcon` | `string` | `'i-lucide-x'` | Close icon |
| `dismissible` | `boolean` | `true` | Click outside/Escape to close |
| `modal` | `boolean` | `true` | Block outside interaction |
| `portal` | `string \| boolean \| HTMLElement` | `true` | Portal rendering |

**Slots**: `default` (trigger), `content`, `header`, `title`, `description`, `actions`, `close`, `body`, `footer({ close })`
**Events**: `@update:open`, `@close:prevent`, `@after:enter`, `@after:leave`

Supports nested modals, command palette integration, non-modal mode (`modal: false` auto-disables overlay).

### USlideover
Same API as UModal plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `side` | `'right' \| 'top' \| 'bottom' \| 'left'` | `'right'` | Slide direction |
| `inset` | `boolean` | - | Inset from screen edges |

**Slots**: `default` (trigger), `content`, `header`, `title`, `description`, `body`, `footer`, `actions`, `close`
**Events**: `@update:open`, `@close:prevent`, `@after:enter`, `@after:leave`

### UDrawer
Mobile-friendly swipeable panel (powered by Vaul).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Header title |
| `description` | `string` | - | Header description |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Slide direction |
| `handle` | `boolean` | `true` | Draggable handle |
| `handleOnly` | `boolean` | `false` | Only draggable by handle |
| `overlay` | `boolean` | `true` | Backdrop |
| `inset` | `boolean` | `false` | Inset from edges |
| `nested` | `boolean` | `false` | Nested drawer |
| `modal` | `boolean` | `true` | Block outside interaction |
| `dismissible` | `boolean` | `true` | Close on click outside/Escape |
| `fixed` | `boolean` | `false` | Don't move with keyboard |
| `shouldScaleBackground` | `boolean` | - | Scale background (needs `data-vaul-drawer-wrapper`) |
| `snapPoints` | `(string \| number)[]` | - | Snap positions (% or px) |
| `activeSnapPoint` | `string \| number` | - | Current snap point |
| `closeThreshold` | `number` | - | Swipe distance ratio to close (0-1) |
| `scrollLockTimeout` | `number` | - | Non-draggable duration after scroll |
| `open` / `defaultOpen` | `boolean` | - | Open state |

**Slots**: `default` (trigger), `content`, `header`, `title`, `description`, `body`, `footer`
**Events**: `@update:open`, `@close`, `@drag(percentageDragged)`, `@close:prevent`, `@release(open)`, `@update:activeSnapPoint`, `@animationEnd(open)`

### UPopover
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'click' \| 'hover'` | `'click'` | Trigger mode |
| `content` | `PopoverContentProps` | - | Positioning (align, side) |
| `arrow` | `boolean \| PopoverArrowProps` | `false` | Show arrow |
| `portal` | `boolean` | `true` | Portal rendering |
| `reference` | `ReferenceElement` | - | Custom anchor element |
| `dismissible` | `boolean` | `true` | Close on outside click/Escape |
| `open` / `defaultOpen` | `boolean` | - | Open state |
| `modal` | `boolean` | `false` | Block outside interaction |
| `openDelay` / `closeDelay` | `number` | `0` | Hover delays (ms) |

**Slots**: `default` (trigger), `content({ close })` (close only in click mode), `anchor` (click mode only)
**Events**: `@update:open`, `@close:prevent`

**Note**: Hover mode uses Reka UI's HoverCard internally.

### UTooltip
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | Tooltip text |
| `kbds` | `string[] \| KbdProps[]` | - | Keyboard shortcuts |
| `content` | `TooltipContentProps` | - | Positioning |
| `arrow` | `boolean \| TooltipArrowProps` | - | Show arrow |
| `portal` | `boolean` | `true` | Portal rendering |
| `reference` | `ReferenceElement` | - | Positioning reference |
| `delayDuration` | `number` | - | Show delay (0 = instant) |
| `disableHoverableContent` | `boolean` | - | Prevent hovering tooltip content |
| `disableClosingTrigger` | `boolean` | - | Clicking trigger won't close |
| `disabled` | `boolean` | - | Disable tooltip |
| `ignoreNonKeyboardFocus` | `boolean` | - | Only open on keyboard focus |
| `open` / `defaultOpen` | `boolean` | - | Open state |

**Slots**: `default` (trigger), `content`
**Events**: `@update:open`

**Requires**: App wrapper (provides TooltipProvider). Global config via App's `tooltip` prop.

### UDropdownMenu (replaces v2's UDropdown)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[] \| MenuItem[][]` | - | Items (nested arrays = groups with separators) |
| `size` | Size | `'md'` | Size |
| `content` | `object` | - | Positioning (align, side) |
| `arrow` | `boolean \| object` | - | Show arrow |
| `portal` | `boolean` | `true` | Portal rendering |
| `modal` | `boolean` | `true` | Block outside interaction |
| `disabled` | `boolean` | - | Disable |
| `open` / `defaultOpen` | `boolean` | - | Open state |
| `filter` | `boolean \| InputProps` | `false` | Enable filter input |
| `filterFields` | `string[]` | `[labelKey]` | Filter search fields |
| `ignoreFilter` | `boolean` | - | Disable internal filtering |
| `searchTerm` | `string` | - | v-model:search-term |
| `labelKey` | `string` | `'label'` | Label property |
| `descriptionKey` | `string` | `'description'` | Description property |
| `checkedIcon` | `string` | - | Checked icon |
| `loadingIcon` | `string` | - | Loading icon |
| `externalIcon` | `any` | `true` | External link icon (false to hide) |

**MenuItem Interface**:
```ts
{
  label?: string, icon?: string, avatar?: AvatarProps, description?: string,
  type?: 'link' | 'label' | 'separator' | 'checkbox',
  color?: Color, checked?: boolean, disabled?: boolean,
  kbds?: string[] | KbdProps[], children?: MenuItem[] | MenuItem[][],
  onSelect?: (e: Event) => void,
  onUpdateChecked?: (checked: boolean) => void,
  to?: string, target?: string, slot?: string, class?: any, ui?: object,
  filter?: boolean | InputProps, filterFields?: string[], ignoreFilter?: boolean
}
```

**Slots**: `default` (trigger), `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `content-top`, `content-bottom`, `empty`, `#{item.slot}`, `#{item.slot}-leading/label/trailing`
**Events**: `@update:open`, `@update:searchTerm`

**Keyboard shortcut extraction**: `extractShortcuts()` utility converts menu `kbds` to `defineShortcuts`-compatible format, recursively through nested menus.

**Content width matching**: Use `w-(--reka-dropdown-menu-trigger-width)` class on content.

### UContextMenu
Same API as UDropdownMenu but triggered by right-click. Additional prop: `pressOpenDelay` (number).

**Events**: `@update:open`

---

## Composables

### useOverlay()
Programmatically create/manage overlays. Created using `createSharedComposable` (shared state across app).

```ts
const overlay = useOverlay()

// Create an overlay instance
const panel = overlay.create(LazyPanelBatch, {
  autoOpen: false,          // Open immediately (default: false)
  props: {},                // Initial props
  destroyOnClose: false     // Remove from memory when closed (default: false)
})

// Open it (returns Promise that resolves when component emits 'close')
const result = await panel.open({ someProps: 'value' })

// Other instance methods
panel.close(returnValue?)   // Close and resolve Promise
panel.patch({ newProp: 'value' })  // Update props dynamically
```

**Global methods**:
```ts
overlay.open(id, props?)     // Open by ID
overlay.close(id, value?)    // Close by ID
overlay.closeAll()           // Close all overlays
overlay.patch(id, props)     // Update by ID
overlay.unmount(id)          // Remove from DOM
overlay.isOpen(id)           // Check if open (returns boolean)
overlay.overlays              // List all created overlays
```

**Confirm dialog pattern**:
```ts
export const useConfirmDialog = () => {
  const overlay = useOverlay()
  return (options) => {
    const modal = overlay.create(ConfirmDialog, {
      destroyOnClose: true,
      props: options
    })
    return modal.open()
  }
}
```

**Caveat**: Programmatic overlays only access injections from the `UApp` tree, NOT from page components. Pass data via props.

### useToast()
```ts
const toast = useToast()

// Add toast (max 5 concurrent, oldest removed automatically)
toast.add({
  id: 'custom-id',           // Auto-generated if omitted
  title: 'Saved',
  description: 'Optional details',
  icon: 'i-lucide-check-circle',
  avatar: { src: '...' },
  color: 'success',           // primary | secondary | success | info | warning | error | neutral
  orientation: 'vertical',    // 'vertical' | 'horizontal' (default: vertical)
  duration: 5000,              // Auto-dismiss ms
  actions: [{ label: 'Undo', variant: 'outline', onClick: () => undoAction() }],
  close: true,                 // Show close button
  closeIcon: 'i-lucide-x',
  progress: true,              // Show countdown bar
  click: () => {},             // Click handler
  change: (open) => {},        // Open/close state handler
})

// Other methods
toast.update(id, { title: 'Updated' })
toast.remove(id)
toast.clear()
toast.toasts  // Reactive Ref<Toast[]>
```

**Deduplication (v4.5+)**: Using matching `id` values pulses existing toast instead of creating new.

**Toaster Config** (on UApp):
```vue
<UApp :toaster="{ position: 'bottom-right', duration: 5000, max: 5, expand: false }">
```

### defineShortcuts()
Declarative keyboard shortcuts (auto-imported).
```ts
defineShortcuts({
  'meta_k': () => openCommandPalette(),     // Cmd/Ctrl+K
  '?': () => toggleHelp(),                   // Single key
  'g-d': () => navigateTo('/dashboard'),     // Sequence: g then d
  escape: { handler: () => close(), usingInput: true },  // Works in inputs
})
```

**Key syntax**:
- **Single keys**: `'a'`, `'b'`, `'1'`, `'?'`
- **Combinations**: underscore separator -- `'meta_k'`, `'ctrl_shift_f'`
- **Sequences**: hyphen separator -- `'g-d'`
- **Modifiers**: `meta` (Cmd on macOS, Ctrl elsewhere), `ctrl` (always Ctrl), `shift`
- **Special keys**: `escape`, `enter`, `arrowleft`, `arrowright`, `arrowup`, `arrowdown`
- All keys must be lowercase

**`usingInput` option**: `false` (default -- skip inputs), `true` (fire in any input), `'inputName'` (specific input by name).

**Options**:
```ts
defineShortcuts(config, {
  chainDelay: number,         // ms between chained keys
  usingPhysicalKeys: boolean  // false (default): e.key | true: e.code (layout-agnostic)
})
```

**extractShortcuts**: Utility to auto-extract shortcuts from menu item `kbds` for `defineShortcuts`.

---

## Navigation Components

### UTabs
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | - | Tab items |
| `modelValue` | `string \| number` | `'0'` | Active tab (v-model) |
| `defaultValue` | `string \| number` | `'0'` | Initial active tab |
| `color` | Color | `'primary'` | Color |
| `variant` | `'pill' \| 'link'` | `'pill'` | Style |
| `size` | Size | `'md'` | Size |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `content` | `boolean` | `true` | Render content panels |
| `unmountOnHide` | `boolean` | `true` | Unmount inactive panels |
| `activationMode` | `'automatic' \| 'manual'` | - | Tab activation mode |
| `valueKey` | `string` | `'value'` | Item value property |
| `labelKey` | `string` | `'label'` | Item label property |

**TabItem**: `{ label, icon?, avatar?, badge?: string | number | BadgeProps, content?, value?, disabled?, slot?, class?, ui? }`

**Slots**: `leading`, `default`, `trailing`, `content({ item })`, `list-leading`, `list-trailing`, `#{item.slot}({ item })`
**Events**: `update:modelValue`
**Expose**: `triggersRef: Ref<ComponentPublicInstance[]>`

### UBreadcrumb
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | - | Breadcrumb items |
| `separatorIcon` | `string` | `'i-lucide-chevron-right'` | Separator icon |
| `labelKey` | `string` | `'label'` | Label property |

**BreadcrumbItem**: `{ label?, icon?, avatar?, to?, target?, slot?, class?, ui? }`

A `span` is rendered instead of a link when `to` is not defined.

**Slots**: `item`, `item-leading`, `item-label`, `item-trailing`, `separator`, `#{item.slot}`, `#{item.slot}-leading/label/trailing`

### UNavigationMenu
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItem[] \| NavItem[][]` | - | Nested arrays = groups |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `modelValue` | `any` | - | Active item (v-model) |
| `color` | Color | `'primary'` | Color |
| `variant` | `'pill' \| 'link'` | `'pill'` | Style |
| `highlight` | `boolean` | - | Active item border |
| `highlightColor` | Color | - | Border color |
| `collapsed` | `boolean` | - | Icon-only mode (vertical only) |
| `trailingIcon` | `string` | `'i-lucide-chevron-down'` | Expandable icon |
| `externalIcon` | `any` | `true` | External link icon |
| `type` | `'single' \| 'multiple'` | `'multiple'` | Vertical accordion type |
| `collapsible` | `boolean` | `true` | Re-click to close (type=single) |
| `contentOrientation` | `'horizontal' \| 'vertical'` | - | Horizontal content layout |
| `arrow` | `boolean` | - | Animated arrow |
| `unmountOnHide` | `boolean` | `true` | Unmount hidden content |
| `tooltip` | `boolean \| TooltipProps` | - | Tooltips (collapsed mode) |
| `popover` | `boolean \| PopoverProps` | - | Popovers (collapsed mode) |
| `delayDuration` | `number` | `0` | Tooltip delay |
| `disabled` | `boolean` | - | Disable |

**NavItem**: `{ label, icon?, avatar?, badge?: string | number | BadgeProps, chip?, tooltip?, popover?, trailingIcon?, type?: 'label' | 'trigger' | 'link', defaultOpen?, open?, value?, disabled?, slot?, onSelect?, children?: NavChild[], to?, target?, class?, ui? }`

**NavChild**: `{ label, description?, icon?, onSelect?, to?, target?, class? }`

**Slots**: `item`, `item-leading`, `item-label`, `item-trailing`, `item-content`, `list-leading`, `list-trailing`, `#{item.slot}`
**Events**: `update:modelValue`

### UStepper
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `StepperItem[]` | - | Steps |
| `modelValue` | `string \| number` | - | Active step (v-model) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout |
| `color` | Color | `'primary'` | Color |
| `size` | Size | `'md'` | Size |
| `linear` | `boolean` | `true` | Require sequential |
| `disabled` | `boolean` | - | Disable |

**StepperItem**: `{ title?, description?, content?, icon?, value?, disabled?, slot?, class?, ui? }`

**Slots**: `indicator`, `wrapper`, `title`, `description`, `content({ item })`, `#{item.slot}({ item })`
**Events**: `next(value)`, `prev(value)`, `update:modelValue`
**Expose**: `next()`, `prev()`, `hasNext: Ref<boolean>`, `hasPrev: Ref<boolean>`

### UCommandPalette
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `groups` | `CommandPaletteGroup[]` | - | Item groups |
| `placeholder` | `string` | - | Search placeholder |
| `searchTerm` | `string` | - | v-model:search-term |
| `modelValue` | `any` | - | v-model (selected) |
| `multiple` | `boolean` | - | Multi-select |
| `loading` | `boolean` | - | Loading state |
| `autofocus` | `boolean` | `true` | Auto-focus input |
| `close` | `boolean \| ButtonProps` | - | Close button |
| `back` | `boolean \| ButtonProps` | `true` | Back button (submenus) |
| `input` | `boolean \| InputProps` | `true` | Search input |
| `icon` | `string` | `'i-lucide-search'` | Search icon |
| `selectedIcon` | `string` | `'i-lucide-check'` | Selected icon |
| `trailingIcon` / `childrenIcon` | `string` | `'i-lucide-chevron-right'` | Children icon |
| `closeIcon` | `string` | `'i-lucide-x'` | Close icon |
| `backIcon` | `string` | `'i-lucide-arrow-left'` | Back icon |
| `loadingIcon` | `string` | `'i-lucide-loader-circle'` | Loading icon |
| `fuse` | `object` | `{ ignoreLocation: true, threshold: 0.1, keys: ['label', 'suffix'], resultLimit: 12, matchAllWhenSearchEmpty: true }` | Fuse.js config |
| `size` | Size | `'md'` | Size |
| `valueKey` | `string` | - | Bind to property |
| `labelKey` | `string` | `'label'` | Label property |
| `descriptionKey` | `string` | `'description'` | Description property |
| `preserveGroupOrder` | `boolean` | `false` | Keep group order when filtering |
| `virtualize` | `boolean \| config` | - | Large lists (flattens groups) |
| `by` | `string \| Function` | - | Object comparison |
| `highlightOnHover` | `boolean` | `true` | Hover highlights |
| `selectionBehavior` | `'replace' \| 'toggle'` | - | Selection mode |

**Group**: `{ id: string, label?, items, ignoreFilter?: boolean, postFilter?: (searchTerm, items) => T[], highlightedIcon?, slot? }`
**Item**: `{ prefix?, label, suffix?, icon?, avatar?, chip?, kbds?, children?, onSelect?, placeholder?, active?, loading?, disabled?, slot?, class?, ui?, to?, target? }`

**Slots**: `footer`, `empty`, `back`, `close`, `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `#{group.slot}`, `#{group.slot}-leading/label/trailing`
**Events**: `update:modelValue`, `update:searchTerm`, `update:open`, `highlight({ ref, value })`, `entryFocus`, `leave`

```vue
<UModal v-model:open="open" :ui="{ content: 'p-0' }">
  <template #content>
    <UCommandPalette :groups="groups" @update:open="open = $event" close />
  </template>
</UModal>
```

---

## Data Display Components

### UButton
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Button text |
| `icon` | `string` | - | Icon |
| `leadingIcon` / `trailingIcon` | `string` | - | Positioned icons |
| `leading` / `trailing` | `boolean` | - | Show icon position |
| `avatar` | `AvatarProps` | - | Avatar display |
| `color` | Color | `'primary'` | Color |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle' \| 'ghost' \| 'link'` | `'solid'` | Style |
| `size` | Size | `'md'` | Size |
| `loading` | `boolean` | `false` | Loading spinner |
| `loadingAuto` | `boolean` | - | Auto-loading based on @click Promise state |
| `loadingIcon` | `string` | `'i-lucide-loader-circle'` | Loading icon |
| `disabled` | `boolean` | `false` | Disabled |
| `block` | `boolean` | `false` | Full width |
| `square` | `boolean` | `false` | Equal padding |
| `type` | `'button' \| 'submit' \| 'reset'` | - | Button type |
| `to` / `href` | `string \| RouteLocation` | - | Navigation target |
| `target` | `string` | - | Link target |
| `active` | `boolean` | - | Force active state |
| `activeClass` / `inactiveClass` | `string` | - | Active/inactive CSS classes |
| `activeColor` / `activeVariant` | `Color / Variant` | - | Active state styling |
| `replace` | `boolean` | - | Use router.replace |
| `external` | `boolean` | - | Force external link |
| `prefetch` | `boolean` | - | Enable prefetching |
| `viewTransition` | `boolean` | - | View transition support |
| `autofocus` | `boolean` | - | Focus on mount |

**Slots**: `leading`, `default`, `trailing`
**Events**: `@click` (supports void or Promise<void>)

**Size table**:
| Size | Padding | Icon | Avatar |
|------|---------|------|--------|
| xs | px-2 py-1 | size-4 | 3xs |
| sm | px-2.5 py-1.5 | size-4 | 3xs |
| md | px-2.5 py-1.5 | size-5 | 2xs |
| lg | px-3 py-2 | size-5 | 2xs |
| xl | px-3 py-2 | size-6 | xs |

### UBadge
| Prop | Type | Default |
|------|------|---------|
| `label` | `string \| number` | - |
| `color` | Color | `'primary'` |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'solid'` |
| `size` | Size | `'md'` |
| `icon` | `string` | - |
| `avatar` | `AvatarProps` | - |
| `square` | `boolean` | - |
| `leading` / `leadingIcon` | - | - |
| `trailing` / `trailingIcon` | - | - |

**Slots**: `leading`, `default`, `trailing`

### UCard
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'outline'` | Style |

**Slots**: `header`, `default` (body), `footer`

### UAlert
| Prop | Type | Default |
|------|------|---------|
| `title` | `string` | - |
| `description` | `string` | - |
| `icon` | `string` | - |
| `avatar` | `AvatarProps` | - |
| `color` | Color | `'primary'` |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'solid'` |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `actions` | `ButtonProps[]` | - |
| `close` | `boolean \| ButtonProps` | - |
| `closeIcon` | `string` | `'i-lucide-x'` |

**Slots**: `leading`, `title`, `description`, `actions`, `close`
**Events**: `@update:open(boolean)`

### UAvatar
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | Image URL |
| `alt` | `string` | - | Alt text (initials extracted for fallback) |
| `icon` | `string` | - | Fallback icon |
| `text` | `string` | - | Fallback text |
| `size` | `'3xs' \| '2xs' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'md'` | Size |
| `chip` | `boolean \| ChipProps` | - | Status indicator |
| `loading` | `'lazy' \| 'eager'` | - | Image loading |

**Fallback order**: Image > Icon > Text > Initials from alt

Uses `<NuxtImg>` when `@nuxt/image` is installed. Force standard `img` with `:as="{ img: 'img' }"`.

### UAvatarGroup
| Prop | Type | Default |
|------|------|---------|
| `size` | AvatarSize | `'md'` |
| `max` | `string \| number` | - |

**Slots**: `default`

### UChip
Small badge overlaid on another component.

| Prop | Type | Default |
|------|------|---------|
| `text` | `string \| number` | - |
| `color` | Color | `'primary'` |
| `size` | `'3xs' - '3xl'` | `'md'` |
| `position` | `'top-right' \| 'bottom-right' \| 'top-left' \| 'bottom-left'` | `'top-right'` |
| `inset` | `boolean` | `false` |
| `standalone` | `boolean` | `false` |
| `show` | `boolean` | `true` |

**Slots**: `default`, `content`
**Events**: `@update:show(boolean)`

### UAccordion
| Prop | Type | Default |
|------|------|---------|
| `items` | `AccordionItem[]` | - |
| `type` | `'single' \| 'multiple'` | `'single'` |
| `collapsible` | `boolean` | `true` |
| `modelValue` | `string \| string[]` | - |
| `defaultValue` | `string \| string[]` | - |
| `trailingIcon` | `string` | `'i-lucide-chevron-down'` |
| `unmountOnHide` | `boolean` | `true` |
| `disabled` | `boolean` | `false` |
| `valueKey` | `string` | `'value'` |
| `labelKey` | `string` | `'label'` |

**AccordionItem**: `{ label, icon?, trailingIcon?, content?, value?, disabled?, slot?, class?, ui? }`

**Slots**: `default`, `leading`, `trailing`, `content({ item })`, `body({ item })`, `#{item.slot}({ item })`, `#{item.slot}-body({ item })`
**Events**: `update:modelValue`

### UCalendar
Uses `@internationalized/date`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `CalendarDate \| CalendarDateTime \| ZonedDateTime \| DateRange \| DateValue[]` | `null` | v-model |
| `range` | `boolean` | `false` | Date range mode |
| `multiple` | `boolean` | `false` | Multi-select mode |
| `color` | Color | `'primary'` | Color |
| `variant` | `'solid' \| 'outline' \| 'soft' \| 'subtle'` | `'solid'` | Style |
| `size` | Size | `'md'` | Size |
| `monthControls` | `boolean` | `true` | Month navigation |
| `yearControls` | `boolean` | `true` | Year navigation |
| `weekNumbers` | `boolean` | `false` | Show week numbers |
| `fixedWeeks` | `boolean` | `true` | Always 6 weeks |
| `numberOfMonths` | `number` | `1` | Months displayed |
| `minValue` / `maxValue` | `DateValue` | - | Date constraints |
| `isDateDisabled` | `Matcher` | - | Disable specific dates |
| `isDateUnavailable` | `Matcher` | - | Mark unavailable |
| `isDateHighlightable` | `Matcher` | - | Highlight dates |
| `allowNonContiguousRanges` | `boolean` | `false` | Allow gaps in ranges |
| `pagedNavigation` | `boolean` | `false` | Navigate by months count |
| `preventDeselect` | `boolean` | `false` | Prevent deselection |
| `maximumDays` | `number` | - | Max days in range |
| `weekStartsOn` | `WeekStartsOn` | - | Week start day |
| `weekdayFormat` | `WeekDayFormat` | - | Weekday label format |
| `fixedDate` | `'start' \| 'end'` | - | Lock range endpoint |
| `disabled` / `readonly` | `boolean` | - | States |
| `initialFocus` | `boolean` | `false` | Focus on mount |

**Slots**: `heading`, `day({ day })`, `week-day`
**Events**: `update:modelValue`, `update:placeholder`, `update:validModelValue`, `update:startValue`

### UCarousel
Powered by Embla Carousel.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Slide data |
| `arrows` | `boolean` | `false` | Show nav arrows |
| `dots` | `boolean` | `false` | Show indicators |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction |
| `loop` | `boolean` | `false` | Infinite loop |
| `autoplay` | `boolean \| AutoplayOptions` | `false` | Auto-advance |
| `autoScroll` | `boolean \| AutoScrollOptions` | `false` | Continuous scroll |
| `autoHeight` | `boolean \| AutoHeightOptions` | `false` | Dynamic height |
| `fade` | `boolean \| FadeOptions` | `false` | Fade transitions |
| `wheelGestures` | `boolean \| WheelGesturesOptions` | `false` | Mouse wheel nav |
| `classNames` | `boolean \| ClassNamesOptions` | `false` | Dynamic classes |
| `align` | `AlignmentOptionType` | `'center'` | Slide alignment |
| `containScroll` | `ScrollContainOptionType` | `'trimSnaps'` | Scroll containment |
| `slidesToScroll` | `number` | `1` | Slides per step |
| `dragFree` | `boolean` | `false` | Free-form dragging |
| `dragThreshold` | `number` | `10` | Min drag distance |
| `duration` | `number` | `25` | Animation duration |
| `startIndex` | `number` | `0` | Initial slide |
| `prev` / `next` | `ButtonProps` | - | Button config |
| `prevIcon` / `nextIcon` | `string` | - | Arrow icons |
| `breakpoints` | `object` | `{}` | Responsive config |

**Slots**: `default({ item })`
**Events**: `@select(selectedIndex)`
**Expose**: `emblaRef`, `emblaApi`

### UProgress
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number \| null` | `null` | Progress value (null = indeterminate) |
| `max` | `number \| any[]` | - | Maximum (array for steps) |
| `status` | `boolean` | `false` | Show value display |
| `inverted` | `boolean` | `false` | Invert display |
| `size` | `'2xs' - '2xl'` | `'md'` | Bar thickness |
| `color` | Color | `'primary'` | Color |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction |
| `animation` | `'carousel' \| 'carousel-inverse' \| 'swing' \| 'elastic'` | `'carousel'` | Indeterminate animation |

**Slots**: `status`
**Events**: `update:modelValue`, `update:max`

### USkeleton
Loading placeholder. Props: `as`, `ui: { base }`.
```vue
<USkeleton class="h-8 w-48 rounded-md" />
```

### USeparator
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Center label |
| `icon` | `string` | - | Center icon |
| `avatar` | `AvatarProps` | - | Center avatar |
| `color` | Color | `'neutral'` | Color |
| `size` | Size | `'xs'` | Thickness |
| `type` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | Line style |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction |
| `decorative` | `boolean` | - | Remove from accessibility tree |

**Slots**: `default`

### UKbd
| Prop | Type | Default |
|------|------|---------|
| `value` | `string` | - |
| `color` | Color | `'neutral'` |
| `variant` | `'outline' \| 'soft' \| 'subtle' \| 'solid'` | `'outline'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |

Special key: `meta` displays as Cmd on macOS, Ctrl elsewhere.

### UCollapsible
| Prop | Type | Default |
|------|------|---------|
| `open` | `boolean` | - |
| `defaultOpen` | `boolean` | - |
| `disabled` | `boolean` | - |
| `unmountOnHide` | `boolean` | `true` |

**Slots**: `default` (trigger), `content`
**Events**: `update:open(boolean)`

### UTree
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeItem[]` | - | Hierarchical data |
| `modelValue` | `TreeItem \| TreeItem[]` | - | Selected (v-model) |
| `expanded` | `string[]` | - | Expanded keys (v-model:expanded) |
| `defaultExpanded` | `string[]` | - | Initial expanded |
| `getKey` | `(item) => string` | - | Unique key function |
| `labelKey` | `string` | `'label'` | Label property (also default key) |
| `color` | Color | `'primary'` | Ring color on focus |
| `size` | Size | `'md'` | Size |
| `multiple` | `boolean` | `false` | Multi-selection |
| `nested` | `boolean` | `true` | Nested vs flattened DOM |
| `virtualize` | `boolean \| config` | `false` | Virtual scrolling |
| `selectionBehavior` | `'replace' \| 'toggle'` | `'replace'` | Selection mode |
| `propagateSelect` | `boolean` | `false` | Select descendants |
| `bubbleSelect` | `boolean` | `false` | Update parent on child select |
| `trailingIcon` | `string` | `'i-lucide-chevron-down'` | Expandable icon |
| `expandedIcon` | `string` | `'i-lucide-folder-open'` | Expanded icon |
| `collapsedIcon` | `string` | `'i-lucide-folder'` | Collapsed icon |
| `disabled` | `boolean` | `false` | Disable |

**TreeItem**: `{ label?, icon?, trailingIcon?, defaultExpanded?, disabled?, slot?, children?: TreeItem[], onToggle?, onSelect?, class?, ui? }`

**Slots**: `item-wrapper`, `item`, `item-leading({ selected, indeterminate, handleSelect })`, `item-label`, `item-trailing`, `#{item.slot}`, `#{item.slot}-wrapper/leading/label/trailing`
**Events**: `update:modelValue`, `update:expanded`, `@select(TreeItemSelectEvent)`, `@toggle(TreeItemToggleEvent)`

---

## Layout Components

### UApp
**Required** root wrapper. Provides Toaster, TooltipProvider, and OverlayProvider.
```vue
<UApp :toaster="{ position: 'bottom-right', duration: 5000, max: 5, expand: false }" :tooltip="{ delayDuration: 0, content: {} }" locale="en">
  <NuxtPage />
</UApp>
```

### UContainer
Centers and constrains content width. `<UContainer>...</UContainer>`

### ULink
Enhanced NuxtLink wrapper.

| Prop | Type | Default |
|------|------|---------|
| `to` / `href` | `string \| object` | - |
| `active` | `boolean` | - |
| `exact` | `boolean` | - |
| `exactQuery` | `boolean \| 'partial'` | - |
| `exactHash` | `boolean` | - |
| `activeClass` / `inactiveClass` / `exactActiveClass` | `string` | - |
| `disabled` | `boolean` | - |
| `external` | `boolean` | - |
| `target` | `string` | - |
| `rel` | `string` | `'noopener noreferrer'` (external) |
| `prefetch` | `boolean` | - |
| `replace` | `boolean` | - |
| `viewTransition` | `boolean` | - |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` |

Renders `<a>` when `to` is provided, `<button>` otherwise.

### UIcon
```vue
<UIcon name="i-lucide-home" class="size-5" />
```

### UFieldGroup
Groups multiple form elements together.

| Prop | Type | Default |
|------|------|---------|
| `size` | Size | `'md'` |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |

Compatible with: Button, Input, InputMenu, Select, SelectMenu, Tooltip, DropdownMenu, Badge.

### UToast
Individual toast notification component (used internally by Toaster).

| Prop | Type | Default |
|------|------|---------|
| `title` | `StringOrVNode` | - |
| `description` | `StringOrVNode` | - |
| `icon` | `string` | - |
| `avatar` | `AvatarProps` | - |
| `color` | Color | `'primary'` |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `close` | `boolean \| ButtonProps` | `true` |
| `closeIcon` | `string` | `'i-lucide-x'` |
| `actions` | `ButtonProps[]` | - |
| `progress` | `boolean \| ProgressProps` | `true` |
| `type` | `'foreground' \| 'background'` | - |
| `duration` | `number` | - |

**Slots**: `leading`, `title`, `description`, `actions`, `close`
**Events**: `pause`, `resume`, `escapeKeyDown`, `swipeStart/Move/Cancel/End`, `update:open`
**Expose**: `height: Ref<number>`

---

## Complete Component Index

**Layout (7)**: UApp, UContainer, UError, UFooter, UHeader, UMain, UTheme
**Element (16)**: UAlert, UAvatar, UAvatarGroup, UBadge, UBanner, UButton, UCalendar, UCard, UChip, UCollapsible, UFieldGroup, UIcon, UKbd, UProgress, USeparator, USkeleton
**Form (19)**: UCheckbox, UCheckboxGroup, UColorPicker, UFileUpload, UForm, UFormField, UInput, UInputDate, UInputMenu, UInputNumber, UInputTags, UInputTime, UPinInput, URadioGroup, USelect, USelectMenu, USlider, USwitch, UTextarea
**Data (9)**: UAccordion, UCarousel, UEmpty, UMarquee, UScrollArea, UTable, UTimeline, UTree, UUser
**Navigation (8)**: UBreadcrumb, UCommandPalette, UFooterColumns, ULink, UNavigationMenu, UPagination, UStepper, UTabs
**Overlay (8)**: UContextMenu, UDrawer, UDropdownMenu, UModal, UPopover, USlideover, UToast, UTooltip

**Total: 67 core components** (+ 38 Pro components for dashboard/page/content)

---

## Key Differences from v2/v3

| v2 | v3 | v4 | Notes |
|----|-----|-----|-------|
| `UDropdown` | `UDropdownMenu` | `UDropdownMenu` | Different item structure |
| `color="gray"` | `color="neutral"` | `color="neutral"` | Renamed color |
| `UFormGroup` | `UFormField` | `UFormField` | Renamed |
| - | `UButtonGroup` | `UFieldGroup` | Renamed in v4 |
| - | `UDivider` | `USeparator` | Renamed in v4 |
| UTable (simple key/label) | UTable (TanStack accessorKey/cell/header) | Same | Complete rewrite in v3 |
| `rows` prop | `data` prop | `data` prop | Table data prop renamed |
| `@select(row)` | `@select(event, row)` | Same | Event added as first arg |
| `ui` prop (nested objects) | `ui` prop (slot-based classes) | Same | Simplified |
| Headless UI | Reka UI | Reka UI | Underlying primitives |
| Manual icon install | Iconify via @nuxt/icon | Same | Auto-configured |
| `tailwind.config.ts` | `@theme` in CSS | Same | Tailwind v4 |

### v4 New Features (cumulative through v4.5.1)
- **v4.1+**: `experimental.componentDetection` for tree-shaking
- **v4.2+**: `scrollable` on UModal, `theme.prefix` for Tailwind CSS prefix
- **v4.5+**: Toast deduplication via matching `id` values
- **`virtualize` prop**: Available on UTable, USelectMenu, UCommandPalette, UTree, UInputMenu for virtual scrolling
- **`inset` on USlideover/UDrawer**: Inset panel positioning
- **UFormField `orientation`**: Control label/input layout (horizontal/vertical)
- **New components**: UInputDate, UInputTime, UInputTags, UInputMenu, UColorPicker, UFileUpload, UTree, UCalendar, UScrollArea, UEditor
- **New composables**: useOverlay (with `closeAll`, `patch`, `unmount`, `isOpen`, `create` with `destroyOnClose`)
- **`loadingAuto` on UButton**: Auto-loading based on @click Promise state
- **DropdownMenu filtering**: `filter` prop with search input
- **Calendar variants**: solid, outline, soft, subtle
- **5 color formats**: ColorPicker supports hex, rgb, hsl, cmyk, lab

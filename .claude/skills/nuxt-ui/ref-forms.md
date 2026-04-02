# Nuxt UI v4 — Form Components

## UForm

Top-level form wrapper. Handles validation and error distribution to child UFormField components.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string \| number` | - | Unique identifier |
| `schema` | `SchemaObject` | - | Yup/Zod/Valibot/Joi/Superstruct schema (Standard Schema) |
| `state` | `Partial<InferInput<S>>` | - | Reactive form state |
| `validate` | `(state) => FormError[] \| Promise<FormError[]>` | - | Custom validation function |
| `validateOn` | `FormInputEvents[]` | - | `'input'`, `'change'`, `'blur'` |
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

**FormError Interface**: `{ message: string; name: string; id?: string; }`

**Validation Libraries**: Valibot, Zod, Regle, Yup, Joi, Superstruct — all via Standard Schema.

**Yup Pattern (GDC project)**:
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

---

## UFormField (replaces v2's UFormGroup)

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

---

## UInput

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

---

## UTextarea

All UInput props plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `3` | Number of rows |
| `autoresize` | `boolean` | - | Dynamic height adjustment |
| `maxrows` | `number` | `0` | Max rows during autoresize (0 = unlimited) |
| `autoresizeDelay` | `number` | `0` | Delay before resizing |

**Expose**: `textareaRef: Ref<HTMLTextAreaElement | null>`

---

## USelect

Native-like dropdown. **v-model binds to the VALUE property**.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Options (strings, numbers, or objects) |
| `modelValue` | `any` | - | v-model binding |
| `multiple` | `boolean` | `false` | Multi-select |
| `valueKey` | `string` | `'value'` | Object property for value |
| `labelKey` | `string` | `'label'` | Object property for display |
| `descriptionKey` | `string` | `'description'` | Description field |
| `placeholder` | `string` | - | Empty state text |
| `color` / `variant` / `size` | standard | standard | Styling |
| `icon` / `leadingIcon` / `trailingIcon` | `string` | - | Icons |
| `selectedIcon` | `string` | `'i-lucide-check'` | Selected item checkmark |
| `avatar` | `AvatarProps` | - | Leading avatar |
| `loading` | `boolean` | - | Loading state |
| `highlight` | `boolean` | - | Focus ring styling |
| `open` / `defaultOpen` | `boolean` | - | Menu visibility |
| `content` | `object` | - | Menu positioning (align, side) |
| `arrow` | `boolean` | - | Show arrow |
| `portal` | `boolean` | `true` | Render in portal |
| `clear` | `boolean` | - | Clear button |
| `disabled` / `required` | `boolean` | - | States |

**Slots**: `leading`, `default`, `trailing`, `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `content-top`, `content-bottom`
**Events**: `update:modelValue`, `update:open`, `change`, `blur`, `focus`
**Expose**: `triggerRef`, `viewportRef`

**Item Object**: `{ label?, value?, type?: 'label' | 'separator' | 'item', icon?, avatar?, chip?, disabled?, class?, ui? }`

```vue
<USelect v-model="status" :items="['active', 'completed', 'cancelled']" />
<USelect v-model="unitId" :items="units" value-key="_id" label-key="name" />
```

---

## USelectMenu

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
| `by` | `string \| Function` | - | Compare objects by field or function |
| `highlightOnHover` | `boolean` | - | Highlight items on hover |
| `content` | `object` | - | Menu positioning |
| `open` / `defaultOpen` | `boolean` | - | Menu visibility |
| `resetSearchTermOnBlur` | `boolean` | `true` | Clear search on blur |
| `resetSearchTermOnSelect` | `boolean` | `true` | Clear search after selection |
| `resetModelValueOnClear` | `boolean` | `true` | Reset to null/[] on clear |
| `loading` / `disabled` / `required` | `boolean` | - | States |

**Slots**: `leading`, `default`, `trailing`, `empty`, `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `content-top`, `content-bottom`, `create-item-label`
**Events**: `update:modelValue`, `update:open`, `update:searchTerm`, `change`, `blur`, `focus`, `create`, `clear`, `highlight`

**When to use USelect vs USelectMenu:**
- **USelect**: Small static list (<20 items), no search needed, simple value binding
- **USelectMenu**: Need search/filter, create items, object binding, large lists, multi-select

---

## UInputMenu

Autocomplete input with real-time suggestions. Built on Reka UI Combobox. Similar to SelectMenu but rendered as an input field.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array` | - | Options |
| `autocomplete` | `boolean` | - | Free-form text input with suggestions (modelValue becomes string) |
| `multiple` | `boolean` | - | Multi-select (displays as tags) |
| `valueKey` | `string` | - | Bind to object property |
| `labelKey` | `string` | `'label'` | Display property |
| `filterFields` | `string[]` | `[labelKey]` | Fields to search |
| `ignoreFilter` | `boolean` | - | Disable internal filtering |
| `createItem` | `boolean \| 'always' \| object` | - | Allow custom values |
| `searchTerm` | `string` | - | v-model:search-term |
| `placeholder` | `string` | - | Placeholder |
| `selectedIcon` | `string` | `'i-lucide-check'` | Selected indicator |
| `deleteIcon` | `string` | `'i-lucide-x'` | Tag delete icon (multiple mode) |
| `clear` | `boolean \| ButtonProps` | - | Clear button |
| `openOnClick` / `openOnFocus` | `boolean` | - | Auto-open triggers |
| `content` | `object` | - | Menu positioning |
| `virtualize` | `boolean \| config` | - | Virtual scrolling |

**Note**: When `autocomplete` is enabled, `multiple`, `by`, and `resetSearchTermOnSelect` are unavailable.

---

## UInputNumber

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
| `disableWheelChange` | `boolean` | - | Prevent wheel scroll changes |

```vue
<UInputNumber v-model="price" :format-options="{ style: 'currency', currency: 'USD' }" />
```

---

## UInputDate

Date input using `@internationalized/date` for locale-aware formatting.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `CalendarDate \| CalendarDateTime \| ZonedDateTime \| DateRange` | - | v-model |
| `range` | `boolean` | `false` | Date range selection |
| `granularity` | `Granularity` | `'day'` / `'minute'` | Formatting granularity |
| `hourCycle` | `HourCycle` | locale-dependent | 12 or 24 hour format |
| `minValue` / `maxValue` | `DateValue` | - | Date constraints |
| `isDateUnavailable` | `Matcher` | - | Unavailable date function |

---

## UInputTime

Time input using `@internationalized/date`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Time \| CalendarDateTime \| ZonedDateTime` | - | v-model |
| `granularity` | `'hour' \| 'minute' \| 'second'` | `'minute'` | Precision |
| `hourCycle` | `HourCycle` | locale-dependent | 12/24 format |
| `minValue` / `maxValue` | `TimeValue` | - | Constraints |

---

## UInputTags

Interactive tag input.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T[] \| null` | - | v-model binding |
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

**Events**: `update:modelValue`, `change`, `blur`, `focus`, `invalid(T)`, `addTag(T)`, `removeTag(T)`

---

## UCheckbox

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T \| 'indeterminate' \| null` | - | v-model |
| `label` | `string` | - | Label text |
| `description` | `string` | - | Description text |
| `color` | Color | `'primary'` | Color |
| `variant` | `'card' \| 'list'` | `'list'` | Visual variant |
| `indicator` | `'start' \| 'end' \| 'hidden'` | `'start'` | Position |
| `icon` | `string` | `'i-lucide-check'` | Checked icon |
| `trueValue` | `T` | `true` | Value when checked |
| `falseValue` | `T` | `false` | Value when unchecked |

---

## URadioGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `any` | - | Selected value |
| `items` | `Array` | - | Options |
| `valueKey` | `string` | `'value'` | Value property |
| `labelKey` | `string` | `'label'` | Label property |
| `legend` | `string` | - | Group legend |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout |
| `variant` | `'list' \| 'card' \| 'table'` | `'list'` | Visual style |
| `indicator` | `'start' \| 'end' \| 'hidden'` | `'start'` | Position |
| `loop` | `boolean` | - | Keyboard navigation looping |

---

## USwitch

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T \| null` | - | v-model |
| `label` | `string` | - | Label text |
| `description` | `string` | - | Description |
| `loading` | `boolean` | `false` | Loading state |
| `checkedIcon` / `uncheckedIcon` | `string` | - | State icons |
| `trueValue` | `T` | `true` | Value when on |
| `falseValue` | `T` | `false` | Value when off |

---

## UColorPicker

| Prop | Type | Default |
|------|------|---------|
| `modelValue` | `string` | - |
| `format` | `'hex' \| 'rgb' \| 'hsl' \| 'cmyk' \| 'lab'` | `'hex'` |
| `size` | Size | `'md'` |
| `throttle` | `number` | `50` |

---

## USlider

| Prop | Type | Default |
|------|------|---------|
| `modelValue` | `number \| number[]` | - |
| `min` | `number` | `0` |
| `max` | `number` | `100` |
| `step` | `number` | `1` |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `tooltip` | `boolean \| TooltipProps` | - |
| `inverted` | `boolean` | `false` |
| `minStepsBetweenThumbs` | `number` | - |

---

## UPinInput

| Prop | Type | Default |
|------|------|---------|
| `modelValue` | `PinInputValue<T>` | - |
| `length` | `string \| number` | `5` |
| `type` | `'text' \| 'number'` | `'text'` |
| `mask` | `boolean` | - |
| `otp` | `boolean` | - |

**Events**: `update:modelValue`, `complete`, `change`, `blur`

---

## UFileUpload

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `File \| File[] \| null` | - | v-model |
| `accept` | `string` | `'*'` | MIME types/extensions |
| `multiple` | `boolean` | `false` | Multi-file |
| `variant` | `'area' \| 'button'` | `'area'` | Visual style |
| `layout` | `'list' \| 'grid'` | `'grid'` | File preview layout |
| `position` | `'inside' \| 'outside'` | `'outside'` | File position |
| `icon` | `string` | `'i-lucide-upload'` | Upload icon |
| `dropzone` | `boolean` | `true` | Enable drag-drop |
| `preview` | `boolean` | `true` | Show file previews |
| `fileDelete` | `boolean \| ButtonProps` | `true` | Delete button config |

**Slots**: `default`, `leading`, `label`, `description`, `actions({ open, removeFile })`, `files`, `file`, `file-leading`, `file-name`, `file-size`, `file-trailing`
**Expose**: `inputRef`, `dropzoneRef`

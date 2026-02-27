<script setup lang="ts">
import { DatePicker as VCalendarDatePicker } from "v-calendar";
// @ts-ignore
import type {
  DatePickerDate,
  DatePickerRangeObject,
} from "v-calendar/dist/types/src/use/datePicker";
import "v-calendar/dist/style.css";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  modelValue: {
    type: [Date, Object] as PropType<
      DatePickerDate | DatePickerRangeObject | null
    >,
    default: null,
  },
});

const emit = defineEmits(["update:model-value", "close"]);

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:model-value", value);
    emit("close");
  },
});

const attrs = {
  transparent: true,
  borderless: true,
  color: "primary",
  "is-dark": { selector: "html", darkClass: "dark" },
  "first-day-of-week": 2,
};

function onDayClick(_: any, event: MouseEvent): void {
  const target = event.target as HTMLElement;
  target.blur();
}
</script>

<template>
  <VCalendarDatePicker
    v-if="date && (date as DatePickerRangeObject)?.start && (date as DatePickerRangeObject)?.end"
    v-model.range="date"
    :columns="2"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
  <VCalendarDatePicker
    v-else
    v-model="date"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
</template>

<style>
/* Warm distillery palette mapped to v-calendar gray scale */
:root {
  --vc-gray-50: #faf5ed;
  --vc-gray-100: #f3e2c6;
  --vc-gray-200: #e0cba8;
  --vc-gray-300: #ccb48a;
  --vc-gray-400: #b09a7a;
  --vc-gray-500: #8a7560;
  --vc-gray-600: #6b5a48;
  --vc-gray-700: #4d3f30;
  --vc-gray-800: #2a1f17;
  --vc-gray-900: #1a120c;
}

/* Gold/copper accent for selected dates */
.vc-primary {
  --vc-accent-50: #fdf8ef;
  --vc-accent-100: #f9edcf;
  --vc-accent-200: #f0d89f;
  --vc-accent-300: #e6c270;
  --vc-accent-400: #d6b169;
  --vc-accent-500: #c8944a;
  --vc-accent-600: #b88a4f;
  --vc-accent-700: #96703e;
  --vc-accent-800: #785932;
  --vc-accent-900: #5a4226;
}
</style>

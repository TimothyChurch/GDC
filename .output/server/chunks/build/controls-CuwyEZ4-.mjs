import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { k as useWebSocket, f as _sfc_main$e, e as _sfc_main$8, l as useRuntimeConfig, i as useAppConfig, r as reactivePick, j as useFormField, t as tv } from './server.mjs';
import { defineComponent, computed, reactive, ref, watch, withCtx, unref, createVNode, createTextVNode, toDisplayString, useModel, mergeProps, openBlock, createBlock, Fragment, renderList, mergeModels, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
import { useForwardPropsEmits, SliderRoot, SliderTrack, SliderRange, SliderThumb } from 'reka-ui';
import { _ as _sfc_main$2 } from './Tooltip-wiUkEzv7.mjs';
import '../nitro/nitro.mjs';
import 'mongoose';
import 'yup';
import 'cloudinary';
import 'square';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'consola';
import 'consola/utils';
import 'node:url';
import '@iconify/utils';
import 'fast-xml-parser';
import 'ipx';
import 'pinia';
import 'vue-router';
import 'tailwindcss/colors';
import '@iconify/vue';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './Kbd-C22JBoFL.mjs';

const theme = {
  "slots": {
    "root": "relative flex items-center select-none touch-none",
    "track": "relative bg-accented overflow-hidden rounded-full grow",
    "range": "absolute rounded-full",
    "thumb": "rounded-full bg-default ring-2 focus-visible:outline-2 focus-visible:outline-offset-2"
  },
  "variants": {
    "color": {
      "primary": {
        "range": "bg-primary",
        "thumb": "ring-primary focus-visible:outline-primary/50"
      },
      "secondary": {
        "range": "bg-secondary",
        "thumb": "ring-secondary focus-visible:outline-secondary/50"
      },
      "success": {
        "range": "bg-success",
        "thumb": "ring-success focus-visible:outline-success/50"
      },
      "info": {
        "range": "bg-info",
        "thumb": "ring-info focus-visible:outline-info/50"
      },
      "warning": {
        "range": "bg-warning",
        "thumb": "ring-warning focus-visible:outline-warning/50"
      },
      "error": {
        "range": "bg-error",
        "thumb": "ring-error focus-visible:outline-error/50"
      },
      "neutral": {
        "range": "bg-inverted",
        "thumb": "ring-inverted focus-visible:outline-inverted/50"
      }
    },
    "size": {
      "xs": {
        "thumb": "size-3"
      },
      "sm": {
        "thumb": "size-3.5"
      },
      "md": {
        "thumb": "size-4"
      },
      "lg": {
        "thumb": "size-4.5"
      },
      "xl": {
        "thumb": "size-5"
      }
    },
    "orientation": {
      "horizontal": {
        "root": "w-full",
        "range": "h-full"
      },
      "vertical": {
        "root": "flex-col h-full",
        "range": "w-full"
      }
    },
    "disabled": {
      "true": {
        "root": "opacity-75 cursor-not-allowed"
      }
    }
  },
  "compoundVariants": [
    {
      "orientation": "horizontal",
      "size": "xs",
      "class": {
        "track": "h-[6px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "sm",
      "class": {
        "track": "h-[7px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "md",
      "class": {
        "track": "h-[8px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "lg",
      "class": {
        "track": "h-[9px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "xl",
      "class": {
        "track": "h-[10px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xs",
      "class": {
        "track": "w-[6px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "sm",
      "class": {
        "track": "w-[7px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "md",
      "class": {
        "track": "w-[8px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "lg",
      "class": {
        "track": "w-[9px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xl",
      "class": {
        "track": "w-[10px]"
      }
    }
  ],
  "defaultVariants": {
    "size": "md",
    "color": "primary"
  }
};
const _sfc_main$1 = {
  __name: "USlider",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    as: { type: null, required: false },
    size: { type: null, required: false },
    color: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    tooltip: { type: [Boolean, Object], required: false },
    defaultValue: { type: [Number, Array], required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    name: { type: String, required: false },
    disabled: { type: Boolean, required: false },
    inverted: { type: Boolean, required: false },
    min: { type: Number, required: false, default: 0 },
    max: { type: Number, required: false, default: 100 },
    step: { type: Number, required: false, default: 1 },
    minStepsBetweenThumbs: { type: Number, required: false }
  }, {
    "modelValue": { type: null },
    "modelModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["change"], ["update:modelValue"]),
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const modelValue = useModel(__props, "modelValue");
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "as", "orientation", "min", "max", "step", "minStepsBetweenThumbs", "inverted"), emits);
    const { id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField(props);
    const defaultSliderValue = computed(() => {
      if (typeof props.defaultValue === "number") {
        return [props.defaultValue];
      }
      return props.defaultValue;
    });
    const sliderValue = computed({
      get() {
        if (typeof modelValue.value === "number") {
          return [modelValue.value];
        }
        return modelValue.value ?? defaultSliderValue.value;
      },
      set(value) {
        modelValue.value = value?.length !== 1 ? value : value[0];
      }
    });
    const thumbs = computed(() => sliderValue.value?.length ?? 1);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.slider || {} })({
      disabled: disabled.value,
      size: size.value,
      color: color.value,
      orientation: props.orientation
    }));
    function onChange(value) {
      const event = new Event("change", { target: { value } });
      emits("change", event);
      emitFormChange();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(SliderRoot), mergeProps({ ...unref(rootProps), ...unref(ariaAttrs) }, {
        id: unref(id),
        modelValue: sliderValue.value,
        "onUpdate:modelValue": [($event) => sliderValue.value = $event, ($event) => unref(emitFormInput)()],
        name: unref(name),
        disabled: unref(disabled),
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] }),
        "default-value": defaultSliderValue.value,
        onValueCommit: onChange
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(SliderTrack), {
              "data-slot": "track",
              class: ui.value.track({ class: props.ui?.track })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(SliderRange), {
                    "data-slot": "range",
                    class: ui.value.range({ class: props.ui?.range })
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(SliderRange), {
                      "data-slot": "range",
                      class: ui.value.range({ class: props.ui?.range })
                    }, null, 8, ["class"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<!--[-->`);
            ssrRenderList(thumbs.value, (thumb) => {
              _push2(`<!--[-->`);
              if (!!__props.tooltip) {
                _push2(ssrRenderComponent(_sfc_main$2, mergeProps({
                  text: thumbs.value > 1 ? String(sliderValue.value?.[thumb - 1]) : String(sliderValue.value),
                  "disable-closing-trigger": ""
                }, { ref_for: true }, typeof __props.tooltip === "object" ? __props.tooltip : {}), {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(unref(SliderThumb), {
                        "data-slot": "thumb",
                        class: ui.value.thumb({ class: props.ui?.thumb }),
                        "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(unref(SliderThumb), {
                          "data-slot": "thumb",
                          class: ui.value.thumb({ class: props.ui?.thumb }),
                          "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                        }, null, 8, ["class", "aria-label"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(unref(SliderThumb), {
                  "data-slot": "thumb",
                  class: ui.value.thumb({ class: props.ui?.thumb }),
                  "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                }, null, _parent2, _scopeId));
              }
              _push2(`<!--]-->`);
            });
            _push2(`<!--]-->`);
          } else {
            return [
              createVNode(unref(SliderTrack), {
                "data-slot": "track",
                class: ui.value.track({ class: props.ui?.track })
              }, {
                default: withCtx(() => [
                  createVNode(unref(SliderRange), {
                    "data-slot": "range",
                    class: ui.value.range({ class: props.ui?.range })
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class"]),
              (openBlock(true), createBlock(Fragment, null, renderList(thumbs.value, (thumb) => {
                return openBlock(), createBlock(Fragment, { key: thumb }, [
                  !!__props.tooltip ? (openBlock(), createBlock(_sfc_main$2, mergeProps({
                    key: 0,
                    text: thumbs.value > 1 ? String(sliderValue.value?.[thumb - 1]) : String(sliderValue.value),
                    "disable-closing-trigger": ""
                  }, { ref_for: true }, typeof __props.tooltip === "object" ? __props.tooltip : {}), {
                    default: withCtx(() => [
                      createVNode(unref(SliderThumb), {
                        "data-slot": "thumb",
                        class: ui.value.thumb({ class: props.ui?.thumb }),
                        "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                      }, null, 8, ["class", "aria-label"])
                    ]),
                    _: 2
                  }, 1040, ["text"])) : (openBlock(), createBlock(unref(SliderThumb), {
                    key: 1,
                    "data-slot": "thumb",
                    class: ui.value.thumb({ class: props.ui?.thumb }),
                    "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                  }, null, 8, ["class", "aria-label"]))
                ], 64);
              }), 128))
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui/dist/runtime/components/Slider.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "controls",
  __ssrInlineRender: true,
  setup(__props) {
    const runtimeConfig = useRuntimeConfig();
    const { status, data, send } = useWebSocket(
      runtimeConfig.public.wsUrl
    );
    const statusLabel = computed(() => {
      switch (status.value) {
        case "CONNECTING":
          return "Connecting";
        case "OPEN":
          return "Connected";
        case "CLOSED":
          return "Disconnected";
        default:
          return "Unknown";
      }
    });
    const statusClass = computed(() => {
      switch (status.value) {
        case "CONNECTING":
          return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
        case "OPEN":
          return "bg-green-500/15 text-green-400 border-green-500/25";
        case "CLOSED":
          return "bg-red-500/15 text-red-400 border-red-500/25";
        default:
          return "bg-red-500/15 text-red-400 border-red-500/25";
      }
    });
    const statusDot = computed(() => {
      switch (status.value) {
        case "CONNECTING":
          return "bg-yellow-400";
        case "OPEN":
          return "bg-green-400";
        case "CLOSED":
          return "bg-red-400";
        default:
          return "bg-red-400";
      }
    });
    let inputData = reactive({
      kettle: { status: false, power: 0, reflux: 0, agitator: false },
      mashTun: { status: false, power: 0, agitator: false }
    });
    const activityLog = ref([]);
    const loadingLogs = ref(false);
    const fetchLogs = async () => {
      loadingLogs.value = true;
      try {
        const response = await $fetch("/api/equipmentLog");
        activityLog.value = response;
      } catch {
      } finally {
        loadingLogs.value = false;
      }
    };
    fetchLogs();
    const logAction = async (equipment, action, value) => {
      try {
        const entry = await $fetch("/api/equipmentLog/create", {
          method: "POST",
          body: { equipment, action, value, timestamp: (/* @__PURE__ */ new Date()).toISOString() }
        });
        activityLog.value.unshift(entry);
        if (activityLog.value.length > 20) activityLog.value.pop();
      } catch {
      }
    };
    const sendMessage = () => {
      send(
        JSON.stringify({
          type: "update",
          data: inputData
        }),
        true
      );
    };
    watch(
      () => data,
      () => {
        inputData = { ...data.value };
      }
    );
    watch(() => inputData.mashTun.status, (val) => {
      logAction("Mash Tun", val ? "Turned ON" : "Turned OFF");
    });
    watch(() => inputData.mashTun.power, (val) => {
      logAction("Mash Tun", "Power changed", val);
    });
    watch(() => inputData.mashTun.agitator, (val) => {
      logAction("Mash Tun", val ? "Agitator ON" : "Agitator OFF");
    });
    watch(() => inputData.kettle.status, (val) => {
      logAction("Kettle/Still", val ? "Turned ON" : "Turned OFF");
    });
    watch(() => inputData.kettle.power, (val) => {
      logAction("Kettle/Still", "Power changed", val);
    });
    watch(() => inputData.kettle.reflux, (val) => {
      logAction("Kettle/Still", "Reflux changed", val);
    });
    watch(() => inputData.kettle.agitator, (val) => {
      logAction("Kettle/Still", val ? "Agitator ON" : "Agitator OFF");
    });
    watch(
      () => [
        inputData.kettle.status,
        inputData.kettle.power,
        inputData.kettle.reflux,
        inputData.kettle.agitator,
        inputData.mashTun.status,
        inputData.mashTun.power,
        inputData.mashTun.agitator
      ],
      () => {
        if (!inputData.kettle.status) {
          inputData.kettle.power = 0;
          inputData.kettle.reflux = 100;
          inputData.kettle.agitator = false;
        }
        if (!inputData.mashTun.status) {
          inputData.mashTun.power = 0;
          inputData.mashTun.agitator = false;
        }
        sendMessage();
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UIcon = _sfc_main$e;
      const _component_UButton = _sfc_main$8;
      const _component_USlider = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Equipment Controls",
        subtitle: "Real-time equipment monitoring and control",
        icon: "i-lucide-settings"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="${ssrRenderClass(["inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", unref(statusClass)])}"${_scopeId}><span class="${ssrRenderClass(["w-2 h-2 rounded-full", unref(statusDot)])}"${_scopeId}></span> ${ssrInterpolate(unref(statusLabel))}</span>`);
          } else {
            return [
              createVNode("span", {
                class: ["inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", unref(statusClass)]
              }, [
                createVNode("span", {
                  class: ["w-2 h-2 rounded-full", unref(statusDot)]
                }, null, 2),
                createTextVNode(" " + toDisplayString(unref(statusLabel)), 1)
              ], 2)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden"><div class="flex items-center justify-between px-5 py-4 border-b border-brown/20"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-flame",
        class: "text-xl text-copper"
      }, null, _parent));
      _push(`</div><div><h3 class="text-base font-semibold text-parchment font-[Cormorant_Garamond]">Mash Tun</h3><p class="text-xs text-parchment/60">Heating and agitation control</p></div></div>`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "sm",
        color: unref(inputData).mashTun.status ? "success" : "error",
        variant: "soft",
        label: unref(inputData).mashTun.status ? "ON" : "OFF",
        onClick: ($event) => unref(inputData).mashTun.status = !unref(inputData).mashTun.status
      }, null, _parent));
      _push(`</div><div class="p-5 space-y-5"><div><div class="flex items-center justify-between mb-2"><label class="text-xs font-medium text-parchment/50">Power Level</label><span class="${ssrRenderClass([unref(inputData).mashTun.status ? "text-parchment" : "text-parchment/50", "text-sm font-semibold"])}">${ssrInterpolate(unref(inputData).mashTun.power)}% </span></div><div class="relative h-3 rounded-full bg-brown/20 overflow-hidden"><div class="${ssrRenderClass([unref(inputData).mashTun.status ? "bg-gradient-to-r from-copper/60 to-copper" : "bg-parchment/10", "absolute inset-y-0 left-0 rounded-full transition-all duration-300"])}" style="${ssrRenderStyle({ width: `${unref(inputData).mashTun.power}%` })}"></div></div>`);
      _push(ssrRenderComponent(_component_USlider, {
        modelValue: unref(inputData).mashTun.power,
        "onUpdate:modelValue": ($event) => unref(inputData).mashTun.power = $event,
        min: 0,
        max: 100,
        disabled: !unref(inputData).mashTun.status,
        color: "primary",
        class: "mt-2"
      }, null, _parent));
      _push(`</div><div class="flex items-center justify-between"><div><label class="text-sm font-medium text-parchment/70">Agitator</label><p class="text-xs text-parchment/50">Mixing paddle motor</p></div>`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "xs",
        color: unref(inputData).mashTun.agitator ? "success" : "neutral",
        variant: "soft",
        label: unref(inputData).mashTun.agitator ? "Running" : "Stopped",
        disabled: !unref(inputData).mashTun.status,
        onClick: ($event) => unref(inputData).mashTun.agitator = !unref(inputData).mashTun.agitator
      }, null, _parent));
      _push(`</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 overflow-hidden"><div class="flex items-center justify-between px-5 py-4 border-b border-brown/20"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-flask-conical",
        class: "text-xl text-gold"
      }, null, _parent));
      _push(`</div><div><h3 class="text-base font-semibold text-parchment font-[Cormorant_Garamond]">Kettle / Still</h3><p class="text-xs text-parchment/60">Distillation heating and reflux</p></div></div>`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "sm",
        color: unref(inputData).kettle.status ? "success" : "error",
        variant: "soft",
        label: unref(inputData).kettle.status ? "ON" : "OFF",
        onClick: ($event) => unref(inputData).kettle.status = !unref(inputData).kettle.status
      }, null, _parent));
      _push(`</div><div class="p-5 space-y-5"><div><div class="flex items-center justify-between mb-2"><label class="text-xs font-medium text-parchment/50">Power Level</label><span class="${ssrRenderClass([unref(inputData).kettle.status ? "text-parchment" : "text-parchment/50", "text-sm font-semibold"])}">${ssrInterpolate(unref(inputData).kettle.power)}% </span></div><div class="relative h-3 rounded-full bg-brown/20 overflow-hidden"><div class="${ssrRenderClass([unref(inputData).kettle.status ? "bg-gradient-to-r from-gold/60 to-gold" : "bg-parchment/10", "absolute inset-y-0 left-0 rounded-full transition-all duration-300"])}" style="${ssrRenderStyle({ width: `${unref(inputData).kettle.power}%` })}"></div></div>`);
      _push(ssrRenderComponent(_component_USlider, {
        modelValue: unref(inputData).kettle.power,
        "onUpdate:modelValue": ($event) => unref(inputData).kettle.power = $event,
        min: 0,
        max: 100,
        disabled: !unref(inputData).kettle.status,
        color: "primary",
        class: "mt-2"
      }, null, _parent));
      _push(`</div><div><div class="flex items-center justify-between mb-2"><label class="text-xs font-medium text-parchment/50">Reflux</label><span class="${ssrRenderClass([unref(inputData).kettle.status ? "text-parchment" : "text-parchment/50", "text-sm font-semibold"])}">${ssrInterpolate(unref(inputData).kettle.reflux)}% </span></div><div class="relative h-3 rounded-full bg-brown/20 overflow-hidden"><div class="${ssrRenderClass([unref(inputData).kettle.status ? "bg-gradient-to-r from-blue-500/60 to-blue-400" : "bg-parchment/10", "absolute inset-y-0 left-0 rounded-full transition-all duration-300"])}" style="${ssrRenderStyle({ width: `${unref(inputData).kettle.reflux}%` })}"></div></div>`);
      _push(ssrRenderComponent(_component_USlider, {
        modelValue: unref(inputData).kettle.reflux,
        "onUpdate:modelValue": ($event) => unref(inputData).kettle.reflux = $event,
        min: 0,
        max: 100,
        disabled: !unref(inputData).kettle.status,
        color: "info",
        class: "mt-2"
      }, null, _parent));
      _push(`</div><div class="flex items-center justify-between"><div><label class="text-sm font-medium text-parchment/70">Agitator</label><p class="text-xs text-parchment/50">Mixing paddle motor</p></div>`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "xs",
        color: unref(inputData).kettle.agitator ? "success" : "neutral",
        variant: "soft",
        label: unref(inputData).kettle.agitator ? "Running" : "Stopped",
        disabled: !unref(inputData).kettle.status,
        onClick: ($event) => unref(inputData).kettle.agitator = !unref(inputData).kettle.agitator
      }, null, _parent));
      _push(`</div></div></div></div><div class="mt-6 bg-charcoal rounded-xl border border-brown/30 overflow-hidden"><div class="flex items-center justify-between px-5 py-4 border-b border-brown/20"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-activity",
        class: "text-xl text-parchment/60"
      }, null, _parent));
      _push(`</div><div><h3 class="text-base font-semibold text-parchment font-[Cormorant_Garamond]">Recent Activity</h3><p class="text-xs text-parchment/60">Last 20 equipment actions</p></div></div></div>`);
      if (unref(loadingLogs)) {
        _push(`<div class="p-5 text-center">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "text-lg text-parchment/60 animate-spin"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(activityLog).length > 0) {
        _push(`<div class="divide-y divide-brown/20 max-h-64 overflow-y-auto"><!--[-->`);
        ssrRenderList(unref(activityLog).slice(0, 20), (log, i) => {
          _push(`<div class="flex items-center justify-between px-5 py-2.5"><div class="flex items-center gap-3"><span class="text-xs text-parchment/60 w-20 shrink-0">${ssrInterpolate(new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))}</span><span class="text-sm text-parchment/70">${ssrInterpolate(log.equipment)}</span><span class="text-sm text-parchment">${ssrInterpolate(log.action)}</span></div>`);
          if (log.value !== void 0) {
            _push(`<span class="text-xs text-parchment/60">${ssrInterpolate(log.value)}%</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="p-5 text-center"><p class="text-sm text-parchment/50">No activity recorded</p></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/controls.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=controls-CuwyEZ4-.mjs.map

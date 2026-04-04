import { _ as _sfc_main$3 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$4 } from './Form-B0crAOcM.mjs';
import { _ as _sfc_main$5 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$6 } from './SiteDatePicker-pVMyeD61.mjs';
import { _ as _sfc_main$7 } from './SelectMenu-DljUyjmT.mjs';
import { _ as __nuxt_component_8 } from './BaseItemSelect-8IgvW2BX.mjs';
import { _ as _sfc_main$9 } from './Input-Fd8Vd_4J.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttrs } from 'vue/server-renderer';
import { _ as _sfc_main$a } from './Separator-C6vDFXmY.mjs';
import { _ as _sfc_main$b } from './Switch-BH6j8VnQ.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import * as yup from 'yup';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { u as useVesselStore, a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useFormPanel } from './useFormPanel-DspW7Iuy.mjs';
import { u as useProductionCosts } from './useProductionCosts-BgHwywl6.mjs';
import 'reka-ui';
import '../nitro/nitro.mjs';
import 'mongoose';
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
import './Popover-BvOOk09Z.mjs';
import 'reka-ui/namespaced';
import './FieldGroup-bwPzB93U.mjs';
import 'v-calendar';
import 'date-fns';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './helpers-pfHQ8kqT.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ProductionCostBreakdown",
  __ssrInlineRender: true,
  props: {
    localData: {},
    calculatedBatchCost: {},
    calculatedBarrelCost: {},
    calculatedBottlingCost: {},
    calculatedTtbTax: {},
    calculatedTabcTax: {},
    totalProductionCost: {},
    perBottleCost: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UFormField = _sfc_main$5;
      const _component_UInput = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "border-t border-brown/20 pt-4" }, _attrs))}><h3 class="text-sm font-semibold text-parchment/70 mb-3"> Cost Breakdown </h3><div class="space-y-3"><div class="grid grid-cols-2 gap-3">`);
      _push(ssrRenderComponent(_component_UFormField, { label: "Batch / Spirit" }, {
        hint: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-[10px] text-parchment/50"${_scopeId}>Auto-calculated from vessels</span>`);
          } else {
            return [
              createVNode("span", { class: "text-[10px] text-parchment/50" }, "Auto-calculated from vessels")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UInput, {
              "model-value": __props.calculatedBatchCost.toFixed(2),
              disabled: "",
              icon: "i-lucide-lock",
              class: "flex-1"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2" }, [
                createVNode(_component_UInput, {
                  "model-value": __props.calculatedBatchCost.toFixed(2),
                  disabled: "",
                  icon: "i-lucide-lock",
                  class: "flex-1"
                }, null, 8, ["model-value"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "Barrel" }, {
        hint: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-[10px] text-parchment/50"${_scopeId}>Auto-calculated from barrels</span>`);
          } else {
            return [
              createVNode("span", { class: "text-[10px] text-parchment/50" }, "Auto-calculated from barrels")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              "model-value": __props.calculatedBarrelCost.toFixed(2),
              disabled: "",
              icon: "i-lucide-lock"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                "model-value": __props.calculatedBarrelCost.toFixed(2),
                disabled: "",
                icon: "i-lucide-lock"
              }, null, 8, ["model-value"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UFormField, { label: "Bottling Materials" }, {
        hint: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-[10px] text-parchment/50"${_scopeId}>Glass + cap + label per unit x quantity</span>`);
          } else {
            return [
              createVNode("span", { class: "text-[10px] text-parchment/50" }, "Glass + cap + label per unit x quantity")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              "model-value": __props.calculatedBottlingCost.toFixed(2),
              disabled: "",
              icon: "i-lucide-lock"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                "model-value": __props.calculatedBottlingCost.toFixed(2),
                disabled: "",
                icon: "i-lucide-lock"
              }, null, 8, ["model-value"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 gap-3">`);
      _push(ssrRenderComponent(_component_UFormField, { label: "TTB Federal Tax" }, {
        hint: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-[10px] text-parchment/50"${_scopeId}>$2.70/PG (CBMA Tier 1)</span>`);
          } else {
            return [
              createVNode("span", { class: "text-[10px] text-parchment/50" }, "$2.70/PG (CBMA Tier 1)")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              "model-value": __props.calculatedTtbTax.toFixed(2),
              disabled: "",
              icon: "i-lucide-lock"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                "model-value": __props.calculatedTtbTax.toFixed(2),
                disabled: "",
                icon: "i-lucide-lock"
              }, null, 8, ["model-value"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "TABC Texas Tax" }, {
        hint: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-[10px] text-parchment/50"${_scopeId}>$2.40/wine gallon</span>`);
          } else {
            return [
              createVNode("span", { class: "text-[10px] text-parchment/50" }, "$2.40/wine gallon")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              "model-value": __props.calculatedTabcTax.toFixed(2),
              disabled: "",
              icon: "i-lucide-lock"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                "model-value": __props.calculatedTabcTax.toFixed(2),
                disabled: "",
                icon: "i-lucide-lock"
              }, null, 8, ["model-value"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="grid grid-cols-2 gap-3">`);
      _push(ssrRenderComponent(_component_UFormField, { label: "Labor" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: __props.localData.costs.labor,
              "onUpdate:modelValue": ($event) => __props.localData.costs.labor = $event,
              type: "number",
              step: "0.01",
              min: "0",
              placeholder: "0.00"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: __props.localData.costs.labor,
                "onUpdate:modelValue": ($event) => __props.localData.costs.labor = $event,
                type: "number",
                step: "0.01",
                min: "0",
                placeholder: "0.00"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UFormField, { label: "Other" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: __props.localData.costs.other,
              "onUpdate:modelValue": ($event) => __props.localData.costs.other = $event,
              type: "number",
              step: "0.01",
              min: "0",
              placeholder: "0.00"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UInput, {
                modelValue: __props.localData.costs.other,
                "onUpdate:modelValue": ($event) => __props.localData.costs.other = $event,
                type: "number",
                step: "0.01",
                min: "0",
                placeholder: "0.00"
              }, null, 8, ["modelValue", "onUpdate:modelValue"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="bg-brown/10 rounded-lg border border-brown/20 p-3 space-y-2"><div class="flex justify-between text-sm"><span class="text-parchment/50">Total Production Cost</span><span class="text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.totalProductionCost))}</span></div><div class="flex justify-between text-sm"><span class="text-parchment/50">Cost Per Bottle</span><span class="text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.perBottleCost))}</span></div></div></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Production/ProductionCostBreakdown.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_9 = Object.assign(_sfc_main$2, { __name: "ProductionCostBreakdown" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ProductionWizard",
  __ssrInlineRender: true,
  props: {
    currentStep: {},
    localData: {},
    vesselLabels: {},
    selectedVesselDetails: {},
    costBreakdownLines: {},
    calculatedBatchCost: {},
    calculatedBarrelCost: {},
    calculatedBottlingCost: {},
    calculatedTtbTax: {},
    calculatedTabcTax: {},
    totalProductionCost: {},
    perBottleCost: {},
    updateInventory: { type: Boolean },
    selectedBottleName: {}
  },
  emits: ["update:currentStep", "update:updateInventory"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const bottleStore = useBottleStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UFormField = _sfc_main$5;
      const _component_SiteDatePicker = _sfc_main$6;
      const _component_USelectMenu = _sfc_main$7;
      const _component_BaseItemSelect = __nuxt_component_8;
      const _component_UInput = _sfc_main$9;
      const _component_UIcon = _sfc_main$e;
      const _component_USeparator = _sfc_main$a;
      const _component_USwitch = _sfc_main$b;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      if (__props.currentStep === 1) {
        _push(`<div class="space-y-4"><h3 class="text-sm font-semibold text-parchment/70"> Select Source Vessels </h3>`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Production Date" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_SiteDatePicker, {
                modelValue: __props.localData.date,
                "onUpdate:modelValue": ($event) => __props.localData.date = $event
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_SiteDatePicker, {
                  modelValue: __props.localData.date,
                  "onUpdate:modelValue": ($event) => __props.localData.date = $event
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Vessels" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelectMenu, {
                modelValue: __props.localData.vessel,
                "onUpdate:modelValue": ($event) => __props.localData.vessel = $event,
                items: __props.vesselLabels,
                "label-key": "name",
                "value-key": "_id",
                multiple: "",
                searchable: "",
                class: "w-full"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelectMenu, {
                  modelValue: __props.localData.vessel,
                  "onUpdate:modelValue": ($event) => __props.localData.vessel = $event,
                  items: __props.vesselLabels,
                  "label-key": "name",
                  "value-key": "_id",
                  multiple: "",
                  searchable: "",
                  class: "w-full"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (__props.selectedVesselDetails.length > 0) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(__props.selectedVesselDetails, (v, i) => {
            _push(`<div class="bg-brown/10 rounded-lg border border-brown/20 p-3"><div class="text-xs font-medium text-parchment/70">${ssrInterpolate(v.name)}</div><div class="text-xs text-parchment/60">${ssrInterpolate(v.contents?.join(", "))} - ${ssrInterpolate(v.volume)} ${ssrInterpolate(v.volumeUnit)}</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.currentStep === 2) {
        _push(`<div class="space-y-4"><h3 class="text-sm font-semibold text-parchment/70"> Select Product </h3>`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Bottle" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_USelectMenu, {
                modelValue: __props.localData.bottle,
                "onUpdate:modelValue": ($event) => __props.localData.bottle = $event,
                items: unref(bottleStore).bottles,
                "label-key": "name",
                "value-key": "_id",
                searchable: "",
                class: "w-full"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_USelectMenu, {
                  modelValue: __props.localData.bottle,
                  "onUpdate:modelValue": ($event) => __props.localData.bottle = $event,
                  items: unref(bottleStore).bottles,
                  "label-key": "name",
                  "value-key": "_id",
                  searchable: "",
                  class: "w-full"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Glassware" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_BaseItemSelect, {
                modelValue: __props.localData.bottling.glassware,
                "onUpdate:modelValue": ($event) => __props.localData.bottling.glassware = $event,
                "filter-by-type": "glass bottle",
                "create-type": "glass bottle",
                "create-category": "Bottling"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_BaseItemSelect, {
                  modelValue: __props.localData.bottling.glassware,
                  "onUpdate:modelValue": ($event) => __props.localData.bottling.glassware = $event,
                  "filter-by-type": "glass bottle",
                  "create-type": "glass bottle",
                  "create-category": "Bottling"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Cap" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_BaseItemSelect, {
                modelValue: __props.localData.bottling.cap,
                "onUpdate:modelValue": ($event) => __props.localData.bottling.cap = $event,
                "filter-by-type": "bottle cap",
                "create-type": "bottle cap",
                "create-category": "Bottling"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_BaseItemSelect, {
                  modelValue: __props.localData.bottling.cap,
                  "onUpdate:modelValue": ($event) => __props.localData.bottling.cap = $event,
                  "filter-by-type": "bottle cap",
                  "create-type": "bottle cap",
                  "create-category": "Bottling"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Label" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_BaseItemSelect, {
                modelValue: __props.localData.bottling.label,
                "onUpdate:modelValue": ($event) => __props.localData.bottling.label = $event,
                "filter-by-type": "label",
                "create-type": "label",
                "create-category": "Bottling"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_BaseItemSelect, {
                  modelValue: __props.localData.bottling.label,
                  "onUpdate:modelValue": ($event) => __props.localData.bottling.label = $event,
                  "filter-by-type": "label",
                  "create-type": "label",
                  "create-category": "Bottling"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Quantity" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: __props.localData.quantity,
                "onUpdate:modelValue": ($event) => __props.localData.quantity = $event,
                type: "number"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: __props.localData.quantity,
                  "onUpdate:modelValue": ($event) => __props.localData.quantity = $event,
                  type: "number"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.currentStep === 3) {
        _push(`<div class="space-y-4"><h3 class="text-sm font-semibold text-parchment/70"> Production Costs </h3><p class="text-xs text-parchment/50"> Batch, barrel, and bottling material costs are calculated automatically. Enter any additional costs below. </p><div class="space-y-2"><div class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-flask-conical",
          class: "text-parchment/50 w-4 h-4"
        }, null, _parent));
        _push(`<span class="text-parchment/70">Batch / Spirit</span></div><span class="text-parchment font-medium">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.calculatedBatchCost))}</span></div><div class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-cylinder",
          class: "text-parchment/50 w-4 h-4"
        }, null, _parent));
        _push(`<span class="text-parchment/70">Barrel</span></div><span class="text-parchment font-medium">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.calculatedBarrelCost))}</span></div><div class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-package",
          class: "text-parchment/50 w-4 h-4"
        }, null, _parent));
        _push(`<span class="text-parchment/70">Bottling Materials</span></div><span class="text-parchment font-medium">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.calculatedBottlingCost))}</span></div></div>`);
        _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
        _push(`<div class="space-y-2"><div class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-landmark",
          class: "text-parchment/50 w-4 h-4"
        }, null, _parent));
        _push(`<div><span class="text-parchment/70">TTB Federal Excise Tax</span><span class="text-[10px] text-parchment/60 ml-1">($2.70/PG)</span></div></div><span class="text-parchment font-medium">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.calculatedTtbTax))}</span></div><div class="flex justify-between items-center text-sm bg-brown/10 rounded-lg px-3 py-2"><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-map-pin",
          class: "text-parchment/50 w-4 h-4"
        }, null, _parent));
        _push(`<div><span class="text-parchment/70">TABC Texas Excise Tax</span><span class="text-[10px] text-parchment/60 ml-1">($2.40/WG)</span></div></div><span class="text-parchment font-medium">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.calculatedTabcTax))}</span></div></div>`);
        _push(ssrRenderComponent(_component_USeparator, null, null, _parent));
        _push(`<div class="space-y-3">`);
        _push(ssrRenderComponent(_component_UFormField, { label: "Labor Cost" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: __props.localData.costs.labor,
                "onUpdate:modelValue": ($event) => __props.localData.costs.labor = $event,
                type: "number",
                step: "0.01",
                min: "0",
                placeholder: "0.00",
                icon: "i-lucide-hard-hat"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: __props.localData.costs.labor,
                  "onUpdate:modelValue": ($event) => __props.localData.costs.labor = $event,
                  type: "number",
                  step: "0.01",
                  min: "0",
                  placeholder: "0.00",
                  icon: "i-lucide-hard-hat"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { label: "Other Costs" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: __props.localData.costs.other,
                "onUpdate:modelValue": ($event) => __props.localData.costs.other = $event,
                type: "number",
                step: "0.01",
                min: "0",
                placeholder: "0.00",
                icon: "i-lucide-ellipsis"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: __props.localData.costs.other,
                  "onUpdate:modelValue": ($event) => __props.localData.costs.other = $event,
                  type: "number",
                  step: "0.01",
                  min: "0",
                  placeholder: "0.00",
                  icon: "i-lucide-ellipsis"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.currentStep === 4) {
        _push(`<div class="space-y-4"><h3 class="text-sm font-semibold text-parchment/70"> Review Production </h3><div class="${ssrRenderClass([__props.updateInventory ? "border-green-500/20 bg-green-500/5" : "border-amber-500/20 bg-amber-500/5", "flex items-center justify-between rounded-lg border px-3 py-2"])}"><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: __props.updateInventory ? "i-lucide-package-check" : "i-lucide-package-x",
          class: __props.updateInventory ? "text-green-400" : "text-amber-400"
        }, null, _parent));
        _push(`<div><div class="text-sm text-parchment">Update Inventory</div><div class="text-[10px] text-parchment/50">${ssrInterpolate(__props.updateInventory ? "Bottle stock will be increased and materials decreased" : "No inventory changes — use for recording historical productions")}</div></div></div>`);
        _push(ssrRenderComponent(_component_USwitch, {
          "model-value": __props.updateInventory,
          "onUpdate:modelValue": ($event) => emit("update:updateInventory", $event)
        }, null, _parent));
        _push(`</div><div class="bg-brown/10 rounded-lg border border-brown/20 p-4 space-y-3"><div class="flex justify-between text-sm"><span class="text-parchment/50">Date</span><span class="text-parchment">${ssrInterpolate(__props.localData.date ? new Date(__props.localData.date).toLocaleDateString() : "Not set")}</span></div><div class="flex justify-between text-sm"><span class="text-parchment/50">Vessels</span><span class="text-parchment">${ssrInterpolate(__props.selectedVesselDetails.map((v) => v.name).join(", ") || "None")}</span></div><div class="flex justify-between text-sm"><span class="text-parchment/50">Bottle</span><span class="text-parchment">${ssrInterpolate(__props.selectedBottleName || "None")}</span></div><div class="flex justify-between text-sm"><span class="text-parchment/50">Quantity</span><span class="text-parchment">${ssrInterpolate(__props.localData.quantity)}</span></div><div class="border-t border-brown/20 pt-3 space-y-2"><div class="text-xs font-semibold text-parchment/60 uppercase tracking-wide mb-1"> Cost Breakdown </div><!--[-->`);
        ssrRenderList(__props.costBreakdownLines, (line) => {
          _push(`<!--[-->`);
          if (line.value > 0) {
            _push(`<div class="flex justify-between text-sm"><span class="text-parchment/50">${ssrInterpolate(line.label)}</span><span class="text-parchment">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(line.value))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--><div class="border-t border-brown/20 pt-2 mt-2"><div class="flex justify-between text-sm"><span class="text-parchment/50 font-semibold">Total Production Cost</span><span class="text-parchment font-bold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.totalProductionCost))}</span></div><div class="flex justify-between text-sm mt-1"><span class="text-parchment/50">Cost Per Bottle</span><span class="text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.perBottleCost))}</span></div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Production/ProductionWizard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_10 = Object.assign(_sfc_main$1, { __name: "ProductionWizard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelProduction",
  __ssrInlineRender: true,
  props: {
    prefill: { default: void 0 }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const editSchema = yup.object({
      date: yup.string().required("Date is required"),
      bottle: yup.string().required("Bottle is required"),
      quantity: yup.number().positive("Must be positive").required("Quantity is required")
    });
    const props = __props;
    const emit = __emit;
    const productionsStore = useProductionStore();
    const vesselStore = useVesselStore();
    const bottleStore = useBottleStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const linkedBatchId = ref(props.prefill?.batchId || "");
    const isBatchLinked = computed(() => !!linkedBatchId.value);
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => productionsStore.production,
      async onSave(data) {
        const isNewProduction = !data._id;
        data.costs = {
          batch: calculatedBatchCost.value,
          barrel: calculatedBarrelCost.value,
          bottling: calculatedBottlingCost.value,
          labor: localData.value.costs?.labor || 0,
          ttbTax: calculatedTtbTax.value,
          tabcTax: calculatedTabcTax.value,
          other: localData.value.costs?.other || 0
        };
        data.productionCost = totalProductionCost.value;
        data.bottleCost = data.quantity > 0 ? totalProductionCost.value / data.quantity : 0;
        Object.assign(productionsStore.production, data);
        await productionsStore.updateProduction();
        if (isNewProduction && updateInventory.value) {
          await productionsStore.adjustInventoryForProduction({
            quantity: data.quantity,
            bottle: data.bottle,
            bottling: data.bottling
          });
        }
      },
      onClose: () => emit("close", true)
    });
    if (!localData.value.costs) {
      localData.value.costs = {
        batch: 0,
        barrel: 0,
        bottling: 0,
        labor: 0,
        ttbTax: 0,
        tabcTax: 0,
        other: 0
      };
    }
    const isNew = !localData.value._id;
    const currentStep = ref(1);
    const updateInventory = ref(true);
    const {
      calculatedBatchCost,
      calculatedBarrelCost,
      calculatedBottlingCost,
      calculatedTtbTax,
      calculatedTabcTax,
      totalProductionCost,
      perBottleCost,
      costBreakdownLines,
      vesselLabels,
      selectedVesselDetails
    } = useProductionCosts({
      localData,
      vesselStore,
      bottleStore,
      batchStore,
      recipeStore,
      linkedBatchId
    });
    const canProceed = computed(() => {
      switch (currentStep.value) {
        case 1:
          return localData.value.vessel?.length > 0;
        case 2:
          return !!localData.value.bottle && localData.value.quantity > 0;
        default:
          return true;
      }
    });
    const selectedBottleName = computed(
      () => localData.value.bottle ? bottleStore.getBottleById(localData.value.bottle)?.name : ""
    );
    const linkedBatchRecipeName = computed(() => {
      if (!linkedBatchId.value) return "";
      return batchStore.getRecipeNameByBatchId(linkedBatchId.value) || "Batch";
    });
    const wizardSave = async () => {
      if (linkedBatchId.value && !localData.value._id) {
        saving.value = true;
        try {
          const data = localData.value;
          data.costs = {
            batch: calculatedBatchCost.value,
            barrel: calculatedBarrelCost.value,
            bottling: calculatedBottlingCost.value,
            labor: data.costs?.labor || 0,
            ttbTax: calculatedTtbTax.value,
            tabcTax: calculatedTabcTax.value,
            other: data.costs?.other || 0
          };
          data.productionCost = totalProductionCost.value;
          data.bottleCost = data.quantity > 0 ? totalProductionCost.value / data.quantity : 0;
          Object.assign(productionsStore.production, data);
          const newId = await productionsStore.createAndReturnId(data);
          if (newId) {
            if (updateInventory.value) {
              await productionsStore.adjustInventoryForProduction({
                quantity: data.quantity,
                bottle: data.bottle,
                bottling: data.bottling
              });
            }
            if (data.vessel?.length > 0) {
              for (const vesselId of data.vessel) {
                const vessel = vesselStore.getVesselById(vesselId);
                if (vessel) {
                  vessel.contents = (vessel.contents || []).filter(
                    (c) => c.batch !== linkedBatchId.value
                  );
                  vesselStore.vessel = vessel;
                  await vesselStore.updateVessel();
                }
              }
            }
            await batchStore.updateStageData(linkedBatchId.value, "Bottled", {
              productionRecord: newId
            }, "Linked production record");
            emit("close", newId);
          }
        } finally {
          saving.value = false;
        }
        return;
      }
      await save();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$3;
      const _component_UButton = _sfc_main$8;
      const _component_UIcon = _sfc_main$e;
      const _component_UForm = _sfc_main$4;
      const _component_UFormField = _sfc_main$5;
      const _component_SiteDatePicker = _sfc_main$6;
      const _component_USelectMenu = _sfc_main$7;
      const _component_BaseItemSelect = __nuxt_component_8;
      const _component_UInput = _sfc_main$9;
      const _component_ProductionCostBreakdown = __nuxt_component_9;
      const _component_ProductionWizard = __nuxt_component_10;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(unref(isBatchLinked) && isNew ? "Record Bottling Run" : isNew ? "New Production" : "Edit Production")}</h2>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-x",
              color: "neutral",
              variant: "ghost",
              onClick: unref(cancel)
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            if (isNew) {
              _push2(`<div class="px-4 py-3 border-b border-white/5"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><!--[-->`);
              ssrRenderList(4, (step) => {
                _push2(`<!--[--><div class="${ssrRenderClass([unref(currentStep) === step ? "bg-gold text-charcoal" : unref(currentStep) > step ? "bg-gold/30 text-gold" : "bg-brown/20 text-parchment/50", "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors"])}"${_scopeId}>${ssrInterpolate(step)}</div>`);
                if (step < 4) {
                  _push2(`<div class="${ssrRenderClass([unref(currentStep) > step ? "bg-gold/30" : "bg-brown/20", "flex-1 h-0.5 rounded-full"])}"${_scopeId}></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<!--]-->`);
              });
              _push2(`<!--]--></div><div class="flex justify-between mt-1"${_scopeId}><span class="text-[10px] text-parchment/60"${_scopeId}>Source</span><span class="text-[10px] text-parchment/60"${_scopeId}>Product</span><span class="text-[10px] text-parchment/60"${_scopeId}>Costs</span><span class="text-[10px] text-parchment/60"${_scopeId}>Review</span></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(isBatchLinked) && isNew) {
              _push2(`<div class="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-link",
                class: "text-green-400 shrink-0"
              }, null, _parent2, _scopeId));
              _push2(`<span class="text-xs text-parchment/70"${_scopeId}> Recording bottling run for <span class="font-semibold text-green-400"${_scopeId}>${ssrInterpolate(unref(linkedBatchRecipeName))}</span> — this production will be linked to the batch automatically. </span></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (!isNew) {
              _push2(ssrRenderComponent(_component_UForm, {
                schema: unref(editSchema),
                state: unref(localData),
                onSubmit: unref(save),
                class: "flex flex-col flex-1 min-h-0"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="flex-1 overflow-y-auto p-4 space-y-4"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_UFormField, {
                      label: "Production Date",
                      name: "date"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_SiteDatePicker, {
                            modelValue: unref(localData).date,
                            "onUpdate:modelValue": ($event) => unref(localData).date = $event
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_SiteDatePicker, {
                              modelValue: unref(localData).date,
                              "onUpdate:modelValue": ($event) => unref(localData).date = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Vessels" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_USelectMenu, {
                            modelValue: unref(localData).vessel,
                            "onUpdate:modelValue": ($event) => unref(localData).vessel = $event,
                            items: unref(vesselLabels),
                            "label-key": "name",
                            "value-key": "_id",
                            multiple: "",
                            searchable: ""
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).vessel,
                              "onUpdate:modelValue": ($event) => unref(localData).vessel = $event,
                              items: unref(vesselLabels),
                              "label-key": "name",
                              "value-key": "_id",
                              multiple: "",
                              searchable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UFormField, {
                      label: "Bottle",
                      name: "bottle"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_USelectMenu, {
                            modelValue: unref(localData).bottle,
                            "onUpdate:modelValue": ($event) => unref(localData).bottle = $event,
                            items: unref(bottleStore).bottles,
                            "label-key": "name",
                            "value-key": "_id",
                            searchable: ""
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).bottle,
                              "onUpdate:modelValue": ($event) => unref(localData).bottle = $event,
                              items: unref(bottleStore).bottles,
                              "label-key": "name",
                              "value-key": "_id",
                              searchable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Glassware" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_BaseItemSelect, {
                            modelValue: unref(localData).bottling.glassware,
                            "onUpdate:modelValue": ($event) => unref(localData).bottling.glassware = $event,
                            "filter-by-type": "glass bottle",
                            "create-type": "glass bottle",
                            "create-category": "Bottling"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_BaseItemSelect, {
                              modelValue: unref(localData).bottling.glassware,
                              "onUpdate:modelValue": ($event) => unref(localData).bottling.glassware = $event,
                              "filter-by-type": "glass bottle",
                              "create-type": "glass bottle",
                              "create-category": "Bottling"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Cap" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_BaseItemSelect, {
                            modelValue: unref(localData).bottling.cap,
                            "onUpdate:modelValue": ($event) => unref(localData).bottling.cap = $event,
                            "filter-by-type": "bottle cap",
                            "create-type": "bottle cap",
                            "create-category": "Bottling"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_BaseItemSelect, {
                              modelValue: unref(localData).bottling.cap,
                              "onUpdate:modelValue": ($event) => unref(localData).bottling.cap = $event,
                              "filter-by-type": "bottle cap",
                              "create-type": "bottle cap",
                              "create-category": "Bottling"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Label" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_BaseItemSelect, {
                            modelValue: unref(localData).bottling.label,
                            "onUpdate:modelValue": ($event) => unref(localData).bottling.label = $event,
                            "filter-by-type": "label",
                            "create-type": "label",
                            "create-category": "Bottling"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_BaseItemSelect, {
                              modelValue: unref(localData).bottling.label,
                              "onUpdate:modelValue": ($event) => unref(localData).bottling.label = $event,
                              "filter-by-type": "label",
                              "create-type": "label",
                              "create-category": "Bottling"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UFormField, {
                      label: "Quantity",
                      name: "quantity"
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_UInput, {
                            modelValue: unref(localData).quantity,
                            "onUpdate:modelValue": ($event) => unref(localData).quantity = $event,
                            type: "number"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).quantity,
                              "onUpdate:modelValue": ($event) => unref(localData).quantity = $event,
                              type: "number"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_ProductionCostBreakdown, {
                      "local-data": unref(localData),
                      "calculated-batch-cost": unref(calculatedBatchCost),
                      "calculated-barrel-cost": unref(calculatedBarrelCost),
                      "calculated-bottling-cost": unref(calculatedBottlingCost),
                      "calculated-ttb-tax": unref(calculatedTtbTax),
                      "calculated-tabc-tax": unref(calculatedTabcTax),
                      "total-production-cost": unref(totalProductionCost),
                      "per-bottle-cost": unref(perBottleCost)
                    }, null, _parent3, _scopeId2));
                    _push3(`</div><div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_UButton, {
                      color: "neutral",
                      variant: "outline",
                      onClick: unref(cancel)
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Cancel`);
                        } else {
                          return [
                            createTextVNode("Cancel")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UButton, {
                      type: "submit",
                      loading: unref(saving),
                      disabled: !unref(isDirty)
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`Save`);
                        } else {
                          return [
                            createTextVNode("Save")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", { class: "flex-1 overflow-y-auto p-4 space-y-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Production Date",
                          name: "date"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_SiteDatePicker, {
                              modelValue: unref(localData).date,
                              "onUpdate:modelValue": ($event) => unref(localData).date = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Vessels" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).vessel,
                              "onUpdate:modelValue": ($event) => unref(localData).vessel = $event,
                              items: unref(vesselLabels),
                              "label-key": "name",
                              "value-key": "_id",
                              multiple: "",
                              searchable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Bottle",
                          name: "bottle"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).bottle,
                              "onUpdate:modelValue": ($event) => unref(localData).bottle = $event,
                              items: unref(bottleStore).bottles,
                              "label-key": "name",
                              "value-key": "_id",
                              searchable: ""
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Glassware" }, {
                          default: withCtx(() => [
                            createVNode(_component_BaseItemSelect, {
                              modelValue: unref(localData).bottling.glassware,
                              "onUpdate:modelValue": ($event) => unref(localData).bottling.glassware = $event,
                              "filter-by-type": "glass bottle",
                              "create-type": "glass bottle",
                              "create-category": "Bottling"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Cap" }, {
                          default: withCtx(() => [
                            createVNode(_component_BaseItemSelect, {
                              modelValue: unref(localData).bottling.cap,
                              "onUpdate:modelValue": ($event) => unref(localData).bottling.cap = $event,
                              "filter-by-type": "bottle cap",
                              "create-type": "bottle cap",
                              "create-category": "Bottling"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Label" }, {
                          default: withCtx(() => [
                            createVNode(_component_BaseItemSelect, {
                              modelValue: unref(localData).bottling.label,
                              "onUpdate:modelValue": ($event) => unref(localData).bottling.label = $event,
                              "filter-by-type": "label",
                              "create-type": "label",
                              "create-category": "Bottling"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Quantity",
                          name: "quantity"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).quantity,
                              "onUpdate:modelValue": ($event) => unref(localData).quantity = $event,
                              type: "number"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_ProductionCostBreakdown, {
                          "local-data": unref(localData),
                          "calculated-batch-cost": unref(calculatedBatchCost),
                          "calculated-barrel-cost": unref(calculatedBarrelCost),
                          "calculated-bottling-cost": unref(calculatedBottlingCost),
                          "calculated-ttb-tax": unref(calculatedTtbTax),
                          "calculated-tabc-tax": unref(calculatedTabcTax),
                          "total-production-cost": unref(totalProductionCost),
                          "per-bottle-cost": unref(perBottleCost)
                        }, null, 8, ["local-data", "calculated-batch-cost", "calculated-barrel-cost", "calculated-bottling-cost", "calculated-ttb-tax", "calculated-tabc-tax", "total-production-cost", "per-bottle-cost"])
                      ]),
                      createVNode("div", { class: "flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10" }, [
                        createVNode(_component_UButton, {
                          color: "neutral",
                          variant: "outline",
                          onClick: unref(cancel)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Cancel")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(_component_UButton, {
                          type: "submit",
                          loading: unref(saving),
                          disabled: !unref(isDirty)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Save")
                          ]),
                          _: 1
                        }, 8, ["loading", "disabled"])
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!--[--><div class="flex-1 overflow-y-auto p-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_ProductionWizard, {
                "current-step": unref(currentStep),
                "local-data": unref(localData),
                "vessel-labels": unref(vesselLabels),
                "selected-vessel-details": unref(selectedVesselDetails),
                "cost-breakdown-lines": unref(costBreakdownLines),
                "calculated-batch-cost": unref(calculatedBatchCost),
                "calculated-barrel-cost": unref(calculatedBarrelCost),
                "calculated-bottling-cost": unref(calculatedBottlingCost),
                "calculated-ttb-tax": unref(calculatedTtbTax),
                "calculated-tabc-tax": unref(calculatedTabcTax),
                "total-production-cost": unref(totalProductionCost),
                "per-bottle-cost": unref(perBottleCost),
                "update-inventory": unref(updateInventory),
                "selected-bottle-name": unref(selectedBottleName),
                "onUpdate:updateInventory": ($event) => updateInventory.value = $event
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UButton, {
                color: "neutral",
                variant: "outline",
                onClick: unref(cancel)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Cancel`);
                  } else {
                    return [
                      createTextVNode("Cancel")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(currentStep) > 1) {
                _push2(ssrRenderComponent(_component_UButton, {
                  variant: "outline",
                  onClick: ($event) => currentStep.value--
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Back`);
                    } else {
                      return [
                        createTextVNode("Back")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(currentStep) < 4) {
                _push2(ssrRenderComponent(_component_UButton, {
                  onClick: ($event) => currentStep.value++,
                  disabled: !unref(canProceed)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Next`);
                    } else {
                      return [
                        createTextVNode("Next")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(currentStep) === 4) {
                _push2(ssrRenderComponent(_component_UButton, {
                  onClick: wizardSave,
                  loading: unref(saving)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Create`);
                    } else {
                      return [
                        createTextVNode("Create")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><!--]-->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col h-full w-full sm:max-w-lg" }, [
                createVNode("div", { class: "flex items-center justify-between px-4 py-3 border-b border-white/10" }, [
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(unref(isBatchLinked) && isNew ? "Record Bottling Run" : isNew ? "New Production" : "Edit Production"), 1),
                  createVNode(_component_UButton, {
                    icon: "i-lucide-x",
                    color: "neutral",
                    variant: "ghost",
                    onClick: unref(cancel)
                  }, null, 8, ["onClick"])
                ]),
                isNew ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "px-4 py-3 border-b border-white/5"
                }, [
                  createVNode("div", { class: "flex items-center gap-2" }, [
                    (openBlock(), createBlock(Fragment, null, renderList(4, (step) => {
                      return openBlock(), createBlock(Fragment, { key: step }, [
                        createVNode("div", {
                          class: ["flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors", unref(currentStep) === step ? "bg-gold text-charcoal" : unref(currentStep) > step ? "bg-gold/30 text-gold" : "bg-brown/20 text-parchment/50"]
                        }, toDisplayString(step), 3),
                        step < 4 ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: ["flex-1 h-0.5 rounded-full", unref(currentStep) > step ? "bg-gold/30" : "bg-brown/20"]
                        }, null, 2)) : createCommentVNode("", true)
                      ], 64);
                    }), 64))
                  ]),
                  createVNode("div", { class: "flex justify-between mt-1" }, [
                    createVNode("span", { class: "text-[10px] text-parchment/60" }, "Source"),
                    createVNode("span", { class: "text-[10px] text-parchment/60" }, "Product"),
                    createVNode("span", { class: "text-[10px] text-parchment/60" }, "Costs"),
                    createVNode("span", { class: "text-[10px] text-parchment/60" }, "Review")
                  ])
                ])) : createCommentVNode("", true),
                unref(isBatchLinked) && isNew ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "mx-4 mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"
                }, [
                  createVNode(_component_UIcon, {
                    name: "i-lucide-link",
                    class: "text-green-400 shrink-0"
                  }),
                  createVNode("span", { class: "text-xs text-parchment/70" }, [
                    createTextVNode(" Recording bottling run for "),
                    createVNode("span", { class: "font-semibold text-green-400" }, toDisplayString(unref(linkedBatchRecipeName)), 1),
                    createTextVNode(" — this production will be linked to the batch automatically. ")
                  ])
                ])) : createCommentVNode("", true),
                !isNew ? (openBlock(), createBlock(_component_UForm, {
                  key: 2,
                  schema: unref(editSchema),
                  state: unref(localData),
                  onSubmit: unref(save),
                  class: "flex flex-col flex-1 min-h-0"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "flex-1 overflow-y-auto p-4 space-y-4" }, [
                      createVNode(_component_UFormField, {
                        label: "Production Date",
                        name: "date"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_SiteDatePicker, {
                            modelValue: unref(localData).date,
                            "onUpdate:modelValue": ($event) => unref(localData).date = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Vessels" }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).vessel,
                            "onUpdate:modelValue": ($event) => unref(localData).vessel = $event,
                            items: unref(vesselLabels),
                            "label-key": "name",
                            "value-key": "_id",
                            multiple: "",
                            searchable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Bottle",
                        name: "bottle"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).bottle,
                            "onUpdate:modelValue": ($event) => unref(localData).bottle = $event,
                            items: unref(bottleStore).bottles,
                            "label-key": "name",
                            "value-key": "_id",
                            searchable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Glassware" }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseItemSelect, {
                            modelValue: unref(localData).bottling.glassware,
                            "onUpdate:modelValue": ($event) => unref(localData).bottling.glassware = $event,
                            "filter-by-type": "glass bottle",
                            "create-type": "glass bottle",
                            "create-category": "Bottling"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Cap" }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseItemSelect, {
                            modelValue: unref(localData).bottling.cap,
                            "onUpdate:modelValue": ($event) => unref(localData).bottling.cap = $event,
                            "filter-by-type": "bottle cap",
                            "create-type": "bottle cap",
                            "create-category": "Bottling"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Label" }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseItemSelect, {
                            modelValue: unref(localData).bottling.label,
                            "onUpdate:modelValue": ($event) => unref(localData).bottling.label = $event,
                            "filter-by-type": "label",
                            "create-type": "label",
                            "create-category": "Bottling"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Quantity",
                        name: "quantity"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).quantity,
                            "onUpdate:modelValue": ($event) => unref(localData).quantity = $event,
                            type: "number"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_ProductionCostBreakdown, {
                        "local-data": unref(localData),
                        "calculated-batch-cost": unref(calculatedBatchCost),
                        "calculated-barrel-cost": unref(calculatedBarrelCost),
                        "calculated-bottling-cost": unref(calculatedBottlingCost),
                        "calculated-ttb-tax": unref(calculatedTtbTax),
                        "calculated-tabc-tax": unref(calculatedTabcTax),
                        "total-production-cost": unref(totalProductionCost),
                        "per-bottle-cost": unref(perBottleCost)
                      }, null, 8, ["local-data", "calculated-batch-cost", "calculated-barrel-cost", "calculated-bottling-cost", "calculated-ttb-tax", "calculated-tabc-tax", "total-production-cost", "per-bottle-cost"])
                    ]),
                    createVNode("div", { class: "flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10" }, [
                      createVNode(_component_UButton, {
                        color: "neutral",
                        variant: "outline",
                        onClick: unref(cancel)
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Cancel")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_UButton, {
                        type: "submit",
                        loading: unref(saving),
                        disabled: !unref(isDirty)
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Save")
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled"])
                    ])
                  ]),
                  _: 1
                }, 8, ["schema", "state", "onSubmit"])) : (openBlock(), createBlock(Fragment, { key: 3 }, [
                  createVNode("div", { class: "flex-1 overflow-y-auto p-4" }, [
                    createVNode(_component_ProductionWizard, {
                      "current-step": unref(currentStep),
                      "local-data": unref(localData),
                      "vessel-labels": unref(vesselLabels),
                      "selected-vessel-details": unref(selectedVesselDetails),
                      "cost-breakdown-lines": unref(costBreakdownLines),
                      "calculated-batch-cost": unref(calculatedBatchCost),
                      "calculated-barrel-cost": unref(calculatedBarrelCost),
                      "calculated-bottling-cost": unref(calculatedBottlingCost),
                      "calculated-ttb-tax": unref(calculatedTtbTax),
                      "calculated-tabc-tax": unref(calculatedTabcTax),
                      "total-production-cost": unref(totalProductionCost),
                      "per-bottle-cost": unref(perBottleCost),
                      "update-inventory": unref(updateInventory),
                      "selected-bottle-name": unref(selectedBottleName),
                      "onUpdate:updateInventory": ($event) => updateInventory.value = $event
                    }, null, 8, ["current-step", "local-data", "vessel-labels", "selected-vessel-details", "cost-breakdown-lines", "calculated-batch-cost", "calculated-barrel-cost", "calculated-bottling-cost", "calculated-ttb-tax", "calculated-tabc-tax", "total-production-cost", "per-bottle-cost", "update-inventory", "selected-bottle-name", "onUpdate:updateInventory"])
                  ]),
                  createVNode("div", { class: "flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10" }, [
                    createVNode(_component_UButton, {
                      color: "neutral",
                      variant: "outline",
                      onClick: unref(cancel)
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Cancel")
                      ]),
                      _: 1
                    }, 8, ["onClick"]),
                    unref(currentStep) > 1 ? (openBlock(), createBlock(_component_UButton, {
                      key: 0,
                      variant: "outline",
                      onClick: ($event) => currentStep.value--
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Back")
                      ]),
                      _: 1
                    }, 8, ["onClick"])) : createCommentVNode("", true),
                    unref(currentStep) < 4 ? (openBlock(), createBlock(_component_UButton, {
                      key: 1,
                      onClick: ($event) => currentStep.value++,
                      disabled: !unref(canProceed)
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Next")
                      ]),
                      _: 1
                    }, 8, ["onClick", "disabled"])) : createCommentVNode("", true),
                    unref(currentStep) === 4 ? (openBlock(), createBlock(_component_UButton, {
                      key: 2,
                      onClick: wizardSave,
                      loading: unref(saving)
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Create")
                      ]),
                      _: 1
                    }, 8, ["loading"])) : createCommentVNode("", true)
                  ])
                ], 64))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelProduction.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main, { __name: "PanelProduction" });

export { __nuxt_component_1 as default };
//# sourceMappingURL=PanelProduction-Bh5tM8Ym.mjs.map

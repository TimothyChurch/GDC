import { g as useOverlay, e as _sfc_main$8$1, f as _sfc_main$e, c as __nuxt_component_1$1, m as useToast } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, isRef, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { _ as __nuxt_component_1 } from './BatchRecipeLegend-DPlKPDfc.mjs';
import { _ as _sfc_main$a } from './Modal-GBrZNdlF.mjs';
import { _ as _sfc_main$b } from './Input-Fd8Vd_4J.mjs';
import { A as ALL_STAGES, c as STAGE_DISPLAY, d as getStageVolume, s as stageBgColor, e as stageTextColor } from './batchPipeline-br9pdPdU.mjs';
import { g as getBatchBorderClass } from './useRecipeColors-C1dzeggx.mjs';
import { a as useBatchStore, u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { b as usePurchaseOrderStore, u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { L as LazyPanelBatch } from './PanelBatch-C1RtjSaY.mjs';
import { L as LazyPanelProduction } from './PanelProduction-CicAwPD9.mjs';
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
import 'reka-ui';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './useCrudStore-CgiT9u6L.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "DashboardStatCard",
  __ssrInlineRender: true,
  props: {
    title: {},
    value: {},
    subtitle: {},
    icon: {},
    trend: {},
    trendUp: { type: Boolean },
    color: {},
    to: {}
  },
  setup(__props) {
    const colorClasses = {
      gold: "bg-gold/10 text-gold border-gold/20",
      copper: "bg-copper/10 text-copper border-copper/20",
      amber: "bg-amber/10 text-amber border-amber/20",
      green: "bg-green-500/10 text-green-400 border-green-500/20",
      red: "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      if (__props.to) {
        _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
          to: __props.to,
          class: "bg-charcoal rounded-xl border border-brown/30 p-5 flex items-start gap-4 hover:border-gold/50 transition-all duration-200 cursor-pointer group"
        }, _attrs), {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="${ssrRenderClass([
                "shrink-0 w-11 h-11 rounded-lg flex items-center justify-center border transition-colors duration-200",
                colorClasses[__props.color || "gold"]
              ])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: __props.icon,
                class: "text-xl"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="flex flex-col min-w-0"${_scopeId}><span class="text-xs font-medium uppercase tracking-wider text-parchment/60 group-hover:text-parchment/80 transition-colors duration-200"${_scopeId}>${ssrInterpolate(__props.title)}</span><span class="text-2xl font-bold text-parchment mt-0.5 font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(__props.value)}</span>`);
              if (__props.subtitle || __props.trend) {
                _push2(`<div class="flex items-center gap-2 mt-1"${_scopeId}>`);
                if (__props.trend) {
                  _push2(`<span class="${ssrRenderClass([
                    "text-xs font-medium flex items-center gap-0.5",
                    __props.trendUp ? "text-green-400" : "text-red-400"
                  ])}"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: __props.trendUp ? "i-lucide-trending-up" : "i-lucide-trending-down",
                    class: "text-sm"
                  }, null, _parent2, _scopeId));
                  _push2(` ${ssrInterpolate(__props.trend)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (__props.subtitle) {
                  _push2(`<span class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(__props.subtitle)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-chevron-right",
                class: "text-parchment/0 group-hover:text-parchment/60 transition-all duration-200 ml-auto shrink-0 self-center"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode("div", {
                  class: [
                    "shrink-0 w-11 h-11 rounded-lg flex items-center justify-center border transition-colors duration-200",
                    colorClasses[__props.color || "gold"]
                  ]
                }, [
                  createVNode(_component_UIcon, {
                    name: __props.icon,
                    class: "text-xl"
                  }, null, 8, ["name"])
                ], 2),
                createVNode("div", { class: "flex flex-col min-w-0" }, [
                  createVNode("span", { class: "text-xs font-medium uppercase tracking-wider text-parchment/60 group-hover:text-parchment/80 transition-colors duration-200" }, toDisplayString(__props.title), 1),
                  createVNode("span", { class: "text-2xl font-bold text-parchment mt-0.5 font-[Cormorant_Garamond]" }, toDisplayString(__props.value), 1),
                  __props.subtitle || __props.trend ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex items-center gap-2 mt-1"
                  }, [
                    __props.trend ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: [
                        "text-xs font-medium flex items-center gap-0.5",
                        __props.trendUp ? "text-green-400" : "text-red-400"
                      ]
                    }, [
                      createVNode(_component_UIcon, {
                        name: __props.trendUp ? "i-lucide-trending-up" : "i-lucide-trending-down",
                        class: "text-sm"
                      }, null, 8, ["name"]),
                      createTextVNode(" " + toDisplayString(__props.trend), 1)
                    ], 2)) : createCommentVNode("", true),
                    __props.subtitle ? (openBlock(), createBlock("span", {
                      key: 1,
                      class: "text-xs text-parchment/60"
                    }, toDisplayString(__props.subtitle), 1)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true)
                ]),
                createVNode(_component_UIcon, {
                  name: "i-lucide-chevron-right",
                  class: "text-parchment/0 group-hover:text-parchment/60 transition-all duration-200 ml-auto shrink-0 self-center"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5 flex items-start gap-4 hover:border-brown/50 transition-all duration-200" }, _attrs))}><div class="${ssrRenderClass([
          "shrink-0 w-11 h-11 rounded-lg flex items-center justify-center border",
          colorClasses[__props.color || "gold"]
        ])}">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: __props.icon,
          class: "text-xl"
        }, null, _parent));
        _push(`</div><div class="flex flex-col min-w-0"><span class="text-xs font-medium uppercase tracking-wider text-parchment/60">${ssrInterpolate(__props.title)}</span><span class="text-2xl font-bold text-parchment mt-0.5 font-[Cormorant_Garamond]">${ssrInterpolate(__props.value)}</span>`);
        if (__props.subtitle || __props.trend) {
          _push(`<div class="flex items-center gap-2 mt-1">`);
          if (__props.trend) {
            _push(`<span class="${ssrRenderClass([
              "text-xs font-medium flex items-center gap-0.5",
              __props.trendUp ? "text-green-400" : "text-red-400"
            ])}">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: __props.trendUp ? "i-lucide-trending-up" : "i-lucide-trending-down",
              class: "text-sm"
            }, null, _parent));
            _push(` ${ssrInterpolate(__props.trend)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.subtitle) {
            _push(`<span class="text-xs text-parchment/60">${ssrInterpolate(__props.subtitle)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
    };
  }
});
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardStatCard.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$9, { __name: "DashboardStatCard" });
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "DashboardBatchPipeline",
  __ssrInlineRender: true,
  setup(__props) {
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const toast = useToast();
    const stages = computed(() => {
      const result = [];
      for (const stageName of ALL_STAGES) {
        if (stageName === "Bottled") continue;
        const display = STAGE_DISPLAY[stageName];
        const batches = batchStore.getBatchesInStage(stageName);
        const entries = batches.map((b) => ({
          _id: b._id,
          recipe: b.recipe,
          volume: getStageVolume(b, stageName),
          volumeUnit: (b.batchSizeUnit || "gallon").replace(/gallon/i, "gal").replace(/liter/i, "L")
        }));
        if (stageName === "Upcoming" || entries.length > 0) {
          result.push({
            name: stageName,
            icon: display?.icon || "i-lucide-circle",
            color: display?.color || "neutral",
            batches: entries
          });
        }
      }
      return result;
    });
    const totalActiveBatches = computed(() => {
      const ids = /* @__PURE__ */ new Set();
      for (const stage of stages.value) {
        for (const b of stage.batches) {
          ids.add(b._id);
        }
      }
      return ids.size;
    });
    const getRecipeName = (recipeId) => {
      return recipeStore.getRecipeById(recipeId)?.name || "Unknown";
    };
    ref(false);
    ref(null);
    ref(null);
    const dropTargetStage = ref(null);
    const confirmOpen = ref(false);
    const pendingDrop = ref(null);
    const advancing = ref(false);
    const dropVolume = ref(0);
    const pendingSourceVolume = computed(() => {
      if (!pendingDrop.value) return 0;
      const batch = batchStore.getBatchById(pendingDrop.value.batchId);
      if (!batch) return 0;
      return getStageVolume(batch, pendingDrop.value.fromStage);
    });
    const pendingVolumeUnit = computed(() => {
      if (!pendingDrop.value) return "gal";
      const batch = batchStore.getBatchById(pendingDrop.value.batchId);
      return (batch?.batchSizeUnit || "gallon").replace(/gallon/i, "gal").replace(/liter/i, "L");
    });
    async function confirmAdvance() {
      if (!pendingDrop.value) return;
      advancing.value = true;
      try {
        const { batchId, fromStage, toStage } = pendingDrop.value;
        if (fromStage === "Upcoming") {
          await batchStore.startFirstStage(batchId, "", dropVolume.value);
        } else {
          await batchStore.advanceToStage(batchId, toStage, void 0, dropVolume.value, fromStage);
        }
        toast.add({
          title: "Batch advanced",
          description: `Transferred ${dropVolume.value} ${pendingVolumeUnit.value} to ${pendingDrop.value.toStage}`,
          color: "success",
          icon: "i-lucide-check-circle"
        });
      } catch (error) {
        toast.add({
          title: "Failed to advance batch",
          description: getErrorMessage(error),
          color: "error",
          icon: "i-lucide-alert-circle"
        });
      } finally {
        advancing.value = false;
        confirmOpen.value = false;
        pendingDrop.value = null;
      }
    }
    function cancelAdvance() {
      confirmOpen.value = false;
      pendingDrop.value = null;
    }
    const pendingBatchName = computed(() => {
      if (!pendingDrop.value) return "";
      const batch = batchStore.getBatchById(pendingDrop.value.batchId);
      return batch ? getRecipeName(batch.recipe) : "Unknown";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      const _component_BatchRecipeLegend = __nuxt_component_1;
      const _component_UModal = _sfc_main$a;
      const _component_UInput = _sfc_main$b;
      const _component_UButton = _sfc_main$8$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-5"><div><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Batch Pipeline</h2><p class="text-xs text-parchment/60 mt-0.5">${ssrInterpolate(unref(totalActiveBatches))} active ${ssrInterpolate(unref(totalActiveBatches) === 1 ? "batch" : "batches")} across all stages <span class="hidden sm:inline text-parchment/25 ml-1">- drag batches to advance</span></p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/batch",
        class: "text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` View All `);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-arrow-right",
              class: "text-sm"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createTextVNode(" View All "),
              createVNode(_component_UIcon, {
                name: "i-lucide-arrow-right",
                class: "text-sm"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_BatchRecipeLegend, null, null, _parent));
      _push(`<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"><!--[-->`);
      ssrRenderList(unref(stages), (stage) => {
        _push(`<div class="${ssrRenderClass([
          "rounded-lg border p-4 transition-all duration-200",
          unref(dropTargetStage) === stage.name ? "ring-2 ring-gold/50 border-gold/40 bg-gold/5 scale-[1.02]" : stage.batches.length > 0 ? `${unref(stageBgColor)(stage.color)} hover:scale-[1.02]` : "bg-brown/10 border-brown/20"
        ])}"><div class="flex items-center gap-2 mb-3">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: stage.icon,
          class: [
            "text-lg",
            stage.batches.length > 0 ? unref(stageTextColor)(stage.color) : "text-parchment/50"
          ]
        }, null, _parent));
        _push(`<span class="text-xs font-semibold uppercase tracking-wider text-parchment/50">${ssrInterpolate(stage.name)}</span></div><div class="${ssrRenderClass([
          "text-3xl font-bold font-[Cormorant_Garamond] mb-2",
          stage.batches.length > 0 ? "text-parchment" : "text-parchment/20"
        ])}">${ssrInterpolate(stage.batches.length)}</div>`);
        if (stage.batches.length > 0) {
          _push(`<div class="flex flex-col gap-1.5"><!--[-->`);
          ssrRenderList(stage.batches.slice(0, 3), (entry) => {
            _push(`<div class="${ssrRenderClass(["flex items-center gap-1.5 cursor-grab active:cursor-grabbing rounded-r px-1 py-0.5 -mx-1 hover:bg-brown/20 hover:text-gold transition-colors border-l-4", unref(getBatchBorderClass)(entry._id)])}" draggable="true"><div class="${ssrRenderClass(["w-1.5 h-1.5 rounded-full shrink-0", `bg-${stage.color === "copper" ? "copper" : stage.color + "-400"}`])}"></div><span class="text-xs text-parchment/60 truncate hover:text-gold transition-colors">${ssrInterpolate(getRecipeName(entry.recipe))} `);
            if (entry.volume) {
              _push(`<span class="text-parchment/60">(${ssrInterpolate(entry.volume)}${ssrInterpolate(entry.volumeUnit)})</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</span></div>`);
          });
          _push(`<!--]-->`);
          if (stage.batches.length > 3) {
            _push(`<span class="text-[10px] text-parchment/50 pl-3"> +${ssrInterpolate(stage.batches.length - 3)} more </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="text-xs text-parchment/20"> No batches </div>`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      _push(ssrRenderComponent(_component_UModal, {
        open: unref(confirmOpen),
        "onUpdate:open": ($event) => isRef(confirmOpen) ? confirmOpen.value = $event : null
      }, {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-5 space-y-4"${_scopeId}><div class="flex items-center gap-3"${_scopeId}><div class="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-arrow-right",
              class: "text-xl text-gold"
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><h3 class="text-base font-semibold text-parchment"${_scopeId}>Transfer Batch</h3><p class="text-sm text-parchment/50"${_scopeId}> Move <span class="text-parchment font-medium"${_scopeId}>${ssrInterpolate(unref(pendingBatchName))}</span> from <span class="text-parchment/70"${_scopeId}>${ssrInterpolate(unref(pendingDrop)?.fromStage)}</span> to <span class="text-gold font-medium"${_scopeId}>${ssrInterpolate(unref(pendingDrop)?.toStage)}</span></p></div></div><div${_scopeId}><div class="text-xs text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Transfer Volume</div><div class="flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UInput, {
              modelValue: unref(dropVolume),
              "onUpdate:modelValue": ($event) => isRef(dropVolume) ? dropVolume.value = $event : null,
              modelModifiers: { number: true },
              type: "number",
              min: 1,
              max: unref(pendingSourceVolume),
              class: "flex-1"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-sm text-parchment/60 whitespace-nowrap"${_scopeId}> of ${ssrInterpolate(unref(pendingSourceVolume))} ${ssrInterpolate(unref(pendingVolumeUnit))}</span>`);
            _push2(ssrRenderComponent(_component_UButton, {
              size: "xs",
              variant: "outline",
              color: "neutral",
              onClick: ($event) => dropVolume.value = unref(pendingSourceVolume)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Max `);
                } else {
                  return [
                    createTextVNode(" Max ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div><div class="flex justify-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "outline",
              color: "neutral",
              onClick: cancelAdvance
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
            _push2(ssrRenderComponent(_component_UButton, {
              onClick: confirmAdvance,
              loading: unref(advancing),
              disabled: unref(dropVolume) <= 0
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Transfer ${ssrInterpolate(unref(dropVolume))} ${ssrInterpolate(unref(pendingVolumeUnit))}`);
                } else {
                  return [
                    createTextVNode(" Transfer " + toDisplayString(unref(dropVolume)) + " " + toDisplayString(unref(pendingVolumeUnit)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-5 space-y-4" }, [
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center" }, [
                    createVNode(_component_UIcon, {
                      name: "i-lucide-arrow-right",
                      class: "text-xl text-gold"
                    })
                  ]),
                  createVNode("div", null, [
                    createVNode("h3", { class: "text-base font-semibold text-parchment" }, "Transfer Batch"),
                    createVNode("p", { class: "text-sm text-parchment/50" }, [
                      createTextVNode(" Move "),
                      createVNode("span", { class: "text-parchment font-medium" }, toDisplayString(unref(pendingBatchName)), 1),
                      createTextVNode(" from "),
                      createVNode("span", { class: "text-parchment/70" }, toDisplayString(unref(pendingDrop)?.fromStage), 1),
                      createTextVNode(" to "),
                      createVNode("span", { class: "text-gold font-medium" }, toDisplayString(unref(pendingDrop)?.toStage), 1)
                    ])
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider mb-2" }, "Transfer Volume"),
                  createVNode("div", { class: "flex items-center gap-2" }, [
                    createVNode(_component_UInput, {
                      modelValue: unref(dropVolume),
                      "onUpdate:modelValue": ($event) => isRef(dropVolume) ? dropVolume.value = $event : null,
                      modelModifiers: { number: true },
                      type: "number",
                      min: 1,
                      max: unref(pendingSourceVolume),
                      class: "flex-1"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "max"]),
                    createVNode("span", { class: "text-sm text-parchment/60 whitespace-nowrap" }, " of " + toDisplayString(unref(pendingSourceVolume)) + " " + toDisplayString(unref(pendingVolumeUnit)), 1),
                    createVNode(_component_UButton, {
                      size: "xs",
                      variant: "outline",
                      color: "neutral",
                      onClick: ($event) => dropVolume.value = unref(pendingSourceVolume)
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Max ")
                      ]),
                      _: 1
                    }, 8, ["onClick"])
                  ])
                ]),
                createVNode("div", { class: "flex justify-end gap-2" }, [
                  createVNode(_component_UButton, {
                    variant: "outline",
                    color: "neutral",
                    onClick: cancelAdvance
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Cancel")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UButton, {
                    onClick: confirmAdvance,
                    loading: unref(advancing),
                    disabled: unref(dropVolume) <= 0
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Transfer " + toDisplayString(unref(dropVolume)) + " " + toDisplayString(unref(pendingVolumeUnit)), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "disabled"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardBatchPipeline.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$8, { __name: "DashboardBatchPipeline" });
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "DashboardActionItems",
  __ssrInlineRender: true,
  setup(__props) {
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const inventoryStore = useInventoryStore();
    const itemStore = useItemStore();
    const actionItems = computed(() => {
      const items = [];
      for (const batch of batchStore.fermentingBatches) {
        const recipeName = recipeStore.getRecipeById(batch.recipe)?.name || "Unknown";
        const fermData = batch.stages?.fermenting;
        const lastReading = fermData?.readings?.length ? fermData.readings[fermData.readings.length - 1] : null;
        if (!lastReading) {
          items.push({
            id: `ferm-check-${batch._id}`,
            title: `Take gravity reading: ${recipeName}`,
            description: "No fermentation readings recorded yet",
            priority: "high",
            icon: "i-lucide-thermometer",
            category: "Fermentation",
            link: `/admin/batch/${batch._id}`
          });
        } else {
          const daysSinceReading = Math.floor(
            (Date.now() - new Date(lastReading.date).getTime()) / (1e3 * 60 * 60 * 24)
          );
          if (daysSinceReading >= 2) {
            items.push({
              id: `ferm-overdue-${batch._id}`,
              title: `Gravity reading overdue: ${recipeName}`,
              description: `Last reading was ${daysSinceReading} days ago`,
              priority: daysSinceReading >= 5 ? "high" : "medium",
              icon: "i-lucide-alert-triangle",
              category: "Fermentation",
              link: `/admin/batch/${batch._id}`
            });
          }
        }
      }
      for (const batch of batchStore.upcomingBatches) {
        const recipeName = recipeStore.getRecipeById(batch.recipe)?.name || "Unknown";
        items.push({
          id: `start-${batch._id}`,
          title: `Start brewing: ${recipeName}`,
          description: `${batch.batchSize} ${batch.batchSizeUnit} batch ready to begin`,
          priority: "medium",
          icon: "i-lucide-play",
          category: "Production",
          link: `/admin/batch/${batch._id}`
        });
      }
      for (const item of itemStore.items) {
        if (!item.reorderPoint || item.reorderPoint <= 0) continue;
        const stock = inventoryStore.getCurrentStock(item._id);
        if (stock <= item.reorderPoint) {
          items.push({
            id: `reorder-${item._id}`,
            title: `Reorder: ${item.name}`,
            description: `Only ${stock} ${item.inventoryUnit || "units"} remaining (reorder point: ${item.reorderPoint})`,
            priority: stock <= 1 ? "high" : "medium",
            icon: "i-lucide-shopping-cart",
            category: "Inventory",
            link: `/admin/items/${item._id}`
          });
        }
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      return items;
    });
    const priorityColor = (priority) => {
      switch (priority) {
        case "high":
          return "border-l-red-500 bg-red-500/5";
        case "medium":
          return "border-l-amber bg-amber/5";
        case "low":
          return "border-l-blue-400 bg-blue-500/5";
        default:
          return "border-l-parchment/20 bg-brown/5";
      }
    };
    const priorityBadge = (priority) => {
      switch (priority) {
        case "high":
          return "bg-red-500/15 text-red-400 border-red-500/20";
        case "medium":
          return "bg-amber/15 text-amber border-amber/20";
        case "low":
          return "bg-blue-500/15 text-blue-400 border-blue-500/20";
        default:
          return "bg-brown/15 text-parchment/60 border-brown/20";
      }
    };
    const priorityIconColor = (priority) => {
      switch (priority) {
        case "high":
          return "text-red-400";
        case "medium":
          return "text-amber";
        case "low":
          return "text-blue-400";
        default:
          return "text-parchment/60";
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_NuxtLink = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Action Items</h2>`);
      if (unref(actionItems).filter((a) => a.priority === "high").length > 0) {
        _push(`<span class="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">${ssrInterpolate(unref(actionItems).filter((a) => a.priority === "high").length)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="flex gap-2 mb-4"><div class="flex items-center gap-1.5 text-xs bg-brown/15 rounded-lg px-2.5 py-1 border border-brown/20"><span class="text-parchment/60">Total:</span><span class="font-medium text-parchment">${ssrInterpolate(unref(actionItems).length)}</span></div>`);
      if (unref(actionItems).filter((a) => a.priority === "high").length > 0) {
        _push(`<div class="flex items-center gap-1.5 text-xs bg-red-500/10 rounded-lg px-2.5 py-1 border border-red-500/20"><div class="w-1.5 h-1.5 rounded-full bg-red-500"></div><span class="text-red-400">${ssrInterpolate(unref(actionItems).filter((a) => a.priority === "high").length)} urgent</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(actionItems).length === 0) {
        _push(`<div class="py-8 text-center">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-check-circle-2",
          class: "text-3xl text-green-400/40 mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">All caught up!</p></div>`);
      } else {
        _push(`<div class="flex flex-col gap-2 max-h-80 overflow-y-auto"><!--[-->`);
        ssrRenderList(unref(actionItems).slice(0, 12), (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: item.id,
            to: item.link || "#",
            class: [
              "flex items-start gap-3 rounded-lg border-l-[3px] border border-brown/15 px-3 py-3 transition-all duration-200 hover:border-brown/30 group",
              priorityColor(item.priority)
            ]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: item.icon,
                  class: ["text-lg shrink-0 mt-0.5", priorityIconColor(item.priority)]
                }, null, _parent2, _scopeId));
                _push2(`<div class="flex-grow min-w-0"${_scopeId}><div class="flex items-start justify-between gap-2"${_scopeId}><span class="text-sm text-parchment group-hover:text-gold transition-colors duration-200 leading-tight"${_scopeId}>${ssrInterpolate(item.title)}</span><span class="${ssrRenderClass([
                  "text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border shrink-0",
                  priorityBadge(item.priority)
                ])}"${_scopeId}>${ssrInterpolate(item.priority)}</span></div><div class="text-xs text-parchment/60 mt-0.5"${_scopeId}>${ssrInterpolate(item.description)}</div><div class="text-[10px] uppercase tracking-wider text-parchment/20 mt-1"${_scopeId}>${ssrInterpolate(item.category)}</div></div>`);
              } else {
                return [
                  createVNode(_component_UIcon, {
                    name: item.icon,
                    class: ["text-lg shrink-0 mt-0.5", priorityIconColor(item.priority)]
                  }, null, 8, ["name", "class"]),
                  createVNode("div", { class: "flex-grow min-w-0" }, [
                    createVNode("div", { class: "flex items-start justify-between gap-2" }, [
                      createVNode("span", { class: "text-sm text-parchment group-hover:text-gold transition-colors duration-200 leading-tight" }, toDisplayString(item.title), 1),
                      createVNode("span", {
                        class: [
                          "text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded border shrink-0",
                          priorityBadge(item.priority)
                        ]
                      }, toDisplayString(item.priority), 3)
                    ]),
                    createVNode("div", { class: "text-xs text-parchment/60 mt-0.5" }, toDisplayString(item.description), 1),
                    createVNode("div", { class: "text-[10px] uppercase tracking-wider text-parchment/20 mt-1" }, toDisplayString(item.category), 1)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
        if (unref(actionItems).length > 12) {
          _push(`<div class="text-xs text-parchment/50 text-center py-1"> +${ssrInterpolate(unref(actionItems).length - 12)} more items </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardActionItems.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$7, { __name: "DashboardActionItems" });
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "DashboardRecentProductions",
  __ssrInlineRender: true,
  setup(__props) {
    const productionStore = useProductionStore();
    const bottleStore = useBottleStore();
    const recentProductions = computed(() => {
      return [...productionStore.productions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
    });
    const totalBottlesProduced = computed(() => {
      return productionStore.productions.reduce((sum, p) => sum + (p.quantity || 0), 0);
    });
    const formatDate = (date) => {
      const d = new Date(date);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Recent Productions</h2><p class="text-xs text-parchment/60 mt-0.5">${ssrInterpolate(unref(totalBottlesProduced).toLocaleString())} total bottles produced </p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/production",
        class: "text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` View All `);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-arrow-right",
              class: "text-sm"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createTextVNode(" View All "),
              createVNode(_component_UIcon, {
                name: "i-lucide-arrow-right",
                class: "text-sm"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(recentProductions).length === 0) {
        _push(`<div class="py-8 text-center">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-package-open",
          class: "text-3xl text-parchment/20 mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">No production records yet</p></div>`);
      } else {
        _push(`<div class="flex flex-col divide-y divide-brown/20"><!--[-->`);
        ssrRenderList(unref(recentProductions), (prod) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: prod._id,
            to: `/admin/production/${prod._id}`,
            class: "flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-brown/10 -mx-2 px-2 rounded-lg transition-all duration-200 cursor-pointer group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center gap-3 min-w-0"${_scopeId}><div class="w-9 h-9 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center shrink-0 group-hover:border-copper/40 transition-colors duration-200"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-wine",
                  class: "text-copper text-sm"
                }, null, _parent2, _scopeId));
                _push2(`</div><div class="min-w-0"${_scopeId}><div class="text-sm font-medium text-parchment truncate group-hover:text-gold transition-colors duration-200"${_scopeId}>${ssrInterpolate(unref(bottleStore).getName(prod.bottle) || "Unknown Bottle")}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(formatDate(prod.date))}</div></div></div><div class="flex items-center gap-2 shrink-0 ml-3"${_scopeId}><span class="text-sm font-semibold text-parchment"${_scopeId}>${ssrInterpolate(prod.quantity)}</span><span class="text-xs text-parchment/60"${_scopeId}>bottles</span></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center gap-3 min-w-0" }, [
                    createVNode("div", { class: "w-9 h-9 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center shrink-0 group-hover:border-copper/40 transition-colors duration-200" }, [
                      createVNode(_component_UIcon, {
                        name: "i-lucide-wine",
                        class: "text-copper text-sm"
                      })
                    ]),
                    createVNode("div", { class: "min-w-0" }, [
                      createVNode("div", { class: "text-sm font-medium text-parchment truncate group-hover:text-gold transition-colors duration-200" }, toDisplayString(unref(bottleStore).getName(prod.bottle) || "Unknown Bottle"), 1),
                      createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(formatDate(prod.date)), 1)
                    ])
                  ]),
                  createVNode("div", { class: "flex items-center gap-2 shrink-0 ml-3" }, [
                    createVNode("span", { class: "text-sm font-semibold text-parchment" }, toDisplayString(prod.quantity), 1),
                    createVNode("span", { class: "text-xs text-parchment/60" }, "bottles")
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardRecentProductions.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$6, { __name: "DashboardRecentProductions" });
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "DashboardVesselOverview",
  __ssrInlineRender: true,
  setup(__props) {
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const vesselGroups = computed(() => [
      {
        title: "Mash Tuns",
        icon: "i-lucide-flame",
        color: "text-orange-400",
        vessels: vesselStore.mashTuns,
        type: "mash-tun"
      },
      {
        title: "Fermenters",
        icon: "i-lucide-beaker",
        color: "text-yellow-400",
        vessels: vesselStore.fermenters,
        type: "fermenter"
      },
      {
        title: "Stills",
        icon: "i-lucide-flask-conical",
        color: "text-copper",
        vessels: vesselStore.stills,
        type: "still"
      },
      {
        title: "Tanks",
        icon: "i-lucide-warehouse",
        color: "text-purple-400",
        vessels: vesselStore.tanks,
        type: "tank"
      }
    ]);
    const filledBarrels = computed(
      () => vesselStore.barrels.filter((b) => b.contents && b.contents.length > 0)
    );
    const emptyBarrels = computed(
      () => vesselStore.barrels.filter((b) => !b.contents || b.contents.length === 0)
    );
    const getContentLabel = (vessel) => {
      if (!vessel.contents || vessel.contents.length === 0) return null;
      const content = vessel.contents[0];
      const batch = batchStore.getBatchById(content.batch);
      const recipeName = batch ? recipeStore.getRecipeById(batch.recipe)?.name : null;
      return recipeName || "Unknown";
    };
    const getVesselVolume = (vessel) => {
      if (!vessel.contents || vessel.contents.length === 0) return null;
      const targetUnit = vessel.stats?.volumeUnit || vessel.contents[0]?.volumeUnit || "gal";
      const totalVol = vessel.contents.reduce((sum, c) => {
        return sum + (c.volume || 0) * convertUnitRatio(c.volumeUnit || targetUnit, targetUnit);
      }, 0);
      return `${+totalVol.toFixed(2)} ${targetUnit}`;
    };
    const hasContents = (vessel) => vessel.contents && vessel.contents.length > 0;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Vessel Status</h2><p class="text-xs text-parchment/60 mt-0.5">${ssrInterpolate(unref(vesselStore).vessels.length)} total vessels </p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/vessels",
        class: "text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` View All `);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-arrow-right",
              class: "text-sm"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createTextVNode(" View All "),
              createVNode(_component_UIcon, {
                name: "i-lucide-arrow-right",
                class: "text-sm"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="space-y-4"><!--[-->`);
      ssrRenderList(unref(vesselGroups), (group) => {
        _push(`<div><div class="flex items-center gap-2 mb-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: group.icon,
          class: ["text-sm", group.color]
        }, null, _parent));
        _push(`<span class="text-xs font-semibold uppercase tracking-wider text-parchment/50">${ssrInterpolate(group.title)} <span class="text-parchment/50">(${ssrInterpolate(group.vessels.length)})</span></span></div>`);
        if (group.vessels.length === 0) {
          _push(`<div class="text-xs text-parchment/20 pl-5 pb-2"> None configured </div>`);
        } else {
          _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><!--[-->`);
          ssrRenderList(group.vessels, (vessel) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: vessel._id,
              to: `/admin/vessels/${vessel._id}`,
              class: [
                "rounded-lg border px-3 py-2 flex items-center justify-between hover:border-gold/30 transition-all duration-200 cursor-pointer group",
                hasContents(vessel) ? "bg-brown/20 border-brown/30" : "bg-brown/5 border-brown/15"
              ]
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="min-w-0"${_scopeId}><div class="text-sm text-parchment font-medium truncate group-hover:text-gold transition-colors duration-200"${_scopeId}>${ssrInterpolate(vessel.name)}</div>`);
                  if (hasContents(vessel)) {
                    _push2(`<div class="text-xs text-copper truncate"${_scopeId}>${ssrInterpolate(getContentLabel(vessel))}</div>`);
                  } else {
                    _push2(`<div class="text-xs text-parchment/25"${_scopeId}>Empty</div>`);
                  }
                  _push2(`</div>`);
                  if (hasContents(vessel)) {
                    _push2(`<div class="text-xs text-parchment/50 shrink-0 ml-2"${_scopeId}>${ssrInterpolate(getVesselVolume(vessel))}</div>`);
                  } else {
                    _push2(`<div class="w-2 h-2 rounded-full bg-parchment/15 shrink-0 ml-2"${_scopeId}></div>`);
                  }
                } else {
                  return [
                    createVNode("div", { class: "min-w-0" }, [
                      createVNode("div", { class: "text-sm text-parchment font-medium truncate group-hover:text-gold transition-colors duration-200" }, toDisplayString(vessel.name), 1),
                      hasContents(vessel) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "text-xs text-copper truncate"
                      }, toDisplayString(getContentLabel(vessel)), 1)) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "text-xs text-parchment/25"
                      }, "Empty"))
                    ]),
                    hasContents(vessel) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-xs text-parchment/50 shrink-0 ml-2"
                    }, toDisplayString(getVesselVolume(vessel)), 1)) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "w-2 h-2 rounded-full bg-parchment/15 shrink-0 ml-2"
                    }))
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--><div><div class="flex items-center gap-2 mb-2">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-cylinder",
        class: "text-sm text-amber"
      }, null, _parent));
      _push(`<span class="text-xs font-semibold uppercase tracking-wider text-parchment/50"> Barrels <span class="text-parchment/50">(${ssrInterpolate(unref(vesselStore).barrels.length)})</span></span></div>`);
      if (unref(vesselStore).barrels.length === 0) {
        _push(`<div class="text-xs text-parchment/20 pl-5 pb-2"> None configured </div>`);
      } else {
        _push(`<div class="flex flex-wrap gap-2"><div class="flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-lg px-3 py-1.5"><div class="w-2 h-2 rounded-full bg-amber"></div><span class="text-xs text-parchment/70">${ssrInterpolate(unref(filledBarrels).length)} filled </span></div><div class="flex items-center gap-2 bg-brown/10 border border-brown/20 rounded-lg px-3 py-1.5"><div class="w-2 h-2 rounded-full bg-parchment/20"></div><span class="text-xs text-parchment/60">${ssrInterpolate(unref(emptyBarrels).length)} empty </span></div></div>`);
      }
      if (unref(filledBarrels).length > 0) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"><!--[-->`);
        ssrRenderList(unref(filledBarrels).slice(0, 6), (barrel) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: barrel._id,
            to: `/admin/vessels/${barrel._id}`,
            class: "rounded-lg border bg-brown/20 border-brown/30 px-3 py-2 hover:border-gold/30 transition-all duration-200 cursor-pointer group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="text-sm text-parchment font-medium truncate group-hover:text-gold transition-colors duration-200"${_scopeId}>${ssrInterpolate(barrel.name)}</div><!--[-->`);
                ssrRenderList(barrel.contents, (content) => {
                  _push2(`<div class="text-xs text-copper truncate"${_scopeId}>${ssrInterpolate(getContentLabel(barrel))} - ${ssrInterpolate(content.volume)} ${ssrInterpolate(content.volumeUnit)}</div>`);
                });
                _push2(`<!--]-->`);
              } else {
                return [
                  createVNode("div", { class: "text-sm text-parchment font-medium truncate group-hover:text-gold transition-colors duration-200" }, toDisplayString(barrel.name), 1),
                  (openBlock(true), createBlock(Fragment, null, renderList(barrel.contents, (content) => {
                    return openBlock(), createBlock("div", {
                      key: content.batch,
                      class: "text-xs text-copper truncate"
                    }, toDisplayString(getContentLabel(barrel)) + " - " + toDisplayString(content.volume) + " " + toDisplayString(content.volumeUnit), 1);
                  }), 128))
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
        if (unref(filledBarrels).length > 6) {
          _push(`<div class="text-xs text-parchment/50 flex items-center px-3"> +${ssrInterpolate(unref(filledBarrels).length - 6)} more barrels </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardVesselOverview.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$5, { __name: "DashboardVesselOverview" });
const DEFAULT_REORDER_POINT = 10;
const CRITICAL_RATIO = 0.3;
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "DashboardLowInventory",
  __ssrInlineRender: true,
  setup(__props) {
    const itemStore = useItemStore();
    const inventoryStore = useInventoryStore();
    const bottleStore = useBottleStore();
    const latestInventoryByItem = computed(() => {
      const map = /* @__PURE__ */ new Map();
      const sortedInventories = [...inventoryStore.inventories].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      for (const inv of sortedInventories) {
        if (!map.has(inv.item)) {
          map.set(inv.item, inv.quantity);
        }
      }
      return map;
    });
    const lowInventoryItems = computed(() => {
      const alerts = [];
      for (const [itemId, quantity] of latestInventoryByItem.value) {
        const item = itemStore.getItemById(itemId);
        if (!item || item.trackInventory === false) continue;
        const reorderPoint = item.reorderPoint && item.reorderPoint > 0 ? item.reorderPoint : DEFAULT_REORDER_POINT;
        const criticalThreshold = Math.floor(reorderPoint * CRITICAL_RATIO);
        if (quantity <= reorderPoint) {
          alerts.push({
            id: itemId,
            name: item.name,
            type: "item",
            quantity,
            unit: item.inventoryUnit || "units",
            status: quantity <= criticalThreshold ? "critical" : "low"
          });
        }
      }
      return alerts.sort((a, b) => a.quantity - b.quantity);
    });
    const outOfStockBottles = computed(() => {
      return bottleStore.bottles.filter((b) => b.inStock === false).map((b) => ({
        id: b._id,
        name: b.name,
        type: "bottle",
        quantity: 0,
        unit: "bottles",
        status: "critical"
      }));
    });
    const allAlerts = computed(() => [
      ...outOfStockBottles.value,
      ...lowInventoryItems.value
    ]);
    const statusColor = (status) => {
      switch (status) {
        case "critical":
          return "bg-red-500";
        case "low":
          return "bg-amber";
        default:
          return "bg-green-500";
      }
    };
    const statusBg = (status) => {
      switch (status) {
        case "critical":
          return "bg-red-500/10 border-red-500/20";
        case "low":
          return "bg-amber/10 border-amber/20";
        default:
          return "bg-green-500/10 border-green-500/20";
      }
    };
    const statusText = (status) => {
      switch (status) {
        case "critical":
          return "text-red-400";
        case "low":
          return "text-amber";
        default:
          return "text-green-400";
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Inventory Health</h2>`);
      if (unref(allAlerts).length > 0) {
        _push(`<span class="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">${ssrInterpolate(unref(allAlerts).length)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center gap-3">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/inventory/shopping-list",
        class: "text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Shopping List `);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-shopping-cart",
              class: "text-sm"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createTextVNode(" Shopping List "),
              createVNode(_component_UIcon, {
                name: "i-lucide-shopping-cart",
                class: "text-sm"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/items",
        class: "text-xs text-copper hover:text-gold transition-colors duration-200 flex items-center gap-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Manage `);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-arrow-right",
              class: "text-sm"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createTextVNode(" Manage "),
              createVNode(_component_UIcon, {
                name: "i-lucide-arrow-right",
                class: "text-sm"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="flex gap-3 mb-4"><div class="flex items-center gap-1.5 text-xs"><div class="w-2 h-2 rounded-full bg-red-500"></div><span class="text-parchment/50">${ssrInterpolate(unref(allAlerts).filter((a) => a.status === "critical").length)} Critical </span></div><div class="flex items-center gap-1.5 text-xs"><div class="w-2 h-2 rounded-full bg-amber"></div><span class="text-parchment/50">${ssrInterpolate(unref(allAlerts).filter((a) => a.status === "low").length)} Low </span></div><div class="flex items-center gap-1.5 text-xs"><div class="w-2 h-2 rounded-full bg-green-500"></div><span class="text-parchment/50">${ssrInterpolate(unref(itemStore).items.filter((i) => i.trackInventory !== false).length - unref(lowInventoryItems).length)} OK </span></div></div>`);
      if (unref(allAlerts).length === 0) {
        _push(`<div class="py-6 text-center">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-check-circle",
          class: "text-3xl text-green-400/40 mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">All inventory levels healthy</p></div>`);
      } else {
        _push(`<div class="flex flex-col gap-2 max-h-64 overflow-y-auto"><!--[-->`);
        ssrRenderList(unref(allAlerts).slice(0, 10), (alert) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: alert.id,
            to: alert.type === "bottle" ? `/admin/bottles/${alert.id}` : `/admin/items/${alert.id}`,
            class: [
              "flex items-center justify-between rounded-lg border px-3 py-2.5 hover:border-gold/30 transition-all duration-200 cursor-pointer group",
              statusBg(alert.status)
            ]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center gap-2.5 min-w-0"${_scopeId}><div class="${ssrRenderClass(["w-2 h-2 rounded-full shrink-0", statusColor(alert.status)])}"${_scopeId}></div><div class="min-w-0"${_scopeId}><div class="text-sm text-parchment truncate group-hover:text-gold transition-colors duration-200"${_scopeId}>${ssrInterpolate(alert.name)}</div><div class="text-[10px] uppercase tracking-wider text-parchment/50"${_scopeId}>${ssrInterpolate(alert.type === "bottle" ? "Bottle Product" : "Ingredient")}</div></div></div><div class="flex items-center gap-1.5 shrink-0 ml-3"${_scopeId}><span class="${ssrRenderClass(["text-sm font-bold", statusText(alert.status)])}"${_scopeId}>${ssrInterpolate(alert.quantity)}</span><span class="text-[10px] text-parchment/50"${_scopeId}>${ssrInterpolate(alert.unit)}</span></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center gap-2.5 min-w-0" }, [
                    createVNode("div", {
                      class: ["w-2 h-2 rounded-full shrink-0", statusColor(alert.status)]
                    }, null, 2),
                    createVNode("div", { class: "min-w-0" }, [
                      createVNode("div", { class: "text-sm text-parchment truncate group-hover:text-gold transition-colors duration-200" }, toDisplayString(alert.name), 1),
                      createVNode("div", { class: "text-[10px] uppercase tracking-wider text-parchment/50" }, toDisplayString(alert.type === "bottle" ? "Bottle Product" : "Ingredient"), 1)
                    ])
                  ]),
                  createVNode("div", { class: "flex items-center gap-1.5 shrink-0 ml-3" }, [
                    createVNode("span", {
                      class: ["text-sm font-bold", statusText(alert.status)]
                    }, toDisplayString(alert.quantity), 3),
                    createVNode("span", { class: "text-[10px] text-parchment/50" }, toDisplayString(alert.unit), 1)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
        if (unref(allAlerts).length > 10) {
          _push(`<div class="text-xs text-parchment/50 text-center py-1"> +${ssrInterpolate(unref(allAlerts).length - 10)} more items </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`<div class="mt-3 pt-3 border-t border-brown/15 text-[10px] text-parchment/20"> Thresholds based on each item&#39;s reorder point </div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardLowInventory.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_7 = Object.assign(_sfc_main$4, { __name: "DashboardLowInventory" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "DashboardRevenue",
  __ssrInlineRender: true,
  setup(__props) {
    const productionStore = useProductionStore();
    const bottleStore = useBottleStore();
    const estimatedRevenue = computed(() => {
      return productionStore.productions.reduce((total, prod) => {
        const bottle = bottleStore.getBottleById(prod.bottle);
        const price = bottle?.price || 0;
        return total + price * prod.quantity;
      }, 0);
    });
    const estimatedCosts = computed(() => {
      return productionStore.productions.reduce((total, prod) => {
        return total + (prod.productionCost || 0) + (prod.bottleCost || 0);
      }, 0);
    });
    const totalBottlesProduced = computed(() => {
      return productionStore.productions.reduce((sum, p) => sum + (p.quantity || 0), 0);
    });
    const totalProductions = computed(() => productionStore.productions.length);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Financial Overview</h2><span class="text-[10px] uppercase tracking-wider text-parchment/50 bg-brown/20 px-2 py-1 rounded"> All Time </span></div><div class="grid grid-cols-3 gap-3 mb-4"><div class="bg-brown/15 rounded-lg p-3 border border-brown/20"><div class="text-xs text-parchment/60 mb-1">Est. Revenue</div><div class="text-lg font-bold text-gold font-[Cormorant_Garamond]">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(estimatedRevenue)))}</div></div><div class="bg-brown/15 rounded-lg p-3 border border-brown/20"><div class="text-xs text-parchment/60 mb-1">Total Costs</div><div class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(estimatedCosts)))}</div></div><div class="bg-brown/15 rounded-lg p-3 border border-brown/20"><div class="text-xs text-parchment/60 mb-1">Est. Margin</div><div class="${ssrRenderClass([unref(estimatedRevenue) - unref(estimatedCosts) > 0 ? "text-green-400" : "text-red-400", "text-lg font-bold font-[Cormorant_Garamond]"])}">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(estimatedRevenue) - unref(estimatedCosts)))}</div></div></div><div class="border-t border-brown/20 pt-3"><div class="text-[10px] uppercase tracking-wider text-parchment/50 mb-2"> Production Summary </div><div class="flex items-center justify-between py-2"><span class="text-xs text-parchment/50">Total Productions</span><span class="text-sm font-medium text-parchment">${ssrInterpolate(unref(totalProductions))}</span></div><div class="flex items-center justify-between py-2"><span class="text-xs text-parchment/50">Total Bottles</span><span class="text-sm font-medium text-parchment">${ssrInterpolate(unref(totalBottlesProduced))}</span></div></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardRevenue.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_8 = Object.assign(_sfc_main$3, { __name: "DashboardRevenue" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "DashboardBottleInventoryQuick",
  __ssrInlineRender: true,
  setup(__props) {
    const bottleStore = useBottleStore();
    const inventoryStore = useInventoryStore();
    function getLatestQuantity(bottleId) {
      const records = inventoryStore.getInventoriesByItem(bottleId);
      if (records.length === 0) return null;
      const sorted = [...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sorted[0].quantity;
    }
    const sortedBottles = computed(
      () => [...bottleStore.bottles].sort((a, b) => a.name.localeCompare(b.name))
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><h3 class="text-sm font-semibold text-parchment/80 uppercase tracking-wider"> Bottle Stock </h3>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/bottles/inventory",
        class: "text-xs text-copper hover:text-gold transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` View All `);
          } else {
            return [
              createTextVNode(" View All ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(sortedBottles).length === 0) {
        _push(`<div class="text-center py-6">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-wine",
          class: "text-2xl text-parchment/20 mb-2"
        }, null, _parent));
        _push(`<p class="text-xs text-parchment/60">No bottles defined</p></div>`);
      } else {
        _push(`<div class="max-h-80 overflow-y-auto space-y-1 -mx-1 px-1"><!--[-->`);
        ssrRenderList(unref(sortedBottles), (bottle) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: bottle._id,
            to: `/admin/bottles/${bottle._id}`,
            class: "flex items-center justify-between py-2 px-2 rounded-lg hover:bg-brown/10 transition-colors cursor-pointer group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center gap-2 min-w-0"${_scopeId}><span class="text-sm text-parchment/80 truncate group-hover:text-gold transition-colors duration-200"${_scopeId}>${ssrInterpolate(bottle.name)}</span></div><div class="flex items-center gap-3 shrink-0"${_scopeId}>`);
                if (getLatestQuantity(bottle._id) !== null) {
                  _push2(`<span class="${ssrRenderClass([
                    "text-xs font-medium tabular-nums",
                    (getLatestQuantity(bottle._id) ?? 0) <= 5 ? "text-red-400" : (getLatestQuantity(bottle._id) ?? 0) <= 10 ? "text-amber-400" : "text-parchment/60"
                  ])}"${_scopeId}>${ssrInterpolate(getLatestQuantity(bottle._id))}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="flex items-center gap-1"${_scopeId}><span class="${ssrRenderClass([
                  "w-1.5 h-1.5 rounded-full",
                  bottle.inStock !== false ? "bg-green-400" : "bg-red-400"
                ])}"${_scopeId}></span><span class="${ssrRenderClass([
                  "text-[10px]",
                  bottle.inStock !== false ? "text-green-400/70" : "text-red-400/70"
                ])}"${_scopeId}>${ssrInterpolate(bottle.inStock !== false ? "In Stock" : "Out")}</span></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center gap-2 min-w-0" }, [
                    createVNode("span", { class: "text-sm text-parchment/80 truncate group-hover:text-gold transition-colors duration-200" }, toDisplayString(bottle.name), 1)
                  ]),
                  createVNode("div", { class: "flex items-center gap-3 shrink-0" }, [
                    getLatestQuantity(bottle._id) !== null ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: [
                        "text-xs font-medium tabular-nums",
                        (getLatestQuantity(bottle._id) ?? 0) <= 5 ? "text-red-400" : (getLatestQuantity(bottle._id) ?? 0) <= 10 ? "text-amber-400" : "text-parchment/60"
                      ]
                    }, toDisplayString(getLatestQuantity(bottle._id)), 3)) : createCommentVNode("", true),
                    createVNode("div", { class: "flex items-center gap-1" }, [
                      createVNode("span", {
                        class: [
                          "w-1.5 h-1.5 rounded-full",
                          bottle.inStock !== false ? "bg-green-400" : "bg-red-400"
                        ]
                      }, null, 2),
                      createVNode("span", {
                        class: [
                          "text-[10px]",
                          bottle.inStock !== false ? "text-green-400/70" : "text-red-400/70"
                        ]
                      }, toDisplayString(bottle.inStock !== false ? "In Stock" : "Out"), 3)
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboard/DashboardBottleInventoryQuick.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_9 = Object.assign(_sfc_main$2, { __name: "DashboardBottleInventoryQuick" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminDashboard",
  __ssrInlineRender: true,
  setup(__props) {
    const batchStore = useBatchStore();
    const bottleStore = useBottleStore();
    const productionStore = useProductionStore();
    const purchaseOrderStore = usePurchaseOrderStore();
    const inventoryStore = useInventoryStore();
    const itemStore = useItemStore();
    const overlay = useOverlay();
    async function openQuickAdd(type) {
      if (type === "batch") {
        batchStore.resetItem();
        const panel = overlay.create(LazyPanelBatch);
        await panel.open();
      } else {
        productionStore.resetItem();
        const panel = overlay.create(LazyPanelProduction);
        await panel.open();
      }
    }
    const now = ref(/* @__PURE__ */ new Date());
    const greeting = computed(() => {
      const hour = now.value.getHours();
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon";
      return "Good evening";
    });
    const activeBatches = computed(
      () => batchStore.batches.filter((b) => b.status === "active" && b.currentStage !== "Upcoming").length
    );
    const upcomingBatches = computed(
      () => batchStore.batches.filter((b) => b.currentStage === "Upcoming" && b.status === "active").length
    );
    const inStockBottles = computed(
      () => bottleStore.bottles.filter((b) => b.inStock !== false).length
    );
    const totalBottles = computed(() => bottleStore.bottles.length);
    const pendingPOs = computed(
      () => purchaseOrderStore.purchaseOrders.filter(
        (po) => ["Pending", "Confirmed", "Shipped"].includes(po.status)
      )
    );
    const pendingPOCount = computed(() => pendingPOs.value.length);
    const pendingPOTotal = computed(
      () => Dollar.format(pendingPOs.value.reduce((sum, po) => sum + (po.total || 0), 0))
    );
    const lowInventoryAlerts = computed(() => {
      let count = 0;
      for (const item of itemStore.items) {
        if (!item.reorderPoint || item.reorderPoint <= 0) continue;
        const stock = inventoryStore.getCurrentStock(item._id);
        if (stock <= item.reorderPoint) count++;
      }
      return count;
    });
    const monthProductions = computed(() => {
      const currentMonth = now.value.getMonth();
      const currentYear = now.value.getFullYear();
      return productionStore.productions.filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    });
    const monthProductionQuantity = computed(
      () => monthProductions.value.reduce((sum, p) => sum + (p.quantity || 0), 0)
    );
    const monthProductionRuns = computed(() => monthProductions.value.length);
    const isLoading = computed(
      () => batchStore.loading || bottleStore.loading || productionStore.loading
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8$1;
      const _component_UIcon = _sfc_main$e;
      const _component_DashboardStatCard = __nuxt_component_2;
      const _component_DashboardBatchPipeline = __nuxt_component_3;
      const _component_DashboardActionItems = __nuxt_component_4;
      const _component_DashboardRecentProductions = __nuxt_component_5;
      const _component_DashboardVesselOverview = __nuxt_component_6;
      const _component_DashboardLowInventory = __nuxt_component_7;
      const _component_DashboardRevenue = __nuxt_component_8;
      const _component_DashboardBottleInventoryQuick = __nuxt_component_9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"><div><h1 class="text-2xl md:text-3xl font-bold text-parchment font-[Cormorant_Garamond]">${ssrInterpolate(unref(greeting))}</h1><p class="text-sm text-parchment/60 mt-1"> Here is an overview of your distillery operations. </p></div><div class="flex gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "sm",
        variant: "soft",
        class: "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20",
        onClick: ($event) => openQuickAdd("batch")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-plus",
              class: "mr-1"
            }, null, _parent2, _scopeId));
            _push2(` New Batch `);
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-lucide-plus",
                class: "mr-1"
              }),
              createTextVNode(" New Batch ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        size: "sm",
        variant: "soft",
        class: "bg-copper/10 text-copper border border-copper/20 hover:bg-copper/20",
        onClick: ($event) => openQuickAdd("production")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-factory",
              class: "mr-1"
            }, null, _parent2, _scopeId));
            _push2(` Record Production `);
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-lucide-factory",
                class: "mr-1"
              }),
              createTextVNode(" Record Production ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(isLoading)) {
        _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-parchment/60">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "text-xl animate-spin text-gold"
        }, null, _parent));
        _push(`<span class="text-sm">Loading operations data...</span></div></div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">`);
        _push(ssrRenderComponent(_component_DashboardStatCard, {
          title: "Active Batches",
          value: unref(activeBatches),
          subtitle: `${unref(upcomingBatches)} upcoming`,
          icon: "i-lucide-flask-conical",
          color: "gold",
          to: "/admin/batch"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardStatCard, {
          title: "Bottles in Stock",
          value: unref(inStockBottles),
          subtitle: `of ${unref(totalBottles)} total`,
          icon: "i-lucide-wine",
          color: "copper",
          to: "/admin/bottles"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardStatCard, {
          title: "Pending POs",
          value: unref(pendingPOCount),
          subtitle: unref(pendingPOTotal),
          icon: "i-lucide-receipt",
          color: "amber",
          to: "/admin/purchaseOrders"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardStatCard, {
          title: "Low Inventory",
          value: unref(lowInventoryAlerts),
          subtitle: "items need reorder",
          icon: "i-lucide-alert-triangle",
          color: "red",
          to: "/admin/items"
        }, null, _parent));
        _push(ssrRenderComponent(_component_DashboardStatCard, {
          title: "This Month",
          value: unref(monthProductionQuantity),
          subtitle: `${unref(monthProductionRuns)} production runs`,
          icon: "i-lucide-factory",
          color: "green",
          to: "/admin/production"
        }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_DashboardBatchPipeline, null, null, _parent));
        _push(`<div class="grid grid-cols-1 xl:grid-cols-3 gap-6"><div class="xl:col-span-2 space-y-6"><div class="grid grid-cols-1 lg:grid-cols-2 gap-6">`);
        _push(ssrRenderComponent(_component_DashboardActionItems, null, null, _parent));
        _push(ssrRenderComponent(_component_DashboardRecentProductions, null, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_DashboardVesselOverview, null, null, _parent));
        _push(`</div><div class="space-y-6">`);
        _push(ssrRenderComponent(_component_DashboardLowInventory, null, null, _parent));
        _push(ssrRenderComponent(_component_DashboardRevenue, null, null, _parent));
        _push(ssrRenderComponent(_component_DashboardBottleInventoryQuick, null, null, _parent));
        _push(`</div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/AdminDashboard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$1, { __name: "AdminDashboard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminDashboard = __nuxt_component_0;
      _push(ssrRenderComponent(_component_AdminDashboard, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dashboard-cdL7tesJ.mjs.map

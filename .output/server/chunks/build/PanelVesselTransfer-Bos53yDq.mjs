import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { m as useToast, e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$2 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$3 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, unref, isRef, createVNode, createTextVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { v as volumeUnits } from './units-DWysHFem.mjs';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { u as useVesselStore, a as useBatchStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';
import 'reka-ui';
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
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';
import './batchPipeline-Dr1IalWc.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelVesselTransfer",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const toast = useToast();
    const sourceId = ref("");
    const destId = ref("");
    const transferMode = ref("full");
    const transferVolume = ref(0);
    const transferUnit = ref("gallon");
    const loading = ref(false);
    const sourceVessel = computed(
      () => sourceId.value ? vesselStore.getVesselById(sourceId.value) : void 0
    );
    const sourceContents = computed(() => {
      if (!sourceVessel.value?.contents?.length) return [];
      return sourceVessel.value.contents.map((c) => {
        const batch = batchStore.getBatchById(c.batch);
        const recipe = batch?.recipe ? recipeStore.getRecipeById(batch.recipe) : void 0;
        return {
          name: recipe?.name || "Unknown",
          volume: c.volume,
          volumeUnit: c.volumeUnit,
          abv: c.abv,
          value: c.value
        };
      });
    });
    const totalSourceVolume = computed(() => {
      const contents = sourceVessel.value?.contents;
      if (!contents?.length) return 0;
      return contents.reduce(
        (acc, c) => acc + c.volume * convertUnitRatio(c.volumeUnit, transferUnit.value),
        0
      );
    });
    const estimatedTransferValue = computed(() => {
      if (totalSourceVolume.value <= 0 || transferVolume.value <= 0) return 0;
      const totalValue = sourceVessel.value?.contents?.reduce((acc, c) => acc + c.value, 0) || 0;
      const ratio = transferVolume.value / totalSourceVolume.value;
      return totalValue * Math.min(ratio, 1);
    });
    const availableDestinations = computed(
      () => vesselStore.vessels.filter((v) => v._id !== sourceId.value)
    );
    const vesselOptions = computed(
      () => vesselStore.vessels.map((v) => ({ label: v.name, value: v._id }))
    );
    const destOptions = computed(
      () => availableDestinations.value.map((v) => ({ label: v.name, value: v._id }))
    );
    const doTransfer = async () => {
      if (!sourceId.value || !destId.value) return;
      loading.value = true;
      try {
        if (transferMode.value === "full") {
          await vesselStore.fullTransfer(sourceId.value, destId.value);
        } else {
          await vesselStore.transferBatch(sourceId.value, destId.value, {
            volume: transferVolume.value,
            volumeUnit: transferUnit.value,
            abv: sourceVessel.value?.current?.abv || 0,
            value: estimatedTransferValue.value
          });
        }
        sourceId.value = "";
        destId.value = "";
        transferVolume.value = 0;
      } catch (error) {
        toast.add({ title: "Transfer failed", description: getErrorMessage(error), color: "error", icon: "i-lucide-alert-circle" });
      } finally {
        loading.value = false;
      }
    };
    const cancel = () => emit("close", true);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UFormField = _sfc_main$2;
      const _component_USelect = _sfc_main$3;
      const _component_UInput = _sfc_main$4;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: cancel }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>Vessel Transfer</h2>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-x",
              color: "neutral",
              variant: "ghost",
              onClick: cancel
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="flex-1 overflow-y-auto p-4 space-y-5"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, { label: "Source Vessel" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(sourceId),
                    "onUpdate:modelValue": ($event) => isRef(sourceId) ? sourceId.value = $event : null,
                    items: unref(vesselOptions),
                    placeholder: "Select source...",
                    "value-key": "value"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USelect, {
                      modelValue: unref(sourceId),
                      "onUpdate:modelValue": ($event) => isRef(sourceId) ? sourceId.value = $event : null,
                      items: unref(vesselOptions),
                      placeholder: "Select source...",
                      "value-key": "value"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (unref(sourceContents).length > 0) {
              _push2(`<div class="bg-brown/10 rounded-lg border border-brown/20 p-3"${_scopeId}><div class="text-xs font-semibold text-parchment/60 uppercase tracking-wider mb-2"${_scopeId}>Contents</div><!--[-->`);
              ssrRenderList(unref(sourceContents), (item, i) => {
                _push2(`<div class="flex justify-between text-xs text-parchment/70 py-1"${_scopeId}><span${_scopeId}>${ssrInterpolate(item.name)}</span><span${_scopeId}>${ssrInterpolate(item.volume)} ${ssrInterpolate(item.volumeUnit)} / ${ssrInterpolate(item.abv)}% / ${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.value))}</span></div>`);
              });
              _push2(`<!--]--></div>`);
            } else if (unref(sourceId)) {
              _push2(`<div class="text-xs text-parchment/50 py-2"${_scopeId}>Source vessel is empty</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_UFormField, { label: "Destination Vessel" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: unref(destId),
                    "onUpdate:modelValue": ($event) => isRef(destId) ? destId.value = $event : null,
                    items: unref(destOptions),
                    placeholder: "Select destination...",
                    "value-key": "value"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USelect, {
                      modelValue: unref(destId),
                      "onUpdate:modelValue": ($event) => isRef(destId) ? destId.value = $event : null,
                      items: unref(destOptions),
                      placeholder: "Select destination...",
                      "value-key": "value"
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="flex gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              variant: unref(transferMode) === "full" ? "solid" : "outline",
              onClick: ($event) => transferMode.value = "full",
              class: "flex-1"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Full Transfer `);
                } else {
                  return [
                    createTextVNode(" Full Transfer ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              variant: unref(transferMode) === "partial" ? "solid" : "outline",
              onClick: ($event) => transferMode.value = "partial",
              class: "flex-1"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Partial Transfer `);
                } else {
                  return [
                    createTextVNode(" Partial Transfer ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(transferMode) === "partial") {
              _push2(`<div class="space-y-3"${_scopeId}><div class="grid grid-cols-2 gap-3"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UFormField, { label: "Volume" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UInput, {
                      modelValue: unref(transferVolume),
                      "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                      type: "number",
                      min: "0",
                      max: unref(totalSourceVolume)
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UInput, {
                        modelValue: unref(transferVolume),
                        "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                        type: "number",
                        min: "0",
                        max: unref(totalSourceVolume)
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "max"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UFormField, { label: "Unit" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_USelect, {
                      modelValue: unref(transferUnit),
                      "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                      items: unref(volumeUnits)
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_USelect, {
                        modelValue: unref(transferUnit),
                        "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                        items: unref(volumeUnits)
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div class="text-xs text-parchment/50"${_scopeId}> Estimated value: ${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(estimatedTransferValue)))}</div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "outline",
              onClick: cancel
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
              onClick: doTransfer,
              loading: unref(loading),
              disabled: !unref(sourceId) || !unref(destId) || unref(transferMode) === "partial" && unref(transferVolume) <= 0
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Transfer `);
                } else {
                  return [
                    createTextVNode(" Transfer ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col h-full w-full sm:max-w-lg" }, [
                createVNode("div", { class: "flex items-center justify-between px-4 py-3 border-b border-white/10" }, [
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, "Vessel Transfer"),
                  createVNode(_component_UButton, {
                    icon: "i-lucide-x",
                    color: "neutral",
                    variant: "ghost",
                    onClick: cancel
                  })
                ]),
                createVNode("div", { class: "flex-1 overflow-y-auto p-4 space-y-5" }, [
                  createVNode(_component_UFormField, { label: "Source Vessel" }, {
                    default: withCtx(() => [
                      createVNode(_component_USelect, {
                        modelValue: unref(sourceId),
                        "onUpdate:modelValue": ($event) => isRef(sourceId) ? sourceId.value = $event : null,
                        items: unref(vesselOptions),
                        placeholder: "Select source...",
                        "value-key": "value"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ]),
                    _: 1
                  }),
                  unref(sourceContents).length > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "bg-brown/10 rounded-lg border border-brown/20 p-3"
                  }, [
                    createVNode("div", { class: "text-xs font-semibold text-parchment/60 uppercase tracking-wider mb-2" }, "Contents"),
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(sourceContents), (item, i) => {
                      return openBlock(), createBlock("div", {
                        key: i,
                        class: "flex justify-between text-xs text-parchment/70 py-1"
                      }, [
                        createVNode("span", null, toDisplayString(item.name), 1),
                        createVNode("span", null, toDisplayString(item.volume) + " " + toDisplayString(item.volumeUnit) + " / " + toDisplayString(item.abv) + "% / " + toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.value)), 1)
                      ]);
                    }), 128))
                  ])) : unref(sourceId) ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-xs text-parchment/50 py-2"
                  }, "Source vessel is empty")) : createCommentVNode("", true),
                  createVNode(_component_UFormField, { label: "Destination Vessel" }, {
                    default: withCtx(() => [
                      createVNode(_component_USelect, {
                        modelValue: unref(destId),
                        "onUpdate:modelValue": ($event) => isRef(destId) ? destId.value = $event : null,
                        items: unref(destOptions),
                        placeholder: "Select destination...",
                        "value-key": "value"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "flex gap-2" }, [
                    createVNode(_component_UButton, {
                      variant: unref(transferMode) === "full" ? "solid" : "outline",
                      onClick: ($event) => transferMode.value = "full",
                      class: "flex-1"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Full Transfer ")
                      ]),
                      _: 1
                    }, 8, ["variant", "onClick"]),
                    createVNode(_component_UButton, {
                      variant: unref(transferMode) === "partial" ? "solid" : "outline",
                      onClick: ($event) => transferMode.value = "partial",
                      class: "flex-1"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Partial Transfer ")
                      ]),
                      _: 1
                    }, 8, ["variant", "onClick"])
                  ]),
                  unref(transferMode) === "partial" ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "space-y-3"
                  }, [
                    createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                      createVNode(_component_UFormField, { label: "Volume" }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(transferVolume),
                            "onUpdate:modelValue": ($event) => isRef(transferVolume) ? transferVolume.value = $event : null,
                            type: "number",
                            min: "0",
                            max: unref(totalSourceVolume)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "max"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Unit" }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(transferUnit),
                            "onUpdate:modelValue": ($event) => isRef(transferUnit) ? transferUnit.value = $event : null,
                            items: unref(volumeUnits)
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      })
                    ]),
                    createVNode("div", { class: "text-xs text-parchment/50" }, " Estimated value: " + toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(estimatedTransferValue))), 1)
                  ])) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10" }, [
                  createVNode(_component_UButton, {
                    color: "neutral",
                    variant: "outline",
                    onClick: cancel
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Cancel")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UButton, {
                    onClick: doTransfer,
                    loading: unref(loading),
                    disabled: !unref(sourceId) || !unref(destId) || unref(transferMode) === "partial" && unref(transferVolume) <= 0
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Transfer ")
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
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelVesselTransfer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PanelVesselTransfer = Object.assign(_sfc_main, { __name: "PanelVesselTransfer" });

export { PanelVesselTransfer as default };
//# sourceMappingURL=PanelVesselTransfer-Bos53yDq.mjs.map

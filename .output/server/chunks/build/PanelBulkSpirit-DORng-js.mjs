import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$2 } from './Form-DifyhlgS.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$5 } from './SelectMenu-DljUyjmT.mjs';
import { _ as _sfc_main$6 } from './Textarea-f7RIzcnS.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import * as yup from 'yup';
import { u as useBulkSpiritStore } from './useBulkSpiritStore-Bx2u4RsR.mjs';
import { u as useVesselStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useFormPanel } from './useFormPanel-DspW7Iuy.mjs';
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
import './proofGallons--xmqBsFG.mjs';
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './batchPipeline-Dr1IalWc.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelBulkSpirit",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const bulkSpiritStore = useBulkSpiritStore();
    const vesselStore = useVesselStore();
    const schema = yup.object({
      name: yup.string().required("Name is required"),
      spiritClass: yup.string().required("Spirit class is required")
    });
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => bulkSpiritStore.bulkSpirit,
      async onSave(data) {
        Object.assign(bulkSpiritStore.bulkSpirit, data);
        await bulkSpiritStore.saveItem();
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    const tankOptions = computed(
      () => vesselStore.tanks.map((t) => ({ label: t.name, value: t._id }))
    );
    const spiritClassOptions = [
      "Neutral",
      "Whiskey",
      "Bourbon",
      "Rum",
      "Gin Base",
      "Brandy",
      "Other"
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$2;
      const _component_UFormField = _sfc_main$3;
      const _component_UInput = _sfc_main$4;
      const _component_USelectMenu = _sfc_main$5;
      const _component_UTextarea = _sfc_main$6;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Bulk Spirit" : "Edit Bulk Spirit")}</h2>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-x",
              color: "neutral",
              variant: "ghost",
              onClick: unref(cancel)
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_UForm, {
              schema: unref(schema),
              state: unref(localData),
              onSubmit: unref(save),
              class: "flex flex-col flex-1 min-h-0"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex-1 overflow-y-auto p-4 space-y-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Name",
                    name: "name"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).name,
                          "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                          placeholder: "e.g. Neutral Spirit",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).name,
                            "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                            placeholder: "e.g. Neutral Spirit",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Spirit Class",
                    name: "spiritClass"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(localData).spiritClass,
                          "onUpdate:modelValue": ($event) => unref(localData).spiritClass = $event,
                          items: spiritClassOptions,
                          placeholder: "Select class",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).spiritClass,
                            "onUpdate:modelValue": ($event) => unref(localData).spiritClass = $event,
                            items: spiritClassOptions,
                            placeholder: "Select class",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Storage Vessel" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(localData).vessel,
                          "onUpdate:modelValue": ($event) => unref(localData).vessel = $event,
                          items: unref(tankOptions),
                          "value-key": "value",
                          placeholder: "Select tank (optional)",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).vessel,
                            "onUpdate:modelValue": ($event) => unref(localData).vessel = $event,
                            items: unref(tankOptions),
                            "value-key": "value",
                            placeholder: "Select tank (optional)",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Notes" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UTextarea, {
                          modelValue: unref(localData).notes,
                          "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                          placeholder: "Optional notes"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            placeholder: "Optional notes"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (!isNew) {
                    _push3(`<div class="border-t border-white/10 pt-4 space-y-2"${_scopeId2}><div class="text-xs text-parchment/60 uppercase tracking-wider"${_scopeId2}>Current Inventory</div><div class="grid grid-cols-2 gap-3 text-sm"${_scopeId2}><div${_scopeId2}><span class="text-parchment/50"${_scopeId2}>Volume:</span><span class="text-parchment ml-1"${_scopeId2}>${ssrInterpolate(unref(localData).volume?.toFixed(1))} ${ssrInterpolate(unref(localData).volumeUnit)}</span></div><div${_scopeId2}><span class="text-parchment/50"${_scopeId2}>ABV:</span><span class="text-parchment ml-1"${_scopeId2}>${ssrInterpolate(unref(localData).abv?.toFixed(1))}%</span></div><div${_scopeId2}><span class="text-parchment/50"${_scopeId2}>Proof Gallons:</span><span class="text-parchment ml-1"${_scopeId2}>${ssrInterpolate(unref(localData).proofGallons?.toFixed(2))}</span></div><div${_scopeId2}><span class="text-parchment/50"${_scopeId2}>Cost/PG:</span><span class="text-gold ml-1"${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).costPerProofGallon || 0))}</span></div><div class="col-span-2"${_scopeId2}><span class="text-parchment/50"${_scopeId2}>Total Value:</span><span class="text-gold ml-1"${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).totalValue || 0))}</span></div></div></div>`);
                  } else {
                    _push3(`<!---->`);
                  }
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
                        _push4(`${ssrInterpolate(isNew ? "Create" : "Save")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(isNew ? "Create" : "Save"), 1)
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
                        label: "Name",
                        name: "name"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).name,
                            "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                            placeholder: "e.g. Neutral Spirit",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Spirit Class",
                        name: "spiritClass"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).spiritClass,
                            "onUpdate:modelValue": ($event) => unref(localData).spiritClass = $event,
                            items: spiritClassOptions,
                            placeholder: "Select class",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Storage Vessel" }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).vessel,
                            "onUpdate:modelValue": ($event) => unref(localData).vessel = $event,
                            items: unref(tankOptions),
                            "value-key": "value",
                            placeholder: "Select tank (optional)",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Notes" }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            placeholder: "Optional notes"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      !isNew ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "border-t border-white/10 pt-4 space-y-2"
                      }, [
                        createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, "Current Inventory"),
                        createVNode("div", { class: "grid grid-cols-2 gap-3 text-sm" }, [
                          createVNode("div", null, [
                            createVNode("span", { class: "text-parchment/50" }, "Volume:"),
                            createVNode("span", { class: "text-parchment ml-1" }, toDisplayString(unref(localData).volume?.toFixed(1)) + " " + toDisplayString(unref(localData).volumeUnit), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("span", { class: "text-parchment/50" }, "ABV:"),
                            createVNode("span", { class: "text-parchment ml-1" }, toDisplayString(unref(localData).abv?.toFixed(1)) + "%", 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("span", { class: "text-parchment/50" }, "Proof Gallons:"),
                            createVNode("span", { class: "text-parchment ml-1" }, toDisplayString(unref(localData).proofGallons?.toFixed(2)), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("span", { class: "text-parchment/50" }, "Cost/PG:"),
                            createVNode("span", { class: "text-gold ml-1" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).costPerProofGallon || 0)), 1)
                          ]),
                          createVNode("div", { class: "col-span-2" }, [
                            createVNode("span", { class: "text-parchment/50" }, "Total Value:"),
                            createVNode("span", { class: "text-gold ml-1" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).totalValue || 0)), 1)
                          ])
                        ])
                      ])) : createCommentVNode("", true)
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
                          createTextVNode(toDisplayString(isNew ? "Create" : "Save"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col h-full w-full sm:max-w-lg" }, [
                createVNode("div", { class: "flex items-center justify-between px-4 py-3 border-b border-white/10" }, [
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Bulk Spirit" : "Edit Bulk Spirit"), 1),
                  createVNode(_component_UButton, {
                    icon: "i-lucide-x",
                    color: "neutral",
                    variant: "ghost",
                    onClick: unref(cancel)
                  }, null, 8, ["onClick"])
                ]),
                createVNode(_component_UForm, {
                  schema: unref(schema),
                  state: unref(localData),
                  onSubmit: unref(save),
                  class: "flex flex-col flex-1 min-h-0"
                }, {
                  default: withCtx(() => [
                    createVNode("div", { class: "flex-1 overflow-y-auto p-4 space-y-4" }, [
                      createVNode(_component_UFormField, {
                        label: "Name",
                        name: "name"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).name,
                            "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                            placeholder: "e.g. Neutral Spirit",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Spirit Class",
                        name: "spiritClass"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).spiritClass,
                            "onUpdate:modelValue": ($event) => unref(localData).spiritClass = $event,
                            items: spiritClassOptions,
                            placeholder: "Select class",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Storage Vessel" }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).vessel,
                            "onUpdate:modelValue": ($event) => unref(localData).vessel = $event,
                            items: unref(tankOptions),
                            "value-key": "value",
                            placeholder: "Select tank (optional)",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Notes" }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            placeholder: "Optional notes"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      !isNew ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "border-t border-white/10 pt-4 space-y-2"
                      }, [
                        createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, "Current Inventory"),
                        createVNode("div", { class: "grid grid-cols-2 gap-3 text-sm" }, [
                          createVNode("div", null, [
                            createVNode("span", { class: "text-parchment/50" }, "Volume:"),
                            createVNode("span", { class: "text-parchment ml-1" }, toDisplayString(unref(localData).volume?.toFixed(1)) + " " + toDisplayString(unref(localData).volumeUnit), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("span", { class: "text-parchment/50" }, "ABV:"),
                            createVNode("span", { class: "text-parchment ml-1" }, toDisplayString(unref(localData).abv?.toFixed(1)) + "%", 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("span", { class: "text-parchment/50" }, "Proof Gallons:"),
                            createVNode("span", { class: "text-parchment ml-1" }, toDisplayString(unref(localData).proofGallons?.toFixed(2)), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("span", { class: "text-parchment/50" }, "Cost/PG:"),
                            createVNode("span", { class: "text-gold ml-1" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).costPerProofGallon || 0)), 1)
                          ]),
                          createVNode("div", { class: "col-span-2" }, [
                            createVNode("span", { class: "text-parchment/50" }, "Total Value:"),
                            createVNode("span", { class: "text-gold ml-1" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(localData).totalValue || 0)), 1)
                          ])
                        ])
                      ])) : createCommentVNode("", true)
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
                          createTextVNode(toDisplayString(isNew ? "Create" : "Save"), 1)
                        ]),
                        _: 1
                      }, 8, ["loading", "disabled"])
                    ])
                  ]),
                  _: 1
                }, 8, ["schema", "state", "onSubmit"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelBulkSpirit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PanelBulkSpirit = Object.assign(_sfc_main, { __name: "PanelBulkSpirit" });

export { PanelBulkSpirit as default };
//# sourceMappingURL=PanelBulkSpirit-DORng-js.mjs.map

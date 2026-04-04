import { _ as _sfc_main$3 } from './Badge-BJMjvXJU.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { h as useRouter, e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$4 } from './Table-HT3K8pYo.mjs';
import { _ as __nuxt_component_6$1 } from './BaseEmptyState-BmEkGz1p.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, h, ref, withCtx, createTextVNode, createVNode, unref, computed, mergeProps, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useBulkSpiritStore } from './useBulkSpiritStore-Bx2u4RsR.mjs';
import { u as useVesselStore, a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { _ as _sfc_main$5 } from './Slideover-CyjfVfmV.mjs';
import { _ as _sfc_main$6 } from './Form-B0crAOcM.mjs';
import { _ as _sfc_main$7 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$9 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$a } from './SelectMenu-DljUyjmT.mjs';
import { _ as _sfc_main$b } from './Textarea-f7RIzcnS.mjs';
import * as yup from 'yup';
import { u as useFormPanel } from './useFormPanel-DspW7Iuy.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
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
import '@tanstack/vue-table';
import '@tanstack/vue-virtual';
import './proofGallons--xmqBsFG.mjs';
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BulkSpiritLedger",
  __ssrInlineRender: true,
  props: {
    bulkSpiritId: {}
  },
  setup(__props) {
    const props = __props;
    const bulkSpiritStore = useBulkSpiritStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const bs = computed(() => bulkSpiritStore.getBulkSpiritById(props.bulkSpiritId));
    function batchLabel(batchId) {
      const batch = batchStore.getBatchById(batchId);
      if (!batch) return batchId;
      const recipe = recipeStore.getRecipeById(batch.recipe);
      return recipe?.name ? `${recipe.name} #${batch.batchNumber || batch._id.slice(-4)}` : `Batch #${batch.batchNumber || batch._id.slice(-4)}`;
    }
    function shortUnit(unit) {
      return unit.replace(/gallon/i, "gal").replace(/liter/i, "L");
    }
    function formatDate(d) {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    const ledgerEntries = computed(() => {
      if (!bs.value) return [];
      const entries = [];
      for (const d of bs.value.deposits || []) {
        entries.push({ type: "deposit", ...d });
      }
      for (const w of bs.value.withdrawals || []) {
        entries.push({ type: "withdrawal", ...w });
      }
      return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      if (unref(bs)) {
        _push(`<div${ssrRenderAttrs(_attrs)}><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-3">${ssrInterpolate(unref(bs).name)} — Ledger </h3>`);
        if (unref(ledgerEntries).length === 0) {
          _push(`<div class="text-sm text-parchment/50"> No transactions yet. </div>`);
        } else {
          _push(`<div class="space-y-1.5"><!--[-->`);
          ssrRenderList(unref(ledgerEntries), (entry, idx) => {
            _push(`<div class="${ssrRenderClass([entry.type === "deposit" ? "border-green-500/20 bg-green-500/5" : "border-orange-500/20 bg-orange-500/5", "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"])}">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: entry.type === "deposit" ? "i-lucide-arrow-down-to-line" : "i-lucide-arrow-up-from-line",
              class: entry.type === "deposit" ? "text-green-400" : "text-orange-400"
            }, null, _parent));
            _push(`<span class="text-parchment/50 w-24 shrink-0">${ssrInterpolate(formatDate(entry.date))}</span><span class="text-parchment truncate flex-1">${ssrInterpolate(batchLabel(entry.batch))}</span><span class="text-parchment/70 w-24 text-right">${ssrInterpolate(entry.type === "deposit" ? "+" : "-")}${ssrInterpolate(entry.volume.toFixed(1))} ${ssrInterpolate(shortUnit(entry.volumeUnit))}</span><span class="text-parchment/70 w-20 text-right">${ssrInterpolate(entry.proofGallons.toFixed(2))} PG</span><span class="${ssrRenderClass([entry.type === "deposit" ? "text-green-400" : "text-orange-400", "w-24 text-right"])}">${ssrInterpolate(entry.type === "deposit" ? "+" : "-")}${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(entry.value))}</span></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BulkSpirit/BulkSpiritLedger.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$2, { __name: "BulkSpiritLedger" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
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
      const _component_USlideover = _sfc_main$5;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$6;
      const _component_UFormField = _sfc_main$7;
      const _component_UInput = _sfc_main$9;
      const _component_USelectMenu = _sfc_main$a;
      const _component_UTextarea = _sfc_main$b;
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelBulkSpirit.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$1, { __name: "PanelBulkSpirit" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "bulk-spirits",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const bulkSpiritStore = useBulkSpiritStore();
    const vesselStore = useVesselStore();
    const { confirm } = useDeleteConfirm();
    function vesselName(id) {
      if (!id) return "-";
      return vesselStore.getVesselById(id)?.name || "-";
    }
    function shortUnit(unit) {
      return unit.replace(/gallon/i, "gal").replace(/liter/i, "L");
    }
    const columns = [
      sortableColumn("name", "Name"),
      sortableColumn("spiritClass", "Class"),
      sortableColumn("volume", "Volume", {
        cell: ({ row }) => `${row.original.volume.toFixed(1)} ${shortUnit(row.original.volumeUnit)}`
      }),
      sortableColumn("abv", "ABV", {
        cell: ({ row }) => `${row.original.abv.toFixed(1)}%`
      }),
      sortableColumn("proofGallons", "Proof Gallons", {
        cell: ({ row }) => row.original.proofGallons.toFixed(2)
      }),
      sortableColumn("costPerProofGallon", "$/PG", {
        cell: ({ row }) => Dollar.format(row.original.costPerProofGallon)
      }),
      sortableColumn("totalValue", "Total Value", {
        cell: ({ row }) => Dollar.format(row.original.totalValue)
      }),
      {
        id: "vessel",
        header: "Vessel",
        cell: ({ row }) => vesselName(row.original.vessel)
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          return h(_sfc_main$3, {
            color: row.original.status === "active" ? "success" : "neutral",
            variant: "subtle"
          }, () => row.original.status);
        }
      },
      actionsColumn((row) => [
        {
          label: "View Ledger",
          icon: "i-lucide-scroll-text",
          onSelect() {
            showLedger.value = showLedger.value === row.original._id ? null : row.original._id;
          }
        },
        {
          label: "Edit",
          icon: "i-lucide-pencil",
          onSelect() {
            editBulkSpirit(row.original._id);
          }
        },
        {
          label: "Delete",
          variant: "danger",
          async onClick() {
            const confirmed = await confirm("Bulk Spirit", row.original.name);
            if (confirmed) {
              await bulkSpiritStore.deleteBulkSpirit(row.original._id);
            }
          }
        }
      ])
    ];
    const showPanel = ref(false);
    const showLedger = ref(null);
    function newBulkSpirit() {
      bulkSpiritStore.resetBulkSpirit();
      showPanel.value = true;
    }
    function editBulkSpirit(id) {
      bulkSpiritStore.setBulkSpirit(id);
      showPanel.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_UTable = _sfc_main$4;
      const _component_BaseEmptyState = __nuxt_component_6$1;
      const _component_BulkSpiritLedger = __nuxt_component_5;
      const _component_PanelBulkSpirit = __nuxt_component_6;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Bulk Spirits",
        subtitle: "Manage stored base spirits for blending and production",
        icon: "i-lucide-archive"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: newBulkSpirit
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` New Bulk Spirit `);
                } else {
                  return [
                    createTextVNode(" New Bulk Spirit ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-plus",
                onClick: newBulkSpirit
              }, {
                default: withCtx(() => [
                  createTextVNode(" New Bulk Spirit ")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"><div class="rounded-xl border border-brown/30 bg-charcoal p-4"><div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Active Spirits</div><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(bulkSpiritStore).activeBulkSpirits.length)}</div></div><div class="rounded-xl border border-brown/30 bg-charcoal p-4"><div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Volume</div><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(bulkSpiritStore).activeBulkSpirits.reduce((sum, bs) => sum + bs.volume, 0).toFixed(1))} gal </div></div><div class="rounded-xl border border-brown/30 bg-charcoal p-4"><div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Proof Gallons</div><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(bulkSpiritStore).activeBulkSpirits.reduce((sum, bs) => sum + bs.proofGallons, 0).toFixed(2))}</div></div><div class="rounded-xl border border-brown/30 bg-charcoal p-4"><div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Value</div><div class="text-2xl font-bold text-gold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(bulkSpiritStore).activeBulkSpirits.reduce((sum, bs) => sum + bs.totalValue, 0)))}</div></div></div><div class="rounded-xl border border-brown/30 bg-charcoal overflow-hidden">`);
      _push(ssrRenderComponent(_component_UTable, {
        data: unref(bulkSpiritStore).bulkSpirits,
        columns,
        loading: unref(bulkSpiritStore).loading,
        class: "w-full"
      }, {
        empty: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_BaseEmptyState, {
              icon: "i-lucide-archive",
              title: "No bulk spirits",
              description: "Create a bulk spirit entry to start tracking stored spirits",
              "action-label": "New Bulk Spirit",
              onAction: newBulkSpirit
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_BaseEmptyState, {
                icon: "i-lucide-archive",
                title: "No bulk spirits",
                description: "Create a bulk spirit entry to start tracking stored spirits",
                "action-label": "New Bulk Spirit",
                onAction: newBulkSpirit
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(showLedger)) {
        _push(`<div class="mt-6 rounded-xl border border-brown/30 bg-charcoal p-4">`);
        _push(ssrRenderComponent(_component_BulkSpiritLedger, { "bulk-spirit-id": unref(showLedger) }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showPanel)) {
        _push(ssrRenderComponent(_component_PanelBulkSpirit, {
          onClose: ($event) => showPanel.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/bulk-spirits.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=bulk-spirits-DqD7yhHb.mjs.map

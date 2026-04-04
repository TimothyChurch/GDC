import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$2 } from './Form-B0crAOcM.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './SelectMenu-DljUyjmT.mjs';
import { _ as __nuxt_component_6 } from './BaseQuantityInput-Bo8QfULy.mjs';
import { v as volumeUnits } from './units-DWysHFem.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, watch, mergeProps, unref, withCtx, createVNode, toDisplayString, createTextVNode, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import * as yup from 'yup';
import { a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useFormPanel } from './useFormPanel-DspW7Iuy.mjs';
import { r as recipePrice } from './helpers-pfHQ8kqT.mjs';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
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
import './Input-Fd8Vd_4J.mjs';
import './FieldGroup-bwPzB93U.mjs';
import './Select-xxK8NqZT.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useProductionStore-SZxhegcf.mjs';
import './useBottleStore-NPRWrMTA.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelBatch",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const batchStore = useBatchStore();
    const schema = yup.object({
      recipe: yup.string().required("Recipe is required"),
      batchSize: yup.number().positive("Must be positive").required("Batch size is required"),
      batchSizeUnit: yup.string().required("Unit is required")
    });
    const recipeStore = useRecipeStore();
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => batchStore.batch,
      async onSave(data) {
        const recipe2 = recipeStore.getRecipeById(data.recipe);
        if (!data.recipeCost && data.recipe)
          data.recipeCost = recipePrice(data.recipe);
        if (recipe2?.volume && data.batchSize && recipe2.volumeUnit && data.batchSizeUnit) {
          const scaling = convertUnitRatio(recipe2.volumeUnit, data.batchSizeUnit);
          data.batchCost = recipePrice(recipe2) * (data.batchSize / recipe2.volume) / scaling || 0;
        }
        const oldSize = batchStore.batch.batchSize;
        const newSize = data.batchSize;
        if (oldSize && newSize && oldSize !== newSize && batchStore.batch.stageVolumes) {
          const ratio = newSize / oldSize;
          const oldVolumes = { ...batchStore.batch.stageVolumes };
          const rescaled = {};
          for (const [stage, vol] of Object.entries(oldVolumes)) {
            if (vol > 0) {
              rescaled[stage] = Math.round(vol * ratio * 1e3) / 1e3;
            }
          }
          data.stageVolumes = rescaled;
          if (!batchStore.batch.log) batchStore.batch.log = [];
          const unit = data.batchSizeUnit || batchStore.batch.batchSizeUnit || "gal";
          batchStore.batch.log.push({
            date: /* @__PURE__ */ new Date(),
            action: `Batch resized from ${oldSize} to ${newSize} ${unit}`,
            details: "Stage volumes rescaled proportionally"
          });
        }
        Object.assign(batchStore.batch, data);
        await batchStore.updateBatch();
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    const price = computed(() => {
      return localData.value.recipe ? Dollar.format(recipePrice(localData.value.recipe)) : Dollar.format(0);
    });
    const recipe = computed(
      () => recipeStore.getRecipeById(localData.value.recipe)
    );
    watch(
      () => localData.value.recipe,
      (newRecipeId) => {
        if (!newRecipeId || !isNew) return;
        const r = recipeStore.getRecipeById(newRecipeId);
        if (r?.pipeline?.length) {
          localData.value.pipeline = [...r.pipeline];
          localData.value.pipelineTemplate = r.pipelineTemplate;
        }
      }
    );
    const scaledPrice = computed(() => {
      if (!recipe.value?.volume || !localData.value.batchSize) return 0;
      const scaling = convertUnitRatio(recipe.value.volumeUnit, localData.value.batchSizeUnit) || 1;
      return recipePrice(recipe.value) * (localData.value.batchSize / recipe.value.volume) / scaling || 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$2;
      const _component_UFormField = _sfc_main$3;
      const _component_USelectMenu = _sfc_main$4;
      const _component_BaseQuantityInput = __nuxt_component_6;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Batch" : "Edit Batch")}</h2>`);
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
                  _push3(`<div class="flex flex-col overflow-y-auto p-4 space-y-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Recipe",
                    name: "recipe",
                    class: "w-full"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(localData).recipe,
                          "onUpdate:modelValue": ($event) => unref(localData).recipe = $event,
                          items: unref(recipeStore).recipes.map((r) => ({
                            label: r.name,
                            value: r._id
                          })),
                          "value-key": "value",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).recipe,
                            "onUpdate:modelValue": ($event) => unref(localData).recipe = $event,
                            items: unref(recipeStore).recipes.map((r) => ({
                              label: r.name,
                              value: r._id
                            })),
                            "value-key": "value",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Recipe Cost" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="text-sm"${_scopeId3}>${ssrInterpolate(unref(price))}</span>`);
                      } else {
                        return [
                          createVNode("span", { class: "text-sm" }, toDisplayString(unref(price)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Batch Size",
                    name: "batchSize"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_BaseQuantityInput, {
                          value: unref(localData).batchSize,
                          "onUpdate:value": ($event) => unref(localData).batchSize = $event,
                          unit: unref(localData).batchSizeUnit,
                          "onUpdate:unit": ($event) => unref(localData).batchSizeUnit = $event,
                          "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                          placeholder: "Volume"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).batchSize,
                            "onUpdate:value": ($event) => unref(localData).batchSize = $event,
                            unit: unref(localData).batchSizeUnit,
                            "onUpdate:unit": ($event) => unref(localData).batchSizeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                            placeholder: "Volume"
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Batch Cost" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="text-sm"${_scopeId3}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(scaledPrice)))}</span>`);
                      } else {
                        return [
                          createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(scaledPrice))), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (unref(localData).pipeline?.length) {
                    _push3(`<div class="space-y-1.5"${_scopeId2}><div class="text-xs text-parchment/60 uppercase tracking-wider"${_scopeId2}> Pipeline </div><div class="flex flex-wrap gap-1"${_scopeId2}><!--[-->`);
                    ssrRenderList(unref(localData).pipeline, (stage) => {
                      _push3(`<span class="text-xs px-2 py-0.5 rounded border border-brown/30 text-parchment/60"${_scopeId2}>${ssrInterpolate(stage)}</span>`);
                    });
                    _push3(`<!--]--></div></div>`);
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
                    createVNode("div", { class: "flex flex-col overflow-y-auto p-4 space-y-4" }, [
                      createVNode(_component_UFormField, {
                        label: "Recipe",
                        name: "recipe",
                        class: "w-full"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).recipe,
                            "onUpdate:modelValue": ($event) => unref(localData).recipe = $event,
                            items: unref(recipeStore).recipes.map((r) => ({
                              label: r.name,
                              value: r._id
                            })),
                            "value-key": "value",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Recipe Cost" }, {
                        default: withCtx(() => [
                          createVNode("span", { class: "text-sm" }, toDisplayString(unref(price)), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Batch Size",
                        name: "batchSize"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).batchSize,
                            "onUpdate:value": ($event) => unref(localData).batchSize = $event,
                            unit: unref(localData).batchSizeUnit,
                            "onUpdate:unit": ($event) => unref(localData).batchSizeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                            placeholder: "Volume"
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Batch Cost" }, {
                        default: withCtx(() => [
                          createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(scaledPrice))), 1)
                        ]),
                        _: 1
                      }),
                      unref(localData).pipeline?.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "space-y-1.5"
                      }, [
                        createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, " Pipeline "),
                        createVNode("div", { class: "flex flex-wrap gap-1" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).pipeline, (stage) => {
                            return openBlock(), createBlock("span", {
                              key: stage,
                              class: "text-xs px-2 py-0.5 rounded border border-brown/30 text-parchment/60"
                            }, toDisplayString(stage), 1);
                          }), 128))
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
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Batch" : "Edit Batch"), 1),
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
                    createVNode("div", { class: "flex flex-col overflow-y-auto p-4 space-y-4" }, [
                      createVNode(_component_UFormField, {
                        label: "Recipe",
                        name: "recipe",
                        class: "w-full"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).recipe,
                            "onUpdate:modelValue": ($event) => unref(localData).recipe = $event,
                            items: unref(recipeStore).recipes.map((r) => ({
                              label: r.name,
                              value: r._id
                            })),
                            "value-key": "value",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Recipe Cost" }, {
                        default: withCtx(() => [
                          createVNode("span", { class: "text-sm" }, toDisplayString(unref(price)), 1)
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Batch Size",
                        name: "batchSize"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).batchSize,
                            "onUpdate:value": ($event) => unref(localData).batchSize = $event,
                            unit: unref(localData).batchSizeUnit,
                            "onUpdate:unit": ($event) => unref(localData).batchSizeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                            placeholder: "Volume"
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Batch Cost" }, {
                        default: withCtx(() => [
                          createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(scaledPrice))), 1)
                        ]),
                        _: 1
                      }),
                      unref(localData).pipeline?.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "space-y-1.5"
                      }, [
                        createVNode("div", { class: "text-xs text-parchment/60 uppercase tracking-wider" }, " Pipeline "),
                        createVNode("div", { class: "flex flex-wrap gap-1" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).pipeline, (stage) => {
                            return openBlock(), createBlock("span", {
                              key: stage,
                              class: "text-xs px-2 py-0.5 rounded border border-brown/30 text-parchment/60"
                            }, toDisplayString(stage), 1);
                          }), 128))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelBatch.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "PanelBatch" });

export { __nuxt_component_0 as default };
//# sourceMappingURL=PanelBatch-B7qrC1Ly.mjs.map

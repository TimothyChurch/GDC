import { _ as _sfc_main$2 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$3 } from './Form-DifyhlgS.mjs';
import { _ as _sfc_main$4 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$5 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$6 } from './SelectMenu-DljUyjmT.mjs';
import { _ as __nuxt_component_6 } from './BaseQuantityInput-Bo8QfULy.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, createTextVNode, createCommentVNode, useModel, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttrs, ssrRenderClass } from 'vue/server-renderer';
import { k as getAvailableStages, s as stageBgColor, e as stageTextColor, P as PIPELINE_TEMPLATES, c as STAGE_DISPLAY } from './batchPipeline-Dr1IalWc.mjs';
import { _ as _sfc_main$7 } from './Textarea-f7RIzcnS.mjs';
import { l as liquorClasses } from './definitions-C7fnFA_u.mjs';
import { v as volumeUnits, b as allUnits } from './units-DWysHFem.mjs';
import * as yup from 'yup';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useFormPanel } from './useFormPanel-DspW7Iuy.mjs';
import { u as useBulkSpiritStore } from './useBulkSpiritStore-Bx2u4RsR.mjs';
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
import './FieldGroup-bwPzB93U.mjs';
import './Select-xxK8NqZT.mjs';
import './conversions-t0mnZFvt.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';
import './proofGallons--xmqBsFG.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "RecipePipelineBuilder",
  __ssrInlineRender: true,
  props: {
    "modelValue": { required: true },
    "modelModifiers": {},
    "template": {},
    "templateModifiers": {}
  },
  emits: ["update:modelValue", "update:template"],
  setup(__props) {
    const pipeline = useModel(__props, "modelValue");
    const pipelineTemplate = useModel(__props, "template");
    const templateOptions = Object.keys(PIPELINE_TEMPLATES);
    const selectTemplate = (name) => {
      pipelineTemplate.value = name;
      if (name === "Custom") {
        pipeline.value = [];
      } else {
        pipeline.value = [...PIPELINE_TEMPLATES[name]];
      }
    };
    const availableStages = computed(() => getAvailableStages(pipeline.value));
    const addStage = (stage) => {
      const current = [...pipeline.value];
      const bottledIdx = current.indexOf("Bottled");
      if (stage !== "Bottled" && bottledIdx >= 0) {
        current.splice(bottledIdx, 0, stage);
      } else {
        current.push(stage);
      }
      pipeline.value = current;
      pipelineTemplate.value = "Custom";
    };
    const removeStage = (index) => {
      const current = [...pipeline.value];
      if (current.length <= 1) return;
      current.splice(index, 1);
      pipeline.value = current;
      pipelineTemplate.value = "Custom";
    };
    const moveStage = (index, direction) => {
      const current = [...pipeline.value];
      const targetIdx = index + direction;
      if (targetIdx < 0 || targetIdx >= current.length) return;
      [current[index], current[targetIdx]] = [current[targetIdx], current[index]];
      pipeline.value = current;
      pipelineTemplate.value = "Custom";
    };
    const dragIndex = ref(null);
    const display = (name) => STAGE_DISPLAY[name] || { icon: "i-lucide-circle", color: "neutral" };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UFormField = _sfc_main$4;
      const _component_USelectMenu = _sfc_main$6;
      const _component_UIcon = _sfc_main$e;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UFormField, { label: "Pipeline Template" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_USelectMenu, {
              "model-value": pipelineTemplate.value || "",
              items: unref(templateOptions),
              placeholder: "Select a template...",
              "onUpdate:modelValue": selectTemplate
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_USelectMenu, {
                "model-value": pipelineTemplate.value || "",
                items: unref(templateOptions),
                placeholder: "Select a template...",
                "onUpdate:modelValue": selectTemplate
              }, null, 8, ["model-value", "items"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (pipeline.value?.length > 0) {
        _push(`<div class="space-y-1.5"><div class="text-xs text-parchment/60 uppercase tracking-wider"> Pipeline Stages </div><div class="space-y-1"><!--[-->`);
        ssrRenderList(pipeline.value, (stage, index) => {
          _push(`<div draggable="true" class="${ssrRenderClass([[
            unref(stageBgColor)(display(stage).color),
            unref(dragIndex) === index ? "opacity-50" : ""
          ], "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing"])}">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-grip-vertical",
            class: "text-parchment/50 shrink-0"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UIcon, {
            name: display(stage).icon,
            class: [unref(stageTextColor)(display(stage).color), "shrink-0"]
          }, null, _parent));
          _push(`<span class="text-sm text-parchment flex-1">${ssrInterpolate(stage)}</span><span class="text-[10px] text-parchment/60 tabular-nums">${ssrInterpolate(index + 1)}</span><div class="flex items-center gap-0.5">`);
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-chevron-up",
            color: "neutral",
            variant: "ghost",
            size: "sm",
            disabled: index === 0,
            onClick: ($event) => moveStage(index, -1)
          }, null, _parent));
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-chevron-down",
            color: "neutral",
            variant: "ghost",
            size: "2xs",
            disabled: index >= pipeline.value.length - 1,
            onClick: ($event) => moveStage(index, 1)
          }, null, _parent));
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-x",
            color: "error",
            variant: "ghost",
            size: "sm",
            disabled: pipeline.value.length <= 1,
            onClick: ($event) => removeStage(index)
          }, null, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<div class="text-center py-6 rounded-lg border border-dashed border-brown/30">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-route",
          class: "text-2xl text-parchment/20 mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50"> Select a template or add stages below </p></div>`);
      }
      if (unref(availableStages).length > 0) {
        _push(`<div class="space-y-1.5"><div class="text-xs text-parchment/60 uppercase tracking-wider"> Add Stage </div><div class="flex flex-wrap gap-1.5"><!--[-->`);
        ssrRenderList(unref(availableStages), (stage) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: stage,
            size: "xs",
            color: "neutral",
            variant: "outline",
            onClick: ($event) => addStage(stage)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: display(stage).icon,
                  class: unref(stageTextColor)(display(stage).color)
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(stage)}`);
              } else {
                return [
                  createVNode(_component_UIcon, {
                    name: display(stage).icon,
                    class: unref(stageTextColor)(display(stage).color)
                  }, null, 8, ["name", "class"]),
                  createTextVNode(" " + toDisplayString(stage), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Recipe/RecipePipelineBuilder.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_7 = Object.assign(_sfc_main$1, { __name: "RecipePipelineBuilder" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelRecipe",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const recipeStore = useRecipeStore();
    const schema = yup.object({
      name: yup.string().required("Name is required"),
      class: yup.string().required("Class is required"),
      volume: yup.number().positive("Must be positive").required("Volume is required"),
      volumeUnit: yup.string().required("Volume unit is required")
    });
    const itemStore = useItemStore();
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => recipeStore.recipe,
      async onSave(data) {
        Object.assign(recipeStore.recipe, data);
        await recipeStore.updateRecipe();
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    const types = computed(() => {
      return liquorClasses.filter((l) => l.class === localData.value.class)[0]?.types || [];
    });
    const bulkSpiritStore = useBulkSpiritStore();
    const newItem = ref({
      _id: null,
      amount: null,
      unit: null
    });
    const newBulkSpirit = ref({
      bulkSpirit: "",
      volume: null,
      volumeUnit: "gallon"
    });
    const addBulkSpirit = () => {
      if (!localData.value.bulkSpirits) localData.value.bulkSpirits = [];
      localData.value.bulkSpirits.push({ ...newBulkSpirit.value });
      newBulkSpirit.value = { bulkSpirit: "", volume: 0, volumeUnit: "gallon" };
    };
    const removeBulkSpirit = (idx) => {
      localData.value.bulkSpirits?.splice(idx, 1);
    };
    const bulkSpiritOptions = computed(
      () => bulkSpiritStore.activeBulkSpirits.map((bs) => ({ label: bs.name, value: bs._id }))
    );
    const addItem = () => {
      localData.value.items.push({ ...newItem.value });
      newItem.value = { _id: "", amount: 0, unit: "" };
    };
    const removeItem = (itemId) => {
      localData.value.items = localData.value.items.filter(
        (i) => i._id !== itemId
      );
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$2;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$3;
      const _component_UFormField = _sfc_main$4;
      const _component_UInput = _sfc_main$5;
      const _component_USelectMenu = _sfc_main$6;
      const _component_BaseQuantityInput = __nuxt_component_6;
      const _component_RecipePipelineBuilder = __nuxt_component_7;
      const _component_UTextarea = _sfc_main$7;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Recipe" : "Edit Recipe")}</h2>`);
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
                          placeholder: "Recipe name",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).name,
                            "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                            placeholder: "Recipe name",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="grid grid-cols-2 gap-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Class",
                    name: "class"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(localData).class,
                          "onUpdate:modelValue": ($event) => unref(localData).class = $event,
                          items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).map((c) => ({ label: c.class, value: c.class })),
                          "value-key": "value",
                          placeholder: "Select Class",
                          searchable: "",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).class,
                            "onUpdate:modelValue": ($event) => unref(localData).class = $event,
                            items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).map((c) => ({ label: c.class, value: c.class })),
                            "value-key": "value",
                            placeholder: "Select Class",
                            searchable: "",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Type" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(localData).type,
                          "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                          items: unref(types).map((t) => ({ label: t.type, value: t.type })),
                          "value-key": "value",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: unref(types).map((t) => ({ label: t.type, value: t.type })),
                            "value-key": "value",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Volume",
                    name: "volume"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_BaseQuantityInput, {
                          value: unref(localData).volume,
                          "onUpdate:value": ($event) => unref(localData).volume = $event,
                          unit: unref(localData).volumeUnit,
                          "onUpdate:unit": ($event) => unref(localData).volumeUnit = $event,
                          "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                          placeholder: "Volume"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).volume,
                            "onUpdate:value": ($event) => unref(localData).volume = $event,
                            unit: unref(localData).volumeUnit,
                            "onUpdate:unit": ($event) => unref(localData).volumeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                            placeholder: "Volume"
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Ingredients" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="space-y-2"${_scopeId3}><!--[-->`);
                        ssrRenderList(unref(localData).items, (item, idx) => {
                          _push4(`<div class="grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"${_scopeId3}><span class="text-sm truncate text-parchment"${_scopeId3}>${ssrInterpolate(unref(itemStore).nameById(item._id))}</span>`);
                          _push4(ssrRenderComponent(_component_UInput, {
                            modelValue: unref(localData).items[idx].amount,
                            "onUpdate:modelValue": ($event) => unref(localData).items[idx].amount = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            size: "xs",
                            step: "any",
                            min: "0"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(_component_USelectMenu, {
                            modelValue: unref(localData).items[idx].unit,
                            "onUpdate:modelValue": ($event) => unref(localData).items[idx].unit = $event,
                            items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                            size: "xs"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(_component_UButton, {
                            icon: "i-lucide-trash-2",
                            color: "error",
                            variant: "ghost",
                            size: "xs",
                            onClick: ($event) => removeItem(item._id)
                          }, null, _parent4, _scopeId3));
                          _push4(`</div>`);
                        });
                        _push4(`<!--]--><div class="grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(newItem)._id,
                          "onUpdate:modelValue": ($event) => unref(newItem)._id = $event,
                          items: unref(itemStore).items.map((i) => ({
                            label: i.name,
                            value: i._id
                          })),
                          "value-key": "value",
                          placeholder: "Add item...",
                          searchable: "",
                          size: "xs"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(newItem).amount,
                          "onUpdate:modelValue": ($event) => unref(newItem).amount = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          placeholder: "Amt",
                          size: "xs",
                          step: "any",
                          min: "0"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(newItem).unit,
                          "onUpdate:modelValue": ($event) => unref(newItem).unit = $event,
                          items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                          placeholder: "Unit",
                          size: "xs"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UButton, {
                          icon: "i-lucide-plus",
                          size: "xs",
                          disabled: !unref(newItem)._id || !unref(newItem).amount || !unref(newItem).unit,
                          onClick: addItem
                        }, null, _parent4, _scopeId3));
                        _push4(`</div></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).items, (item, idx) => {
                              return openBlock(), createBlock("div", {
                                key: item._id + "-" + idx,
                                class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"
                              }, [
                                createVNode("span", { class: "text-sm truncate text-parchment" }, toDisplayString(unref(itemStore).nameById(item._id)), 1),
                                createVNode(_component_UInput, {
                                  modelValue: unref(localData).items[idx].amount,
                                  "onUpdate:modelValue": ($event) => unref(localData).items[idx].amount = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  size: "xs",
                                  step: "any",
                                  min: "0"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelectMenu, {
                                  modelValue: unref(localData).items[idx].unit,
                                  "onUpdate:modelValue": ($event) => unref(localData).items[idx].unit = $event,
                                  items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeItem(item._id)
                                }, null, 8, ["onClick"])
                              ]);
                            }), 128)),
                            createVNode("div", { class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10" }, [
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newItem)._id,
                                "onUpdate:modelValue": ($event) => unref(newItem)._id = $event,
                                items: unref(itemStore).items.map((i) => ({
                                  label: i.name,
                                  value: i._id
                                })),
                                "value-key": "value",
                                placeholder: "Add item...",
                                searchable: "",
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newItem).amount,
                                "onUpdate:modelValue": ($event) => unref(newItem).amount = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                placeholder: "Amt",
                                size: "xs",
                                step: "any",
                                min: "0"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newItem).unit,
                                "onUpdate:modelValue": ($event) => unref(newItem).unit = $event,
                                items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                placeholder: "Unit",
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UButton, {
                                icon: "i-lucide-plus",
                                size: "xs",
                                disabled: !unref(newItem)._id || !unref(newItem).amount || !unref(newItem).unit,
                                onClick: addItem
                              }, null, 8, ["disabled"])
                            ])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (unref(bulkSpiritOptions).length > 0 || unref(localData).bulkSpirits && unref(localData).bulkSpirits.length > 0) {
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Bulk Spirits" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="space-y-2"${_scopeId3}><!--[-->`);
                          ssrRenderList(unref(localData).bulkSpirits || [], (bs, idx) => {
                            _push4(`<div class="grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"${_scopeId3}><span class="text-sm truncate text-parchment"${_scopeId3}>${ssrInterpolate(unref(bulkSpiritStore).getBulkSpiritById(bs.bulkSpirit)?.name || "Unknown")}</span>`);
                            _push4(ssrRenderComponent(_component_UInput, {
                              modelValue: unref(localData).bulkSpirits[idx].volume,
                              "onUpdate:modelValue": ($event) => unref(localData).bulkSpirits[idx].volume = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              size: "xs",
                              step: "any",
                              min: "0"
                            }, null, _parent4, _scopeId3));
                            _push4(ssrRenderComponent(_component_USelectMenu, {
                              modelValue: unref(localData).bulkSpirits[idx].volumeUnit,
                              "onUpdate:modelValue": ($event) => unref(localData).bulkSpirits[idx].volumeUnit = $event,
                              items: "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                              size: "xs"
                            }, null, _parent4, _scopeId3));
                            _push4(ssrRenderComponent(_component_UButton, {
                              icon: "i-lucide-trash-2",
                              color: "error",
                              variant: "ghost",
                              size: "xs",
                              onClick: ($event) => removeBulkSpirit(idx)
                            }, null, _parent4, _scopeId3));
                            _push4(`</div>`);
                          });
                          _push4(`<!--]--><div class="grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10"${_scopeId3}>`);
                          _push4(ssrRenderComponent(_component_USelectMenu, {
                            modelValue: unref(newBulkSpirit).bulkSpirit,
                            "onUpdate:modelValue": ($event) => unref(newBulkSpirit).bulkSpirit = $event,
                            items: unref(bulkSpiritOptions),
                            "value-key": "value",
                            placeholder: "Add bulk spirit...",
                            searchable: "",
                            size: "xs"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(_component_UInput, {
                            modelValue: unref(newBulkSpirit).volume,
                            "onUpdate:modelValue": ($event) => unref(newBulkSpirit).volume = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            placeholder: "Vol",
                            size: "xs",
                            step: "any",
                            min: "0"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(_component_USelectMenu, {
                            modelValue: unref(newBulkSpirit).volumeUnit,
                            "onUpdate:modelValue": ($event) => unref(newBulkSpirit).volumeUnit = $event,
                            items: "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                            size: "xs"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(_component_UButton, {
                            icon: "i-lucide-plus",
                            size: "xs",
                            disabled: !unref(newBulkSpirit).bulkSpirit || !unref(newBulkSpirit).volume,
                            onClick: addBulkSpirit
                          }, null, _parent4, _scopeId3));
                          _push4(`</div></div>`);
                        } else {
                          return [
                            createVNode("div", { class: "space-y-2" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).bulkSpirits || [], (bs, idx) => {
                                return openBlock(), createBlock("div", {
                                  key: bs.bulkSpirit + "-" + idx,
                                  class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"
                                }, [
                                  createVNode("span", { class: "text-sm truncate text-parchment" }, toDisplayString(unref(bulkSpiritStore).getBulkSpiritById(bs.bulkSpirit)?.name || "Unknown"), 1),
                                  createVNode(_component_UInput, {
                                    modelValue: unref(localData).bulkSpirits[idx].volume,
                                    "onUpdate:modelValue": ($event) => unref(localData).bulkSpirits[idx].volume = $event,
                                    modelModifiers: { number: true },
                                    type: "number",
                                    size: "xs",
                                    step: "any",
                                    min: "0"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                  createVNode(_component_USelectMenu, {
                                    modelValue: unref(localData).bulkSpirits[idx].volumeUnit,
                                    "onUpdate:modelValue": ($event) => unref(localData).bulkSpirits[idx].volumeUnit = $event,
                                    items: "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                                    size: "xs"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                  createVNode(_component_UButton, {
                                    icon: "i-lucide-trash-2",
                                    color: "error",
                                    variant: "ghost",
                                    size: "xs",
                                    onClick: ($event) => removeBulkSpirit(idx)
                                  }, null, 8, ["onClick"])
                                ]);
                              }), 128)),
                              createVNode("div", { class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10" }, [
                                createVNode(_component_USelectMenu, {
                                  modelValue: unref(newBulkSpirit).bulkSpirit,
                                  "onUpdate:modelValue": ($event) => unref(newBulkSpirit).bulkSpirit = $event,
                                  items: unref(bulkSpiritOptions),
                                  "value-key": "value",
                                  placeholder: "Add bulk spirit...",
                                  searchable: "",
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UInput, {
                                  modelValue: unref(newBulkSpirit).volume,
                                  "onUpdate:modelValue": ($event) => unref(newBulkSpirit).volume = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  placeholder: "Vol",
                                  size: "xs",
                                  step: "any",
                                  min: "0"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelectMenu, {
                                  modelValue: unref(newBulkSpirit).volumeUnit,
                                  "onUpdate:modelValue": ($event) => unref(newBulkSpirit).volumeUnit = $event,
                                  items: "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-plus",
                                  size: "xs",
                                  disabled: !unref(newBulkSpirit).bulkSpirit || !unref(newBulkSpirit).volume,
                                  onClick: addBulkSpirit
                                }, null, 8, ["disabled"])
                              ])
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(_component_RecipePipelineBuilder, {
                    modelValue: unref(localData).pipeline,
                    "onUpdate:modelValue": ($event) => unref(localData).pipeline = $event,
                    template: unref(localData).pipelineTemplate,
                    "onUpdate:template": ($event) => unref(localData).pipelineTemplate = $event
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Directions" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UTextarea, {
                          modelValue: unref(localData).directions,
                          "onUpdate:modelValue": ($event) => unref(localData).directions = $event
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).directions,
                            "onUpdate:modelValue": ($event) => unref(localData).directions = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
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
                            placeholder: "Recipe name",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Class",
                          name: "class"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).class,
                              "onUpdate:modelValue": ($event) => unref(localData).class = $event,
                              items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).map((c) => ({ label: c.class, value: c.class })),
                              "value-key": "value",
                              placeholder: "Select Class",
                              searchable: "",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Type" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).type,
                              "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                              items: unref(types).map((t) => ({ label: t.type, value: t.type })),
                              "value-key": "value",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_UFormField, {
                        label: "Volume",
                        name: "volume"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).volume,
                            "onUpdate:value": ($event) => unref(localData).volume = $event,
                            unit: unref(localData).volumeUnit,
                            "onUpdate:unit": ($event) => unref(localData).volumeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                            placeholder: "Volume"
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Ingredients" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).items, (item, idx) => {
                              return openBlock(), createBlock("div", {
                                key: item._id + "-" + idx,
                                class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"
                              }, [
                                createVNode("span", { class: "text-sm truncate text-parchment" }, toDisplayString(unref(itemStore).nameById(item._id)), 1),
                                createVNode(_component_UInput, {
                                  modelValue: unref(localData).items[idx].amount,
                                  "onUpdate:modelValue": ($event) => unref(localData).items[idx].amount = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  size: "xs",
                                  step: "any",
                                  min: "0"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelectMenu, {
                                  modelValue: unref(localData).items[idx].unit,
                                  "onUpdate:modelValue": ($event) => unref(localData).items[idx].unit = $event,
                                  items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeItem(item._id)
                                }, null, 8, ["onClick"])
                              ]);
                            }), 128)),
                            createVNode("div", { class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10" }, [
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newItem)._id,
                                "onUpdate:modelValue": ($event) => unref(newItem)._id = $event,
                                items: unref(itemStore).items.map((i) => ({
                                  label: i.name,
                                  value: i._id
                                })),
                                "value-key": "value",
                                placeholder: "Add item...",
                                searchable: "",
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newItem).amount,
                                "onUpdate:modelValue": ($event) => unref(newItem).amount = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                placeholder: "Amt",
                                size: "xs",
                                step: "any",
                                min: "0"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newItem).unit,
                                "onUpdate:modelValue": ($event) => unref(newItem).unit = $event,
                                items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                placeholder: "Unit",
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UButton, {
                                icon: "i-lucide-plus",
                                size: "xs",
                                disabled: !unref(newItem)._id || !unref(newItem).amount || !unref(newItem).unit,
                                onClick: addItem
                              }, null, 8, ["disabled"])
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      unref(bulkSpiritOptions).length > 0 || unref(localData).bulkSpirits && unref(localData).bulkSpirits.length > 0 ? (openBlock(), createBlock(_component_UFormField, {
                        key: 0,
                        label: "Bulk Spirits"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).bulkSpirits || [], (bs, idx) => {
                              return openBlock(), createBlock("div", {
                                key: bs.bulkSpirit + "-" + idx,
                                class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"
                              }, [
                                createVNode("span", { class: "text-sm truncate text-parchment" }, toDisplayString(unref(bulkSpiritStore).getBulkSpiritById(bs.bulkSpirit)?.name || "Unknown"), 1),
                                createVNode(_component_UInput, {
                                  modelValue: unref(localData).bulkSpirits[idx].volume,
                                  "onUpdate:modelValue": ($event) => unref(localData).bulkSpirits[idx].volume = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  size: "xs",
                                  step: "any",
                                  min: "0"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelectMenu, {
                                  modelValue: unref(localData).bulkSpirits[idx].volumeUnit,
                                  "onUpdate:modelValue": ($event) => unref(localData).bulkSpirits[idx].volumeUnit = $event,
                                  items: "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeBulkSpirit(idx)
                                }, null, 8, ["onClick"])
                              ]);
                            }), 128)),
                            createVNode("div", { class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10" }, [
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newBulkSpirit).bulkSpirit,
                                "onUpdate:modelValue": ($event) => unref(newBulkSpirit).bulkSpirit = $event,
                                items: unref(bulkSpiritOptions),
                                "value-key": "value",
                                placeholder: "Add bulk spirit...",
                                searchable: "",
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newBulkSpirit).volume,
                                "onUpdate:modelValue": ($event) => unref(newBulkSpirit).volume = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                placeholder: "Vol",
                                size: "xs",
                                step: "any",
                                min: "0"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newBulkSpirit).volumeUnit,
                                "onUpdate:modelValue": ($event) => unref(newBulkSpirit).volumeUnit = $event,
                                items: "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UButton, {
                                icon: "i-lucide-plus",
                                size: "xs",
                                disabled: !unref(newBulkSpirit).bulkSpirit || !unref(newBulkSpirit).volume,
                                onClick: addBulkSpirit
                              }, null, 8, ["disabled"])
                            ])
                          ])
                        ]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(_component_RecipePipelineBuilder, {
                        modelValue: unref(localData).pipeline,
                        "onUpdate:modelValue": ($event) => unref(localData).pipeline = $event,
                        template: unref(localData).pipelineTemplate,
                        "onUpdate:template": ($event) => unref(localData).pipelineTemplate = $event
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "template", "onUpdate:template"]),
                      createVNode(_component_UFormField, { label: "Directions" }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).directions,
                            "onUpdate:modelValue": ($event) => unref(localData).directions = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      })
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
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Recipe" : "Edit Recipe"), 1),
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
                            placeholder: "Recipe name",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Class",
                          name: "class"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).class,
                              "onUpdate:modelValue": ($event) => unref(localData).class = $event,
                              items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).map((c) => ({ label: c.class, value: c.class })),
                              "value-key": "value",
                              placeholder: "Select Class",
                              searchable: "",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Type" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).type,
                              "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                              items: unref(types).map((t) => ({ label: t.type, value: t.type })),
                              "value-key": "value",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_UFormField, {
                        label: "Volume",
                        name: "volume"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).volume,
                            "onUpdate:value": ($event) => unref(localData).volume = $event,
                            unit: unref(localData).volumeUnit,
                            "onUpdate:unit": ($event) => unref(localData).volumeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                            placeholder: "Volume"
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, { label: "Ingredients" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).items, (item, idx) => {
                              return openBlock(), createBlock("div", {
                                key: item._id + "-" + idx,
                                class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"
                              }, [
                                createVNode("span", { class: "text-sm truncate text-parchment" }, toDisplayString(unref(itemStore).nameById(item._id)), 1),
                                createVNode(_component_UInput, {
                                  modelValue: unref(localData).items[idx].amount,
                                  "onUpdate:modelValue": ($event) => unref(localData).items[idx].amount = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  size: "xs",
                                  step: "any",
                                  min: "0"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelectMenu, {
                                  modelValue: unref(localData).items[idx].unit,
                                  "onUpdate:modelValue": ($event) => unref(localData).items[idx].unit = $event,
                                  items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeItem(item._id)
                                }, null, 8, ["onClick"])
                              ]);
                            }), 128)),
                            createVNode("div", { class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10" }, [
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newItem)._id,
                                "onUpdate:modelValue": ($event) => unref(newItem)._id = $event,
                                items: unref(itemStore).items.map((i) => ({
                                  label: i.name,
                                  value: i._id
                                })),
                                "value-key": "value",
                                placeholder: "Add item...",
                                searchable: "",
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newItem).amount,
                                "onUpdate:modelValue": ($event) => unref(newItem).amount = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                placeholder: "Amt",
                                size: "xs",
                                step: "any",
                                min: "0"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newItem).unit,
                                "onUpdate:modelValue": ($event) => unref(newItem).unit = $event,
                                items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                                placeholder: "Unit",
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UButton, {
                                icon: "i-lucide-plus",
                                size: "xs",
                                disabled: !unref(newItem)._id || !unref(newItem).amount || !unref(newItem).unit,
                                onClick: addItem
                              }, null, 8, ["disabled"])
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      unref(bulkSpiritOptions).length > 0 || unref(localData).bulkSpirits && unref(localData).bulkSpirits.length > 0 ? (openBlock(), createBlock(_component_UFormField, {
                        key: 0,
                        label: "Bulk Spirits"
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).bulkSpirits || [], (bs, idx) => {
                              return openBlock(), createBlock("div", {
                                key: bs.bulkSpirit + "-" + idx,
                                class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center"
                              }, [
                                createVNode("span", { class: "text-sm truncate text-parchment" }, toDisplayString(unref(bulkSpiritStore).getBulkSpiritById(bs.bulkSpirit)?.name || "Unknown"), 1),
                                createVNode(_component_UInput, {
                                  modelValue: unref(localData).bulkSpirits[idx].volume,
                                  "onUpdate:modelValue": ($event) => unref(localData).bulkSpirits[idx].volume = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  size: "xs",
                                  step: "any",
                                  min: "0"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelectMenu, {
                                  modelValue: unref(localData).bulkSpirits[idx].volumeUnit,
                                  "onUpdate:modelValue": ($event) => unref(localData).bulkSpirits[idx].volumeUnit = $event,
                                  items: "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeBulkSpirit(idx)
                                }, null, 8, ["onClick"])
                              ]);
                            }), 128)),
                            createVNode("div", { class: "grid grid-cols-[1fr_60px_80px_28px] gap-1.5 items-center pt-2 border-t border-white/10" }, [
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newBulkSpirit).bulkSpirit,
                                "onUpdate:modelValue": ($event) => unref(newBulkSpirit).bulkSpirit = $event,
                                items: unref(bulkSpiritOptions),
                                "value-key": "value",
                                placeholder: "Add bulk spirit...",
                                searchable: "",
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newBulkSpirit).volume,
                                "onUpdate:modelValue": ($event) => unref(newBulkSpirit).volume = $event,
                                modelModifiers: { number: true },
                                type: "number",
                                placeholder: "Vol",
                                size: "xs",
                                step: "any",
                                min: "0"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(newBulkSpirit).volumeUnit,
                                "onUpdate:modelValue": ($event) => unref(newBulkSpirit).volumeUnit = $event,
                                items: "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits),
                                size: "xs"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UButton, {
                                icon: "i-lucide-plus",
                                size: "xs",
                                disabled: !unref(newBulkSpirit).bulkSpirit || !unref(newBulkSpirit).volume,
                                onClick: addBulkSpirit
                              }, null, 8, ["disabled"])
                            ])
                          ])
                        ]),
                        _: 1
                      })) : createCommentVNode("", true),
                      createVNode(_component_RecipePipelineBuilder, {
                        modelValue: unref(localData).pipeline,
                        "onUpdate:modelValue": ($event) => unref(localData).pipeline = $event,
                        template: unref(localData).pipelineTemplate,
                        "onUpdate:template": ($event) => unref(localData).pipelineTemplate = $event
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "template", "onUpdate:template"]),
                      createVNode(_component_UFormField, { label: "Directions" }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).directions,
                            "onUpdate:modelValue": ($event) => unref(localData).directions = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelRecipe.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PanelRecipe = Object.assign(_sfc_main, { __name: "PanelRecipe" });

export { PanelRecipe as default };
//# sourceMappingURL=PanelRecipe-DSucbTve.mjs.map

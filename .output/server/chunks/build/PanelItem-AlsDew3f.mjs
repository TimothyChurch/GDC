import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$2 } from './Form-B0crAOcM.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$5 } from './SelectMenu-DljUyjmT.mjs';
import { _ as _sfc_main$6 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$7 } from './Separator-C6vDFXmY.mjs';
import { _ as _sfc_main$9 } from './Textarea-f7RIzcnS.mjs';
import { _ as _sfc_main$a } from './Switch-BH6j8VnQ.mjs';
import { i as itemInventoryTypes, b as allUnits } from './units-DWysHFem.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import * as yup from 'yup';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useItemCategories } from './useItemCategories-BhScY4G-.mjs';
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
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelItem",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const itemStore = useItemStore();
    const categories = useItemCategories();
    const schema = yup.object({
      name: yup.string().required("Name is required"),
      type: yup.string(),
      category: yup.string(),
      inventoryUnit: yup.string(),
      minStock: yup.number().min(0).nullable(),
      reorderPoint: yup.number().min(0).nullable(),
      usePerMonth: yup.number().min(0).nullable(),
      baseCostPrice: yup.number().min(0).nullable(),
      baseCostSize: yup.number().min(0).nullable(),
      baseCostUnit: yup.string()
    });
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => itemStore.item,
      async onSave(data) {
        Object.assign(itemStore.item, data);
        await itemStore.updateItem();
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    const categoryItems = computed(
      () => categories.value.map((c) => ({ label: c, value: c }))
    );
    const addType = (type) => {
      itemInventoryTypes.value.push(type);
      localData.value.type = type;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$2;
      const _component_UFormField = _sfc_main$3;
      const _component_UInput = _sfc_main$4;
      const _component_USelectMenu = _sfc_main$5;
      const _component_USelect = _sfc_main$6;
      const _component_USeparator = _sfc_main$7;
      const _component_UTextarea = _sfc_main$9;
      const _component_USwitch = _sfc_main$a;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Item" : "Edit Item")}</h2>`);
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
                          placeholder: "Item name",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).name,
                            "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                            placeholder: "Item name",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="grid grid-cols-2 gap-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Type",
                    name: "type"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(localData).type,
                          "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                          items: "itemInventoryTypes" in _ctx ? _ctx.itemInventoryTypes : unref(itemInventoryTypes),
                          "create-item": "",
                          onCreate: addType,
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: "itemInventoryTypes" in _ctx ? _ctx.itemInventoryTypes : unref(itemInventoryTypes),
                            "create-item": "",
                            onCreate: addType,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Category",
                    name: "category"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).category,
                          "onUpdate:modelValue": ($event) => unref(localData).category = $event,
                          items: unref(categoryItems),
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).category,
                            "onUpdate:modelValue": ($event) => unref(localData).category = $event,
                            items: unref(categoryItems),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Inventory Unit",
                    name: "inventoryUnit"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).inventoryUnit,
                          "onUpdate:modelValue": ($event) => unref(localData).inventoryUnit = $event,
                          items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).inventoryUnit,
                            "onUpdate:modelValue": ($event) => unref(localData).inventoryUnit = $event,
                            items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="grid grid-cols-3 gap-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Min Stock",
                    name: "minStock"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).minStock,
                          "onUpdate:modelValue": ($event) => unref(localData).minStock = $event,
                          type: "number",
                          min: "0"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).minStock,
                            "onUpdate:modelValue": ($event) => unref(localData).minStock = $event,
                            type: "number",
                            min: "0"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Reorder Point",
                    name: "reorderPoint"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).reorderPoint,
                          "onUpdate:modelValue": ($event) => unref(localData).reorderPoint = $event,
                          type: "number",
                          min: "0"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).reorderPoint,
                            "onUpdate:modelValue": ($event) => unref(localData).reorderPoint = $event,
                            type: "number",
                            min: "0"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Use / Month",
                    name: "usePerMonth"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).usePerMonth,
                          "onUpdate:modelValue": ($event) => unref(localData).usePerMonth = $event,
                          type: "number",
                          min: "0"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).usePerMonth,
                            "onUpdate:modelValue": ($event) => unref(localData).usePerMonth = $event,
                            type: "number",
                            min: "0"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_USeparator, { label: "Base Cost" }, null, _parent3, _scopeId2));
                  _push3(`<div class="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-2"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Qty",
                    name: "baseCostSize"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).baseCostSize,
                          "onUpdate:modelValue": ($event) => unref(localData).baseCostSize = $event,
                          type: "number",
                          min: "0",
                          placeholder: "50"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).baseCostSize,
                            "onUpdate:modelValue": ($event) => unref(localData).baseCostSize = $event,
                            type: "number",
                            min: "0",
                            placeholder: "50"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<span class="pb-2 text-sm text-parchment/60"${_scopeId2}>of</span>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Unit",
                    name: "baseCostUnit"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).baseCostUnit,
                          "onUpdate:modelValue": ($event) => unref(localData).baseCostUnit = $event,
                          items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                          placeholder: "lb",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).baseCostUnit,
                            "onUpdate:modelValue": ($event) => unref(localData).baseCostUnit = $event,
                            items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                            placeholder: "lb",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<span class="pb-2 text-sm text-parchment/60"${_scopeId2}>for</span>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Price ($)",
                    name: "baseCostPrice"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).baseCostPrice,
                          "onUpdate:modelValue": ($event) => unref(localData).baseCostPrice = $event,
                          type: "number",
                          min: "0",
                          step: "0.01",
                          placeholder: "50.00"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).baseCostPrice,
                            "onUpdate:modelValue": ($event) => unref(localData).baseCostPrice = $event,
                            type: "number",
                            min: "0",
                            step: "0.01",
                            placeholder: "50.00"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  if (unref(localData).baseCostSize && unref(localData).baseCostUnit && unref(localData).baseCostPrice) {
                    _push3(`<p class="text-xs text-parchment/60"${_scopeId2}>${ssrInterpolate(unref(localData).baseCostSize)} ${ssrInterpolate(unref(localData).baseCostUnit)} for $${ssrInterpolate(Number(unref(localData).baseCostPrice).toFixed(2))}</p>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Notes",
                    name: "notes"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UTextarea, {
                          modelValue: unref(localData).notes,
                          "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                          placeholder: "Miscellaneous notes (e.g., average weight per unit, storage requirements)",
                          rows: 3,
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            placeholder: "Miscellaneous notes (e.g., average weight per unit, storage requirements)",
                            rows: 3,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_USeparator, null, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="flex items-center justify-between"${_scopeId3}><div${_scopeId3}><div class="text-sm font-medium text-parchment"${_scopeId3}>Track Inventory</div><div class="text-xs text-parchment/60"${_scopeId3}>Enable stock tracking, counts, and low-stock alerts for this item</div></div>`);
                        _push4(ssrRenderComponent(_component_USwitch, {
                          modelValue: unref(localData).trackInventory,
                          "onUpdate:modelValue": ($event) => unref(localData).trackInventory = $event
                        }, null, _parent4, _scopeId3));
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "flex items-center justify-between" }, [
                            createVNode("div", null, [
                              createVNode("div", { class: "text-sm font-medium text-parchment" }, "Track Inventory"),
                              createVNode("div", { class: "text-xs text-parchment/60" }, "Enable stock tracking, counts, and low-stock alerts for this item")
                            ]),
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).trackInventory,
                              "onUpdate:modelValue": ($event) => unref(localData).trackInventory = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ])
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
                            placeholder: "Item name",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Type",
                          name: "type"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).type,
                              "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                              items: "itemInventoryTypes" in _ctx ? _ctx.itemInventoryTypes : unref(itemInventoryTypes),
                              "create-item": "",
                              onCreate: addType,
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Category",
                          name: "category"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).category,
                              "onUpdate:modelValue": ($event) => unref(localData).category = $event,
                              items: unref(categoryItems),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_UFormField, {
                        label: "Inventory Unit",
                        name: "inventoryUnit"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).inventoryUnit,
                            "onUpdate:modelValue": ($event) => unref(localData).inventoryUnit = $event,
                            items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-3 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Min Stock",
                          name: "minStock"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).minStock,
                              "onUpdate:modelValue": ($event) => unref(localData).minStock = $event,
                              type: "number",
                              min: "0"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Reorder Point",
                          name: "reorderPoint"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).reorderPoint,
                              "onUpdate:modelValue": ($event) => unref(localData).reorderPoint = $event,
                              type: "number",
                              min: "0"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Use / Month",
                          name: "usePerMonth"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).usePerMonth,
                              "onUpdate:modelValue": ($event) => unref(localData).usePerMonth = $event,
                              type: "number",
                              min: "0"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_USeparator, { label: "Base Cost" }),
                      createVNode("div", { class: "grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-2" }, [
                        createVNode(_component_UFormField, {
                          label: "Qty",
                          name: "baseCostSize"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).baseCostSize,
                              "onUpdate:modelValue": ($event) => unref(localData).baseCostSize = $event,
                              type: "number",
                              min: "0",
                              placeholder: "50"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode("span", { class: "pb-2 text-sm text-parchment/60" }, "of"),
                        createVNode(_component_UFormField, {
                          label: "Unit",
                          name: "baseCostUnit"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).baseCostUnit,
                              "onUpdate:modelValue": ($event) => unref(localData).baseCostUnit = $event,
                              items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                              placeholder: "lb",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode("span", { class: "pb-2 text-sm text-parchment/60" }, "for"),
                        createVNode(_component_UFormField, {
                          label: "Price ($)",
                          name: "baseCostPrice"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).baseCostPrice,
                              "onUpdate:modelValue": ($event) => unref(localData).baseCostPrice = $event,
                              type: "number",
                              min: "0",
                              step: "0.01",
                              placeholder: "50.00"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      unref(localData).baseCostSize && unref(localData).baseCostUnit && unref(localData).baseCostPrice ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-xs text-parchment/60"
                      }, toDisplayString(unref(localData).baseCostSize) + " " + toDisplayString(unref(localData).baseCostUnit) + " for $" + toDisplayString(Number(unref(localData).baseCostPrice).toFixed(2)), 1)) : createCommentVNode("", true),
                      createVNode(_component_UFormField, {
                        label: "Notes",
                        name: "notes"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            placeholder: "Miscellaneous notes (e.g., average weight per unit, storage requirements)",
                            rows: 3,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_USeparator),
                      createVNode(_component_UFormField, null, {
                        default: withCtx(() => [
                          createVNode("div", { class: "flex items-center justify-between" }, [
                            createVNode("div", null, [
                              createVNode("div", { class: "text-sm font-medium text-parchment" }, "Track Inventory"),
                              createVNode("div", { class: "text-xs text-parchment/60" }, "Enable stock tracking, counts, and low-stock alerts for this item")
                            ]),
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).trackInventory,
                              "onUpdate:modelValue": ($event) => unref(localData).trackInventory = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ])
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
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Item" : "Edit Item"), 1),
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
                            placeholder: "Item name",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Type",
                          name: "type"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelectMenu, {
                              modelValue: unref(localData).type,
                              "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                              items: "itemInventoryTypes" in _ctx ? _ctx.itemInventoryTypes : unref(itemInventoryTypes),
                              "create-item": "",
                              onCreate: addType,
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Category",
                          name: "category"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).category,
                              "onUpdate:modelValue": ($event) => unref(localData).category = $event,
                              items: unref(categoryItems),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_UFormField, {
                        label: "Inventory Unit",
                        name: "inventoryUnit"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).inventoryUnit,
                            "onUpdate:modelValue": ($event) => unref(localData).inventoryUnit = $event,
                            items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-3 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "Min Stock",
                          name: "minStock"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).minStock,
                              "onUpdate:modelValue": ($event) => unref(localData).minStock = $event,
                              type: "number",
                              min: "0"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Reorder Point",
                          name: "reorderPoint"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).reorderPoint,
                              "onUpdate:modelValue": ($event) => unref(localData).reorderPoint = $event,
                              type: "number",
                              min: "0"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Use / Month",
                          name: "usePerMonth"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).usePerMonth,
                              "onUpdate:modelValue": ($event) => unref(localData).usePerMonth = $event,
                              type: "number",
                              min: "0"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_USeparator, { label: "Base Cost" }),
                      createVNode("div", { class: "grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-2" }, [
                        createVNode(_component_UFormField, {
                          label: "Qty",
                          name: "baseCostSize"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).baseCostSize,
                              "onUpdate:modelValue": ($event) => unref(localData).baseCostSize = $event,
                              type: "number",
                              min: "0",
                              placeholder: "50"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode("span", { class: "pb-2 text-sm text-parchment/60" }, "of"),
                        createVNode(_component_UFormField, {
                          label: "Unit",
                          name: "baseCostUnit"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).baseCostUnit,
                              "onUpdate:modelValue": ($event) => unref(localData).baseCostUnit = $event,
                              items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
                              placeholder: "lb",
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode("span", { class: "pb-2 text-sm text-parchment/60" }, "for"),
                        createVNode(_component_UFormField, {
                          label: "Price ($)",
                          name: "baseCostPrice"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).baseCostPrice,
                              "onUpdate:modelValue": ($event) => unref(localData).baseCostPrice = $event,
                              type: "number",
                              min: "0",
                              step: "0.01",
                              placeholder: "50.00"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      unref(localData).baseCostSize && unref(localData).baseCostUnit && unref(localData).baseCostPrice ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-xs text-parchment/60"
                      }, toDisplayString(unref(localData).baseCostSize) + " " + toDisplayString(unref(localData).baseCostUnit) + " for $" + toDisplayString(Number(unref(localData).baseCostPrice).toFixed(2)), 1)) : createCommentVNode("", true),
                      createVNode(_component_UFormField, {
                        label: "Notes",
                        name: "notes"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).notes,
                            "onUpdate:modelValue": ($event) => unref(localData).notes = $event,
                            placeholder: "Miscellaneous notes (e.g., average weight per unit, storage requirements)",
                            rows: 3,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_USeparator),
                      createVNode(_component_UFormField, null, {
                        default: withCtx(() => [
                          createVNode("div", { class: "flex items-center justify-between" }, [
                            createVNode("div", null, [
                              createVNode("div", { class: "text-sm font-medium text-parchment" }, "Track Inventory"),
                              createVNode("div", { class: "text-xs text-parchment/60" }, "Enable stock tracking, counts, and low-stock alerts for this item")
                            ]),
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).trackInventory,
                              "onUpdate:modelValue": ($event) => unref(localData).trackInventory = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelItem.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PanelItem = Object.assign(_sfc_main, { __name: "PanelItem" });

export { PanelItem as default };
//# sourceMappingURL=PanelItem-AlsDew3f.mjs.map

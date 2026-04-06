import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$2 } from './Form-DifyhlgS.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$5 } from './SelectMenu-DljUyjmT.mjs';
import { _ as __nuxt_component_6 } from './BaseQuantityInput-Bo8QfULy.mjs';
import { _ as _sfc_main$6 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$7 } from './Switch-BH6j8VnQ.mjs';
import { w as weightUnits, v as volumeUnits } from './units-DWysHFem.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, createTextVNode, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import * as yup from 'yup';
import { g as getBarrelAgeDefault, B as BARREL_SIZES, C as CHAR_LEVELS } from './definitions-C7fnFA_u.mjs';
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
import './FieldGroup-bwPzB93U.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';
import './batchPipeline-Dr1IalWc.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelVessel",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const schema = yup.object({
      name: yup.string().required("Name is required"),
      type: yup.string().required("Type is required"),
      stats: yup.object({
        volume: yup.number().positive("Must be positive").nullable(),
        weight: yup.number().positive("Must be positive").nullable()
      })
    });
    const vesselStore = useVesselStore();
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => vesselStore.vessel,
      async onSave(data) {
        Object.assign(vesselStore.vessel, data);
        await vesselStore.updateVessel();
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    const vesselTypes = computed(() => {
      const types = ["Mash Tun", "Fermenter", "Still", "Tank", "Barrel"];
      vesselStore.vessels.forEach((vessel) => {
        if (!types.includes(vessel.type)) types.push(vessel.type);
      });
      return types.sort((a, b) => a.localeCompare(b));
    });
    const barrelSizes = BARREL_SIZES;
    const charLevels = CHAR_LEVELS;
    const sizeDefault = computed(() => getBarrelAgeDefault(localData.value.barrel?.size));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$2;
      const _component_UFormField = _sfc_main$3;
      const _component_UInput = _sfc_main$4;
      const _component_USelectMenu = _sfc_main$5;
      const _component_BaseQuantityInput = __nuxt_component_6;
      const _component_USelect = _sfc_main$6;
      const _component_USwitch = _sfc_main$7;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Vessel" : "Edit Vessel")}</h2>`);
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
                          placeholder: "Vessel name"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).name,
                            "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                            placeholder: "Vessel name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Type",
                    name: "type"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(localData).type,
                          "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                          items: unref(vesselTypes),
                          placeholder: "Type",
                          creatable: "",
                          searchable: "",
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: unref(vesselTypes),
                            placeholder: "Type",
                            creatable: "",
                            searchable: "",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Weight",
                    name: "stats.weight"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_BaseQuantityInput, {
                          value: unref(localData).stats.weight,
                          "onUpdate:value": ($event) => unref(localData).stats.weight = $event,
                          unit: unref(localData).stats.weightUnit,
                          "onUpdate:unit": ($event) => unref(localData).stats.weightUnit = $event,
                          "unit-options": "weightUnits" in _ctx ? _ctx.weightUnits : unref(weightUnits)
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).stats.weight,
                            "onUpdate:value": ($event) => unref(localData).stats.weight = $event,
                            unit: unref(localData).stats.weightUnit,
                            "onUpdate:unit": ($event) => unref(localData).stats.weightUnit = $event,
                            "unit-options": "weightUnits" in _ctx ? _ctx.weightUnits : unref(weightUnits)
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Capacity",
                    name: "stats.volume"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_BaseQuantityInput, {
                          value: unref(localData).stats.volume,
                          "onUpdate:value": ($event) => unref(localData).stats.volume = $event,
                          unit: unref(localData).stats.volumeUnit,
                          "onUpdate:unit": ($event) => unref(localData).stats.volumeUnit = $event,
                          "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits)
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).stats.volume,
                            "onUpdate:value": ($event) => unref(localData).stats.volume = $event,
                            unit: unref(localData).stats.volumeUnit,
                            "onUpdate:unit": ($event) => unref(localData).stats.volumeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits)
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (unref(localData).type === "Barrel") {
                    _push3(`<!--[-->`);
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Barrel Size" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_USelect, {
                            modelValue: unref(localData).barrel.size,
                            "onUpdate:modelValue": ($event) => unref(localData).barrel.size = $event,
                            items: unref(barrelSizes),
                            class: "w-full"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).barrel.size,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.size = $event,
                              items: unref(barrelSizes),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Char Level" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_USelect, {
                            modelValue: unref(localData).barrel.char,
                            "onUpdate:modelValue": ($event) => unref(localData).barrel.char = $event,
                            items: unref(charLevels),
                            class: "w-full"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).barrel.char,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.char = $event,
                              items: unref(charLevels),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Cost" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_UInput, {
                            modelValue: unref(localData).barrel.cost,
                            "onUpdate:modelValue": ($event) => unref(localData).barrel.cost = $event,
                            type: "number",
                            icon: "i-lucide-dollar-sign"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).barrel.cost,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.cost = $event,
                              type: "number",
                              icon: "i-lucide-dollar-sign"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<div class="flex items-center justify-between"${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Used Barrel" }, {
                      description: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<span class="text-xs text-parchment/50"${_scopeId3}>Mark as previously used (auto-set when emptied)</span>`);
                        } else {
                          return [
                            createVNode("span", { class: "text-xs text-parchment/50" }, "Mark as previously used (auto-set when emptied)")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(_component_USwitch, {
                      modelValue: unref(localData).isUsed,
                      "onUpdate:modelValue": ($event) => unref(localData).isUsed = $event
                    }, null, _parent3, _scopeId2));
                    _push3(`</div>`);
                    if (unref(localData).isUsed) {
                      _push3(ssrRenderComponent(_component_UFormField, { label: "Previous Contents" }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(_component_UInput, {
                              modelValue: unref(localData).previousContents,
                              "onUpdate:modelValue": ($event) => unref(localData).previousContents = $event,
                              placeholder: "e.g. Bourbon, Rum, Wine"
                            }, null, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(_component_UInput, {
                                modelValue: unref(localData).previousContents,
                                "onUpdate:modelValue": ($event) => unref(localData).previousContents = $event,
                                placeholder: "e.g. Bourbon, Rum, Wine"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Target Age (months)" }, {
                      description: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<span class="text-xs text-parchment/50"${_scopeId3}>`);
                          if (unref(localData).targetAge) {
                            _push4(`<!--[-->Custom override<!--]-->`);
                          } else if (unref(sizeDefault)) {
                            _push4(`<!--[-->Will use size default (${ssrInterpolate(unref(sizeDefault))} mo)<!--]-->`);
                          } else {
                            _push4(`<!--[-->No default for this barrel size<!--]-->`);
                          }
                          _push4(`</span>`);
                        } else {
                          return [
                            createVNode("span", { class: "text-xs text-parchment/50" }, [
                              unref(localData).targetAge ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                createTextVNode("Custom override")
                              ], 64)) : unref(sizeDefault) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                                createTextVNode("Will use size default (" + toDisplayString(unref(sizeDefault)) + " mo)", 1)
                              ], 64)) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                                createTextVNode("No default for this barrel size")
                              ], 64))
                            ])
                          ];
                        }
                      }),
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_UInput, {
                            modelValue: unref(localData).targetAge,
                            "onUpdate:modelValue": ($event) => unref(localData).targetAge = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            placeholder: unref(sizeDefault) ? `Default: ${unref(sizeDefault)}` : "e.g. 24"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).targetAge,
                              "onUpdate:modelValue": ($event) => unref(localData).targetAge = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              placeholder: unref(sizeDefault) ? `Default: ${unref(sizeDefault)}` : "e.g. 24"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<!--]-->`);
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
                            placeholder: "Vessel name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Type",
                        name: "type"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: unref(vesselTypes),
                            placeholder: "Type",
                            creatable: "",
                            searchable: "",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Weight",
                        name: "stats.weight"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).stats.weight,
                            "onUpdate:value": ($event) => unref(localData).stats.weight = $event,
                            unit: unref(localData).stats.weightUnit,
                            "onUpdate:unit": ($event) => unref(localData).stats.weightUnit = $event,
                            "unit-options": "weightUnits" in _ctx ? _ctx.weightUnits : unref(weightUnits)
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Capacity",
                        name: "stats.volume"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).stats.volume,
                            "onUpdate:value": ($event) => unref(localData).stats.volume = $event,
                            unit: unref(localData).stats.volumeUnit,
                            "onUpdate:unit": ($event) => unref(localData).stats.volumeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits)
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ]),
                        _: 1
                      }),
                      unref(localData).type === "Barrel" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode(_component_UFormField, { label: "Barrel Size" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).barrel.size,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.size = $event,
                              items: unref(barrelSizes),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Char Level" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).barrel.char,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.char = $event,
                              items: unref(charLevels),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Cost" }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).barrel.cost,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.cost = $event,
                              type: "number",
                              icon: "i-lucide-dollar-sign"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "flex items-center justify-between" }, [
                          createVNode(_component_UFormField, { label: "Used Barrel" }, {
                            description: withCtx(() => [
                              createVNode("span", { class: "text-xs text-parchment/50" }, "Mark as previously used (auto-set when emptied)")
                            ]),
                            _: 1
                          }),
                          createVNode(_component_USwitch, {
                            modelValue: unref(localData).isUsed,
                            "onUpdate:modelValue": ($event) => unref(localData).isUsed = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        unref(localData).isUsed ? (openBlock(), createBlock(_component_UFormField, {
                          key: 0,
                          label: "Previous Contents"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).previousContents,
                              "onUpdate:modelValue": ($event) => unref(localData).previousContents = $event,
                              placeholder: "e.g. Bourbon, Rum, Wine"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createVNode(_component_UFormField, { label: "Target Age (months)" }, {
                          description: withCtx(() => [
                            createVNode("span", { class: "text-xs text-parchment/50" }, [
                              unref(localData).targetAge ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                createTextVNode("Custom override")
                              ], 64)) : unref(sizeDefault) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                                createTextVNode("Will use size default (" + toDisplayString(unref(sizeDefault)) + " mo)", 1)
                              ], 64)) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                                createTextVNode("No default for this barrel size")
                              ], 64))
                            ])
                          ]),
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).targetAge,
                              "onUpdate:modelValue": ($event) => unref(localData).targetAge = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              placeholder: unref(sizeDefault) ? `Default: ${unref(sizeDefault)}` : "e.g. 24"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
                          ]),
                          _: 1
                        })
                      ], 64)) : createCommentVNode("", true)
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
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Vessel" : "Edit Vessel"), 1),
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
                            placeholder: "Vessel name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Type",
                        name: "type"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: unref(vesselTypes),
                            placeholder: "Type",
                            creatable: "",
                            searchable: "",
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Weight",
                        name: "stats.weight"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).stats.weight,
                            "onUpdate:value": ($event) => unref(localData).stats.weight = $event,
                            unit: unref(localData).stats.weightUnit,
                            "onUpdate:unit": ($event) => unref(localData).stats.weightUnit = $event,
                            "unit-options": "weightUnits" in _ctx ? _ctx.weightUnits : unref(weightUnits)
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Capacity",
                        name: "stats.volume"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_BaseQuantityInput, {
                            value: unref(localData).stats.volume,
                            "onUpdate:value": ($event) => unref(localData).stats.volume = $event,
                            unit: unref(localData).stats.volumeUnit,
                            "onUpdate:unit": ($event) => unref(localData).stats.volumeUnit = $event,
                            "unit-options": "volumeUnits" in _ctx ? _ctx.volumeUnits : unref(volumeUnits)
                          }, null, 8, ["value", "onUpdate:value", "unit", "onUpdate:unit", "unit-options"])
                        ]),
                        _: 1
                      }),
                      unref(localData).type === "Barrel" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        createVNode(_component_UFormField, { label: "Barrel Size" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).barrel.size,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.size = $event,
                              items: unref(barrelSizes),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Char Level" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).barrel.char,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.char = $event,
                              items: unref(charLevels),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Cost" }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).barrel.cost,
                              "onUpdate:modelValue": ($event) => unref(localData).barrel.cost = $event,
                              type: "number",
                              icon: "i-lucide-dollar-sign"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode("div", { class: "flex items-center justify-between" }, [
                          createVNode(_component_UFormField, { label: "Used Barrel" }, {
                            description: withCtx(() => [
                              createVNode("span", { class: "text-xs text-parchment/50" }, "Mark as previously used (auto-set when emptied)")
                            ]),
                            _: 1
                          }),
                          createVNode(_component_USwitch, {
                            modelValue: unref(localData).isUsed,
                            "onUpdate:modelValue": ($event) => unref(localData).isUsed = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        unref(localData).isUsed ? (openBlock(), createBlock(_component_UFormField, {
                          key: 0,
                          label: "Previous Contents"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).previousContents,
                              "onUpdate:modelValue": ($event) => unref(localData).previousContents = $event,
                              placeholder: "e.g. Bourbon, Rum, Wine"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createVNode(_component_UFormField, { label: "Target Age (months)" }, {
                          description: withCtx(() => [
                            createVNode("span", { class: "text-xs text-parchment/50" }, [
                              unref(localData).targetAge ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                createTextVNode("Custom override")
                              ], 64)) : unref(sizeDefault) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                                createTextVNode("Will use size default (" + toDisplayString(unref(sizeDefault)) + " mo)", 1)
                              ], 64)) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                                createTextVNode("No default for this barrel size")
                              ], 64))
                            ])
                          ]),
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).targetAge,
                              "onUpdate:modelValue": ($event) => unref(localData).targetAge = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              placeholder: unref(sizeDefault) ? `Default: ${unref(sizeDefault)}` : "e.g. 24"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder"])
                          ]),
                          _: 1
                        })
                      ], 64)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelVessel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PanelVessel = Object.assign(_sfc_main, { __name: "PanelVessel" });

export { PanelVessel as default };
//# sourceMappingURL=PanelVessel-BUklXxNZ.mjs.map

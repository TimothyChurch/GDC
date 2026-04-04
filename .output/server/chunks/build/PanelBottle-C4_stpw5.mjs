import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$2 } from './Form-B0crAOcM.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$5 } from './SelectMenu-DljUyjmT.mjs';
import { _ as _sfc_main$6 } from './Switch-BH6j8VnQ.mjs';
import { _ as __nuxt_component_9 } from './FormImageUpload-CmE9buSH.mjs';
import { _ as _sfc_main$7 } from './Textarea-f7RIzcnS.mjs';
import { l as liquorClasses } from './definitions-C7fnFA_u.mjs';
import { defineComponent, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import * as yup from 'yup';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelBottle",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const bottleStore = useBottleStore();
    const recipeStore = useRecipeStore();
    const schema = yup.object({
      name: yup.string().required("Name is required"),
      abv: yup.number().min(0).max(100).nullable(),
      price: yup.number().min(0).nullable()
    });
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => bottleStore.bottle,
      async onSave(data) {
        Object.assign(bottleStore.bottle, data);
        await bottleStore.updateBottle();
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    const newType = (type) => {
      localData.value.type = type;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$2;
      const _component_UFormField = _sfc_main$3;
      const _component_UInput = _sfc_main$4;
      const _component_USelectMenu = _sfc_main$5;
      const _component_USwitch = _sfc_main$6;
      const _component_FormImageUpload = __nuxt_component_9;
      const _component_UTextarea = _sfc_main$7;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Bottle" : "Edit Bottle")}</h2>`);
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
                          placeholder: "Bottle name"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).name,
                            "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                            placeholder: "Bottle name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Recipe",
                    name: "recipe"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          items: unref(recipeStore).recipes,
                          searchable: "",
                          "label-key": "name",
                          "value-key": "_id",
                          modelValue: unref(localData).recipe,
                          "onUpdate:modelValue": ($event) => unref(localData).recipe = $event,
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            items: unref(recipeStore).recipes,
                            searchable: "",
                            "label-key": "name",
                            "value-key": "_id",
                            modelValue: unref(localData).recipe,
                            "onUpdate:modelValue": ($event) => unref(localData).recipe = $event,
                            class: "w-full"
                          }, null, 8, ["items", "modelValue", "onUpdate:modelValue"])
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
                          items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).map((i) => i.class),
                          class: "w-full"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelectMenu, {
                            modelValue: unref(localData).class,
                            "onUpdate:modelValue": ($event) => unref(localData).class = $event,
                            items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).map((i) => i.class),
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
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
                        if (unref(localData).class) {
                          _push4(ssrRenderComponent(_component_USelectMenu, {
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).filter((i) => i.class === unref(localData).class)[0]?.types.map((i) => i.type),
                            "create-item": "",
                            onCreate: newType,
                            class: "w-full"
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          unref(localData).class ? (openBlock(), createBlock(_component_USelectMenu, {
                            key: 0,
                            modelValue: unref(localData).type,
                            "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                            items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).filter((i) => i.class === unref(localData).class)[0]?.types.map((i) => i.type),
                            "create-item": "",
                            onCreate: newType,
                            class: "w-full"
                          }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="grid grid-cols-2 gap-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "ABV",
                    name: "abv"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).abv,
                          "onUpdate:modelValue": ($event) => unref(localData).abv = $event,
                          type: "number"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).abv,
                            "onUpdate:modelValue": ($event) => unref(localData).abv = $event,
                            type: "number"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Price",
                    name: "price"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).price,
                          "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                          type: "number"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).price,
                            "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                            type: "number"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div><div class="flex items-center gap-6"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "In Stock" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USwitch, {
                          modelValue: unref(localData).inStock,
                          "onUpdate:modelValue": ($event) => unref(localData).inStock = $event
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USwitch, {
                            modelValue: unref(localData).inStock,
                            "onUpdate:modelValue": ($event) => unref(localData).inStock = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (!isNew) {
                    _push3(ssrRenderComponent(_component_UFormField, { label: "Archived" }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(_component_USwitch, {
                            modelValue: unref(localData).archived,
                            "onUpdate:modelValue": ($event) => unref(localData).archived = $event,
                            color: "red"
                          }, null, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).archived,
                              "onUpdate:modelValue": ($event) => unref(localData).archived = $event,
                              color: "red"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_FormImageUpload, {
                    modelValue: unref(localData).img,
                    "onUpdate:modelValue": ($event) => unref(localData).img = $event,
                    folder: "bottles",
                    label: "Product Photo"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, {
                    label: "Description",
                    name: "description"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UTextarea, {
                          modelValue: unref(localData).description,
                          "onUpdate:modelValue": ($event) => unref(localData).description = $event
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).description,
                            "onUpdate:modelValue": ($event) => unref(localData).description = $event
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
                            placeholder: "Bottle name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Recipe",
                        name: "recipe"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            items: unref(recipeStore).recipes,
                            searchable: "",
                            "label-key": "name",
                            "value-key": "_id",
                            modelValue: unref(localData).recipe,
                            "onUpdate:modelValue": ($event) => unref(localData).recipe = $event,
                            class: "w-full"
                          }, null, 8, ["items", "modelValue", "onUpdate:modelValue"])
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
                              items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).map((i) => i.class),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Type",
                          name: "type"
                        }, {
                          default: withCtx(() => [
                            unref(localData).class ? (openBlock(), createBlock(_component_USelectMenu, {
                              key: 0,
                              modelValue: unref(localData).type,
                              "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                              items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).filter((i) => i.class === unref(localData).class)[0]?.types.map((i) => i.type),
                              "create-item": "",
                              onCreate: newType,
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])) : createCommentVNode("", true)
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "ABV",
                          name: "abv"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).abv,
                              "onUpdate:modelValue": ($event) => unref(localData).abv = $event,
                              type: "number"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Price",
                          name: "price"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).price,
                              "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                              type: "number"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "flex items-center gap-6" }, [
                        createVNode(_component_UFormField, { label: "In Stock" }, {
                          default: withCtx(() => [
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).inStock,
                              "onUpdate:modelValue": ($event) => unref(localData).inStock = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        !isNew ? (openBlock(), createBlock(_component_UFormField, {
                          key: 0,
                          label: "Archived"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).archived,
                              "onUpdate:modelValue": ($event) => unref(localData).archived = $event,
                              color: "red"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })) : createCommentVNode("", true)
                      ]),
                      createVNode(_component_FormImageUpload, {
                        modelValue: unref(localData).img,
                        "onUpdate:modelValue": ($event) => unref(localData).img = $event,
                        folder: "bottles",
                        label: "Product Photo"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(_component_UFormField, {
                        label: "Description",
                        name: "description"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).description,
                            "onUpdate:modelValue": ($event) => unref(localData).description = $event
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
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Bottle" : "Edit Bottle"), 1),
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
                            placeholder: "Bottle name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode(_component_UFormField, {
                        label: "Recipe",
                        name: "recipe"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_USelectMenu, {
                            items: unref(recipeStore).recipes,
                            searchable: "",
                            "label-key": "name",
                            "value-key": "_id",
                            modelValue: unref(localData).recipe,
                            "onUpdate:modelValue": ($event) => unref(localData).recipe = $event,
                            class: "w-full"
                          }, null, 8, ["items", "modelValue", "onUpdate:modelValue"])
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
                              items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).map((i) => i.class),
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Type",
                          name: "type"
                        }, {
                          default: withCtx(() => [
                            unref(localData).class ? (openBlock(), createBlock(_component_USelectMenu, {
                              key: 0,
                              modelValue: unref(localData).type,
                              "onUpdate:modelValue": ($event) => unref(localData).type = $event,
                              items: ("liquorClasses" in _ctx ? _ctx.liquorClasses : unref(liquorClasses)).filter((i) => i.class === unref(localData).class)[0]?.types.map((i) => i.type),
                              "create-item": "",
                              onCreate: newType,
                              class: "w-full"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])) : createCommentVNode("", true)
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                        createVNode(_component_UFormField, {
                          label: "ABV",
                          name: "abv"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).abv,
                              "onUpdate:modelValue": ($event) => unref(localData).abv = $event,
                              type: "number"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, {
                          label: "Price",
                          name: "price"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).price,
                              "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                              type: "number"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode("div", { class: "flex items-center gap-6" }, [
                        createVNode(_component_UFormField, { label: "In Stock" }, {
                          default: withCtx(() => [
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).inStock,
                              "onUpdate:modelValue": ($event) => unref(localData).inStock = $event
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        }),
                        !isNew ? (openBlock(), createBlock(_component_UFormField, {
                          key: 0,
                          label: "Archived"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_USwitch, {
                              modelValue: unref(localData).archived,
                              "onUpdate:modelValue": ($event) => unref(localData).archived = $event,
                              color: "red"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })) : createCommentVNode("", true)
                      ]),
                      createVNode(_component_FormImageUpload, {
                        modelValue: unref(localData).img,
                        "onUpdate:modelValue": ($event) => unref(localData).img = $event,
                        folder: "bottles",
                        label: "Product Photo"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(_component_UFormField, {
                        label: "Description",
                        name: "description"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).description,
                            "onUpdate:modelValue": ($event) => unref(localData).description = $event
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelBottle.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PanelBottle = Object.assign(_sfc_main, { __name: "PanelBottle" });

export { PanelBottle as default };
//# sourceMappingURL=PanelBottle-C4_stpw5.mjs.map

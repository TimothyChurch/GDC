import { _ as _sfc_main$1 } from './Slideover-CyjfVfmV.mjs';
import { e as _sfc_main$8, f as _sfc_main$e, m as useToast } from './server.mjs';
import { _ as _sfc_main$2 } from './Form-B0crAOcM.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$5 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$6 } from './Popover-BvOOk09Z.mjs';
import { _ as _sfc_main$7 } from './SelectMenu-DljUyjmT.mjs';
import { _ as __nuxt_component_9 } from './FormImageUpload-CmE9buSH.mjs';
import { _ as _sfc_main$9 } from './Textarea-f7RIzcnS.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { e as estimateCocktailPrice } from './definitions-C7fnFA_u.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createVNode, isRef, openBlock, createBlock, Fragment, renderList, toDisplayString, withKeys, createTextVNode, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import * as yup from 'yup';
import { u as useCocktailStore, a as useIngredientResolver } from './useCocktailStore-CByyovs8.mjs';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useFormPanel } from './useFormPanel-DspW7Iuy.mjs';
import { u as useCocktailOptions } from './useCocktailOptions-VOIIdi_i.mjs';
import { g as getErrorMessage } from './errorMessage-C32Dqgoz.mjs';
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
import 'reka-ui/namespaced';
import './useSettingsStore-CJPFEN69.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './conversions-t0mnZFvt.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PanelCocktail",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const schema = yup.object({
      name: yup.string().required("Name is required")
    });
    const cocktailStore = useCocktailStore();
    const itemStore = useItemStore();
    const bottleStore = useBottleStore();
    const { getIngredientName, totalIngredientCost } = useIngredientResolver();
    const { localData, isDirty, saving, save, cancel } = useFormPanel({
      source: () => cocktailStore.cocktail,
      async onSave(data) {
        Object.assign(cocktailStore.cocktail, data);
        await cocktailStore.updateCocktail();
      },
      onClose: () => emit("close", true)
    });
    const isNew = !localData.value._id;
    const cost = computed(() => totalIngredientCost(localData.value.ingredients));
    const { glasswareOptions, menuOptions, unitOptions, addGlassware, removeGlassware, addMenu, removeMenu } = useCocktailOptions();
    const preparationOptions = ["Stirred", "Shaken", "Dry Shaken", "Double Shaken", "Built in Glass"];
    const newGlassware = ref("");
    const newMenu = ref("");
    const ingredientOptions = computed(() => {
      const items = itemStore.itemNameId.map((i) => ({
        id: `item:${i.id}`,
        label: `${i.label} (Item)`
      }));
      const bottles = bottleStore.bottleNameId.map((b) => ({
        id: `bottle:${b.id}`,
        label: `${b.label} (Bottle)`
      }));
      return [...items, ...bottles].sort((a, b) => a.label.localeCompare(b.label));
    });
    const selectedIngredient = ref("");
    const newIngredientAmount = ref(0);
    const newIngredientUnit = ref("");
    const creatingItem = ref(false);
    const handleCreateItem = async (name) => {
      if (creatingItem.value) return;
      creatingItem.value = true;
      try {
        const newItem = await $fetch("/api/item/create", {
          method: "POST",
          body: { name, category: "Other" }
        });
        itemStore.items.push(newItem);
        selectedIngredient.value = `item:${newItem._id}`;
        useToast().add({ title: `Created "${newItem.name}"`, color: "success", icon: "i-lucide-check-circle" });
      } catch (error) {
        useToast().add({ title: "Failed to create item", description: getErrorMessage(error), color: "error", icon: "i-lucide-alert-circle" });
      } finally {
        creatingItem.value = false;
      }
    };
    const addIngredient = () => {
      if (!selectedIngredient.value) return;
      const [sourceType, ...idParts] = selectedIngredient.value.split(":");
      const id = idParts.join(":");
      localData.value.ingredients.push({
        item: id,
        amount: newIngredientAmount.value,
        unit: newIngredientUnit.value,
        sourceType
      });
      selectedIngredient.value = "";
      newIngredientAmount.value = 0;
      newIngredientUnit.value = "";
    };
    const removeIngredient = (index) => {
      localData.value.ingredients.splice(index, 1);
    };
    const dragIndex = ref(null);
    const onDragStart = (index, event) => {
      dragIndex.value = index;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
      }
    };
    const onDragOver = (index, event) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    };
    const onDrop = (index) => {
      if (dragIndex.value === null || dragIndex.value === index) return;
      const items = localData.value.ingredients;
      const [moved] = items.splice(dragIndex.value, 1);
      items.splice(index, 0, moved);
      dragIndex.value = null;
    };
    const onDragEnd = () => {
      dragIndex.value = null;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USlideover = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UForm = _sfc_main$2;
      const _component_UFormField = _sfc_main$3;
      const _component_UInput = _sfc_main$4;
      const _component_USelect = _sfc_main$5;
      const _component_UPopover = _sfc_main$6;
      const _component_UIcon = _sfc_main$e;
      const _component_USelectMenu = _sfc_main$7;
      const _component_FormImageUpload = __nuxt_component_9;
      const _component_UTextarea = _sfc_main$9;
      _push(ssrRenderComponent(_component_USlideover, mergeProps({
        side: "right",
        close: { onClick: unref(cancel) }
      }, _attrs), {
        content: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col h-full w-full sm:max-w-lg"${_scopeId}><div class="flex items-center justify-between px-4 py-3 border-b border-white/10"${_scopeId}><h2 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(isNew ? "New Cocktail" : "Edit Cocktail")}</h2>`);
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
                          placeholder: "Cocktail name"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).name,
                            "onUpdate:modelValue": ($event) => unref(localData).name = $event,
                            placeholder: "Cocktail name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="grid grid-cols-3 gap-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Glassware" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="flex gap-1"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).glassware,
                          "onUpdate:modelValue": ($event) => unref(localData).glassware = $event,
                          items: unref(glasswareOptions),
                          class: "flex-1"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UPopover, null, {
                          content: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="p-3 space-y-2 w-56"${_scopeId4}><p class="text-xs font-semibold text-parchment/70"${_scopeId4}>Manage Glassware</p><!--[-->`);
                              ssrRenderList(unref(glasswareOptions), (g) => {
                                _push5(`<div class="flex items-center justify-between text-sm"${_scopeId4}><span${_scopeId4}>${ssrInterpolate(g)}</span>`);
                                _push5(ssrRenderComponent(_component_UButton, {
                                  icon: "i-lucide-x",
                                  size: "xs",
                                  variant: "ghost",
                                  color: "error",
                                  onClick: ($event) => unref(removeGlassware)(g)
                                }, null, _parent5, _scopeId4));
                                _push5(`</div>`);
                              });
                              _push5(`<!--]--><div class="flex gap-1"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UInput, {
                                modelValue: unref(newGlassware),
                                "onUpdate:modelValue": ($event) => isRef(newGlassware) ? newGlassware.value = $event : null,
                                placeholder: "Add new...",
                                size: "xs",
                                class: "flex-1",
                                onKeyup: ($event) => {
                                  unref(addGlassware)(unref(newGlassware));
                                  newGlassware.value = "";
                                }
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UButton, {
                                icon: "i-lucide-plus",
                                size: "xs",
                                onClick: ($event) => {
                                  unref(addGlassware)(unref(newGlassware));
                                  newGlassware.value = "";
                                }
                              }, null, _parent5, _scopeId4));
                              _push5(`</div></div>`);
                            } else {
                              return [
                                createVNode("div", { class: "p-3 space-y-2 w-56" }, [
                                  createVNode("p", { class: "text-xs font-semibold text-parchment/70" }, "Manage Glassware"),
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(glasswareOptions), (g) => {
                                    return openBlock(), createBlock("div", {
                                      key: g,
                                      class: "flex items-center justify-between text-sm"
                                    }, [
                                      createVNode("span", null, toDisplayString(g), 1),
                                      createVNode(_component_UButton, {
                                        icon: "i-lucide-x",
                                        size: "xs",
                                        variant: "ghost",
                                        color: "error",
                                        onClick: ($event) => unref(removeGlassware)(g)
                                      }, null, 8, ["onClick"])
                                    ]);
                                  }), 128)),
                                  createVNode("div", { class: "flex gap-1" }, [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(newGlassware),
                                      "onUpdate:modelValue": ($event) => isRef(newGlassware) ? newGlassware.value = $event : null,
                                      placeholder: "Add new...",
                                      size: "xs",
                                      class: "flex-1",
                                      onKeyup: withKeys(($event) => {
                                        unref(addGlassware)(unref(newGlassware));
                                        newGlassware.value = "";
                                      }, ["enter"])
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeyup"]),
                                    createVNode(_component_UButton, {
                                      icon: "i-lucide-plus",
                                      size: "xs",
                                      onClick: ($event) => {
                                        unref(addGlassware)(unref(newGlassware));
                                        newGlassware.value = "";
                                      }
                                    }, null, 8, ["onClick"])
                                  ])
                                ])
                              ];
                            }
                          }),
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_UButton, {
                                icon: "i-lucide-settings-2",
                                variant: "ghost",
                                size: "xs",
                                color: "neutral"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-settings-2",
                                  variant: "ghost",
                                  size: "xs",
                                  color: "neutral"
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "flex gap-1" }, [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).glassware,
                              "onUpdate:modelValue": ($event) => unref(localData).glassware = $event,
                              items: unref(glasswareOptions),
                              class: "flex-1"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                            createVNode(_component_UPopover, null, {
                              content: withCtx(() => [
                                createVNode("div", { class: "p-3 space-y-2 w-56" }, [
                                  createVNode("p", { class: "text-xs font-semibold text-parchment/70" }, "Manage Glassware"),
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(glasswareOptions), (g) => {
                                    return openBlock(), createBlock("div", {
                                      key: g,
                                      class: "flex items-center justify-between text-sm"
                                    }, [
                                      createVNode("span", null, toDisplayString(g), 1),
                                      createVNode(_component_UButton, {
                                        icon: "i-lucide-x",
                                        size: "xs",
                                        variant: "ghost",
                                        color: "error",
                                        onClick: ($event) => unref(removeGlassware)(g)
                                      }, null, 8, ["onClick"])
                                    ]);
                                  }), 128)),
                                  createVNode("div", { class: "flex gap-1" }, [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(newGlassware),
                                      "onUpdate:modelValue": ($event) => isRef(newGlassware) ? newGlassware.value = $event : null,
                                      placeholder: "Add new...",
                                      size: "xs",
                                      class: "flex-1",
                                      onKeyup: withKeys(($event) => {
                                        unref(addGlassware)(unref(newGlassware));
                                        newGlassware.value = "";
                                      }, ["enter"])
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeyup"]),
                                    createVNode(_component_UButton, {
                                      icon: "i-lucide-plus",
                                      size: "xs",
                                      onClick: ($event) => {
                                        unref(addGlassware)(unref(newGlassware));
                                        newGlassware.value = "";
                                      }
                                    }, null, 8, ["onClick"])
                                  ])
                                ])
                              ]),
                              default: withCtx(() => [
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-settings-2",
                                  variant: "ghost",
                                  size: "xs",
                                  color: "neutral"
                                })
                              ]),
                              _: 1
                            })
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Menu" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="flex gap-1"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).menu,
                          "onUpdate:modelValue": ($event) => unref(localData).menu = $event,
                          items: unref(menuOptions),
                          class: "flex-1"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UPopover, null, {
                          content: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`<div class="p-3 space-y-2 w-56"${_scopeId4}><p class="text-xs font-semibold text-parchment/70"${_scopeId4}>Manage Menus</p><!--[-->`);
                              ssrRenderList(unref(menuOptions), (m) => {
                                _push5(`<div class="flex items-center justify-between text-sm"${_scopeId4}><span class="capitalize"${_scopeId4}>${ssrInterpolate(m)}</span>`);
                                _push5(ssrRenderComponent(_component_UButton, {
                                  icon: "i-lucide-x",
                                  size: "xs",
                                  variant: "ghost",
                                  color: "error",
                                  onClick: ($event) => unref(removeMenu)(m)
                                }, null, _parent5, _scopeId4));
                                _push5(`</div>`);
                              });
                              _push5(`<!--]--><div class="flex gap-1"${_scopeId4}>`);
                              _push5(ssrRenderComponent(_component_UInput, {
                                modelValue: unref(newMenu),
                                "onUpdate:modelValue": ($event) => isRef(newMenu) ? newMenu.value = $event : null,
                                placeholder: "Add new...",
                                size: "xs",
                                class: "flex-1",
                                onKeyup: ($event) => {
                                  unref(addMenu)(unref(newMenu));
                                  newMenu.value = "";
                                }
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_UButton, {
                                icon: "i-lucide-plus",
                                size: "xs",
                                onClick: ($event) => {
                                  unref(addMenu)(unref(newMenu));
                                  newMenu.value = "";
                                }
                              }, null, _parent5, _scopeId4));
                              _push5(`</div></div>`);
                            } else {
                              return [
                                createVNode("div", { class: "p-3 space-y-2 w-56" }, [
                                  createVNode("p", { class: "text-xs font-semibold text-parchment/70" }, "Manage Menus"),
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(menuOptions), (m) => {
                                    return openBlock(), createBlock("div", {
                                      key: m,
                                      class: "flex items-center justify-between text-sm"
                                    }, [
                                      createVNode("span", { class: "capitalize" }, toDisplayString(m), 1),
                                      createVNode(_component_UButton, {
                                        icon: "i-lucide-x",
                                        size: "xs",
                                        variant: "ghost",
                                        color: "error",
                                        onClick: ($event) => unref(removeMenu)(m)
                                      }, null, 8, ["onClick"])
                                    ]);
                                  }), 128)),
                                  createVNode("div", { class: "flex gap-1" }, [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(newMenu),
                                      "onUpdate:modelValue": ($event) => isRef(newMenu) ? newMenu.value = $event : null,
                                      placeholder: "Add new...",
                                      size: "xs",
                                      class: "flex-1",
                                      onKeyup: withKeys(($event) => {
                                        unref(addMenu)(unref(newMenu));
                                        newMenu.value = "";
                                      }, ["enter"])
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeyup"]),
                                    createVNode(_component_UButton, {
                                      icon: "i-lucide-plus",
                                      size: "xs",
                                      onClick: ($event) => {
                                        unref(addMenu)(unref(newMenu));
                                        newMenu.value = "";
                                      }
                                    }, null, 8, ["onClick"])
                                  ])
                                ])
                              ];
                            }
                          }),
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_UButton, {
                                icon: "i-lucide-settings-2",
                                variant: "ghost",
                                size: "xs",
                                color: "neutral"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-settings-2",
                                  variant: "ghost",
                                  size: "xs",
                                  color: "neutral"
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "flex gap-1" }, [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).menu,
                              "onUpdate:modelValue": ($event) => unref(localData).menu = $event,
                              items: unref(menuOptions),
                              class: "flex-1"
                            }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                            createVNode(_component_UPopover, null, {
                              content: withCtx(() => [
                                createVNode("div", { class: "p-3 space-y-2 w-56" }, [
                                  createVNode("p", { class: "text-xs font-semibold text-parchment/70" }, "Manage Menus"),
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(menuOptions), (m) => {
                                    return openBlock(), createBlock("div", {
                                      key: m,
                                      class: "flex items-center justify-between text-sm"
                                    }, [
                                      createVNode("span", { class: "capitalize" }, toDisplayString(m), 1),
                                      createVNode(_component_UButton, {
                                        icon: "i-lucide-x",
                                        size: "xs",
                                        variant: "ghost",
                                        color: "error",
                                        onClick: ($event) => unref(removeMenu)(m)
                                      }, null, 8, ["onClick"])
                                    ]);
                                  }), 128)),
                                  createVNode("div", { class: "flex gap-1" }, [
                                    createVNode(_component_UInput, {
                                      modelValue: unref(newMenu),
                                      "onUpdate:modelValue": ($event) => isRef(newMenu) ? newMenu.value = $event : null,
                                      placeholder: "Add new...",
                                      size: "xs",
                                      class: "flex-1",
                                      onKeyup: withKeys(($event) => {
                                        unref(addMenu)(unref(newMenu));
                                        newMenu.value = "";
                                      }, ["enter"])
                                    }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeyup"]),
                                    createVNode(_component_UButton, {
                                      icon: "i-lucide-plus",
                                      size: "xs",
                                      onClick: ($event) => {
                                        unref(addMenu)(unref(newMenu));
                                        newMenu.value = "";
                                      }
                                    }, null, 8, ["onClick"])
                                  ])
                                ])
                              ]),
                              default: withCtx(() => [
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-settings-2",
                                  variant: "ghost",
                                  size: "xs",
                                  color: "neutral"
                                })
                              ]),
                              _: 1
                            })
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Preparation" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(localData).preparation,
                          "onUpdate:modelValue": ($event) => unref(localData).preparation = $event,
                          items: preparationOptions,
                          placeholder: "Select preparation method"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_USelect, {
                            modelValue: unref(localData).preparation,
                            "onUpdate:modelValue": ($event) => unref(localData).preparation = $event,
                            items: preparationOptions,
                            placeholder: "Select preparation method"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Ingredients" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="space-y-2"${_scopeId3}><!--[-->`);
                        ssrRenderList(unref(localData).ingredients, (ingredient, index) => {
                          _push4(`<div class="${ssrRenderClass([unref(dragIndex) === index ? "opacity-50 bg-brown/10" : "", "flex items-center gap-2 rounded px-1 py-0.5 transition-colors"])}" draggable="true"${_scopeId3}>`);
                          _push4(ssrRenderComponent(_component_UIcon, {
                            name: "i-lucide-grip-vertical",
                            class: "text-parchment/60 cursor-grab shrink-0"
                          }, null, _parent4, _scopeId3));
                          _push4(`<span class="flex-1 text-sm truncate"${_scopeId3}>${ssrInterpolate(unref(getIngredientName)(ingredient))} `);
                          if (ingredient.sourceType === "bottle") {
                            _push4(`<span class="text-xs text-copper/70 ml-1"${_scopeId3}>(Bottle)</span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`</span>`);
                          _push4(ssrRenderComponent(_component_UInput, {
                            modelValue: ingredient.amount,
                            "onUpdate:modelValue": ($event) => ingredient.amount = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            step: "0.25",
                            class: "w-16",
                            size: "xs"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(_component_USelect, {
                            modelValue: ingredient.unit,
                            "onUpdate:modelValue": ($event) => ingredient.unit = $event,
                            items: unref(unitOptions),
                            class: "w-20",
                            size: "xs"
                          }, null, _parent4, _scopeId3));
                          _push4(ssrRenderComponent(_component_UButton, {
                            icon: "i-lucide-trash-2",
                            color: "error",
                            variant: "ghost",
                            size: "xs",
                            onClick: ($event) => removeIngredient(index)
                          }, null, _parent4, _scopeId3));
                          _push4(`</div>`);
                        });
                        _push4(`<!--]--><div class="flex gap-2 items-end"${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_USelectMenu, {
                          modelValue: unref(selectedIngredient),
                          "onUpdate:modelValue": ($event) => isRef(selectedIngredient) ? selectedIngredient.value = $event : null,
                          "value-key": "id",
                          items: unref(ingredientOptions),
                          class: "flex-1",
                          placeholder: "Select ingredient",
                          searchable: "",
                          loading: unref(creatingItem),
                          "create-item": { position: "bottom" },
                          onCreate: handleCreateItem
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(newIngredientAmount),
                          "onUpdate:modelValue": ($event) => isRef(newIngredientAmount) ? newIngredientAmount.value = $event : null,
                          modelModifiers: { number: true },
                          type: "number",
                          placeholder: "Amt",
                          class: "w-16"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_USelect, {
                          modelValue: unref(newIngredientUnit),
                          "onUpdate:modelValue": ($event) => isRef(newIngredientUnit) ? newIngredientUnit.value = $event : null,
                          items: unref(unitOptions),
                          class: "w-20"
                        }, null, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_UButton, {
                          icon: "i-lucide-plus",
                          onClick: addIngredient,
                          size: "sm"
                        }, null, _parent4, _scopeId3));
                        _push4(`</div></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).ingredients, (ingredient, index) => {
                              return openBlock(), createBlock("div", {
                                key: index,
                                class: ["flex items-center gap-2 rounded px-1 py-0.5 transition-colors", unref(dragIndex) === index ? "opacity-50 bg-brown/10" : ""],
                                draggable: "true",
                                onDragstart: ($event) => onDragStart(index, $event),
                                onDragover: ($event) => onDragOver(index, $event),
                                onDrop: ($event) => onDrop(index),
                                onDragend: onDragEnd
                              }, [
                                createVNode(_component_UIcon, {
                                  name: "i-lucide-grip-vertical",
                                  class: "text-parchment/60 cursor-grab shrink-0"
                                }),
                                createVNode("span", { class: "flex-1 text-sm truncate" }, [
                                  createTextVNode(toDisplayString(unref(getIngredientName)(ingredient)) + " ", 1),
                                  ingredient.sourceType === "bottle" ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-xs text-copper/70 ml-1"
                                  }, "(Bottle)")) : createCommentVNode("", true)
                                ]),
                                createVNode(_component_UInput, {
                                  modelValue: ingredient.amount,
                                  "onUpdate:modelValue": ($event) => ingredient.amount = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  step: "0.25",
                                  class: "w-16",
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelect, {
                                  modelValue: ingredient.unit,
                                  "onUpdate:modelValue": ($event) => ingredient.unit = $event,
                                  items: unref(unitOptions),
                                  class: "w-20",
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeIngredient(index)
                                }, null, 8, ["onClick"])
                              ], 42, ["onDragstart", "onDragover", "onDrop"]);
                            }), 128)),
                            createVNode("div", { class: "flex gap-2 items-end" }, [
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(selectedIngredient),
                                "onUpdate:modelValue": ($event) => isRef(selectedIngredient) ? selectedIngredient.value = $event : null,
                                "value-key": "id",
                                items: unref(ingredientOptions),
                                class: "flex-1",
                                placeholder: "Select ingredient",
                                searchable: "",
                                loading: unref(creatingItem),
                                "create-item": { position: "bottom" },
                                onCreate: handleCreateItem
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items", "loading"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newIngredientAmount),
                                "onUpdate:modelValue": ($event) => isRef(newIngredientAmount) ? newIngredientAmount.value = $event : null,
                                modelModifiers: { number: true },
                                type: "number",
                                placeholder: "Amt",
                                class: "w-16"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_USelect, {
                                modelValue: unref(newIngredientUnit),
                                "onUpdate:modelValue": ($event) => isRef(newIngredientUnit) ? newIngredientUnit.value = $event : null,
                                items: unref(unitOptions),
                                class: "w-20"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UButton, {
                                icon: "i-lucide-plus",
                                onClick: addIngredient,
                                size: "sm"
                              })
                            ])
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="grid grid-cols-3 gap-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Cost" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="text-sm"${_scopeId3}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cost)))}</span>`);
                      } else {
                        return [
                          createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cost))), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Est. Price" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span class="text-sm"${_scopeId3}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(("estimateCocktailPrice" in _ctx ? _ctx.estimateCocktailPrice : unref(estimateCocktailPrice))(unref(cost))))}</span>`);
                      } else {
                        return [
                          createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(("estimateCocktailPrice" in _ctx ? _ctx.estimateCocktailPrice : unref(estimateCocktailPrice))(unref(cost)))), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Price" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UInput, {
                          modelValue: unref(localData).price,
                          "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                          modelModifiers: { number: true },
                          type: "number",
                          step: "0.01"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UInput, {
                            modelValue: unref(localData).price,
                            "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                            modelModifiers: { number: true },
                            type: "number",
                            step: "0.01"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                  _push3(ssrRenderComponent(_component_FormImageUpload, {
                    modelValue: unref(localData).img,
                    "onUpdate:modelValue": ($event) => unref(localData).img = $event,
                    folder: "cocktails",
                    label: "Cocktail Photo"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Description" }, {
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
                            placeholder: "Cocktail name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-3 gap-4" }, [
                        createVNode(_component_UFormField, { label: "Glassware" }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "flex gap-1" }, [
                              createVNode(_component_USelect, {
                                modelValue: unref(localData).glassware,
                                "onUpdate:modelValue": ($event) => unref(localData).glassware = $event,
                                items: unref(glasswareOptions),
                                class: "flex-1"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UPopover, null, {
                                content: withCtx(() => [
                                  createVNode("div", { class: "p-3 space-y-2 w-56" }, [
                                    createVNode("p", { class: "text-xs font-semibold text-parchment/70" }, "Manage Glassware"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(glasswareOptions), (g) => {
                                      return openBlock(), createBlock("div", {
                                        key: g,
                                        class: "flex items-center justify-between text-sm"
                                      }, [
                                        createVNode("span", null, toDisplayString(g), 1),
                                        createVNode(_component_UButton, {
                                          icon: "i-lucide-x",
                                          size: "xs",
                                          variant: "ghost",
                                          color: "error",
                                          onClick: ($event) => unref(removeGlassware)(g)
                                        }, null, 8, ["onClick"])
                                      ]);
                                    }), 128)),
                                    createVNode("div", { class: "flex gap-1" }, [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(newGlassware),
                                        "onUpdate:modelValue": ($event) => isRef(newGlassware) ? newGlassware.value = $event : null,
                                        placeholder: "Add new...",
                                        size: "xs",
                                        class: "flex-1",
                                        onKeyup: withKeys(($event) => {
                                          unref(addGlassware)(unref(newGlassware));
                                          newGlassware.value = "";
                                        }, ["enter"])
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeyup"]),
                                      createVNode(_component_UButton, {
                                        icon: "i-lucide-plus",
                                        size: "xs",
                                        onClick: ($event) => {
                                          unref(addGlassware)(unref(newGlassware));
                                          newGlassware.value = "";
                                        }
                                      }, null, 8, ["onClick"])
                                    ])
                                  ])
                                ]),
                                default: withCtx(() => [
                                  createVNode(_component_UButton, {
                                    icon: "i-lucide-settings-2",
                                    variant: "ghost",
                                    size: "xs",
                                    color: "neutral"
                                  })
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Menu" }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "flex gap-1" }, [
                              createVNode(_component_USelect, {
                                modelValue: unref(localData).menu,
                                "onUpdate:modelValue": ($event) => unref(localData).menu = $event,
                                items: unref(menuOptions),
                                class: "flex-1"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UPopover, null, {
                                content: withCtx(() => [
                                  createVNode("div", { class: "p-3 space-y-2 w-56" }, [
                                    createVNode("p", { class: "text-xs font-semibold text-parchment/70" }, "Manage Menus"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(menuOptions), (m) => {
                                      return openBlock(), createBlock("div", {
                                        key: m,
                                        class: "flex items-center justify-between text-sm"
                                      }, [
                                        createVNode("span", { class: "capitalize" }, toDisplayString(m), 1),
                                        createVNode(_component_UButton, {
                                          icon: "i-lucide-x",
                                          size: "xs",
                                          variant: "ghost",
                                          color: "error",
                                          onClick: ($event) => unref(removeMenu)(m)
                                        }, null, 8, ["onClick"])
                                      ]);
                                    }), 128)),
                                    createVNode("div", { class: "flex gap-1" }, [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(newMenu),
                                        "onUpdate:modelValue": ($event) => isRef(newMenu) ? newMenu.value = $event : null,
                                        placeholder: "Add new...",
                                        size: "xs",
                                        class: "flex-1",
                                        onKeyup: withKeys(($event) => {
                                          unref(addMenu)(unref(newMenu));
                                          newMenu.value = "";
                                        }, ["enter"])
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeyup"]),
                                      createVNode(_component_UButton, {
                                        icon: "i-lucide-plus",
                                        size: "xs",
                                        onClick: ($event) => {
                                          unref(addMenu)(unref(newMenu));
                                          newMenu.value = "";
                                        }
                                      }, null, 8, ["onClick"])
                                    ])
                                  ])
                                ]),
                                default: withCtx(() => [
                                  createVNode(_component_UButton, {
                                    icon: "i-lucide-settings-2",
                                    variant: "ghost",
                                    size: "xs",
                                    color: "neutral"
                                  })
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Preparation" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).preparation,
                              "onUpdate:modelValue": ($event) => unref(localData).preparation = $event,
                              items: preparationOptions,
                              placeholder: "Select preparation method"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_UFormField, { label: "Ingredients" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).ingredients, (ingredient, index) => {
                              return openBlock(), createBlock("div", {
                                key: index,
                                class: ["flex items-center gap-2 rounded px-1 py-0.5 transition-colors", unref(dragIndex) === index ? "opacity-50 bg-brown/10" : ""],
                                draggable: "true",
                                onDragstart: ($event) => onDragStart(index, $event),
                                onDragover: ($event) => onDragOver(index, $event),
                                onDrop: ($event) => onDrop(index),
                                onDragend: onDragEnd
                              }, [
                                createVNode(_component_UIcon, {
                                  name: "i-lucide-grip-vertical",
                                  class: "text-parchment/60 cursor-grab shrink-0"
                                }),
                                createVNode("span", { class: "flex-1 text-sm truncate" }, [
                                  createTextVNode(toDisplayString(unref(getIngredientName)(ingredient)) + " ", 1),
                                  ingredient.sourceType === "bottle" ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-xs text-copper/70 ml-1"
                                  }, "(Bottle)")) : createCommentVNode("", true)
                                ]),
                                createVNode(_component_UInput, {
                                  modelValue: ingredient.amount,
                                  "onUpdate:modelValue": ($event) => ingredient.amount = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  step: "0.25",
                                  class: "w-16",
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelect, {
                                  modelValue: ingredient.unit,
                                  "onUpdate:modelValue": ($event) => ingredient.unit = $event,
                                  items: unref(unitOptions),
                                  class: "w-20",
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeIngredient(index)
                                }, null, 8, ["onClick"])
                              ], 42, ["onDragstart", "onDragover", "onDrop"]);
                            }), 128)),
                            createVNode("div", { class: "flex gap-2 items-end" }, [
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(selectedIngredient),
                                "onUpdate:modelValue": ($event) => isRef(selectedIngredient) ? selectedIngredient.value = $event : null,
                                "value-key": "id",
                                items: unref(ingredientOptions),
                                class: "flex-1",
                                placeholder: "Select ingredient",
                                searchable: "",
                                loading: unref(creatingItem),
                                "create-item": { position: "bottom" },
                                onCreate: handleCreateItem
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items", "loading"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newIngredientAmount),
                                "onUpdate:modelValue": ($event) => isRef(newIngredientAmount) ? newIngredientAmount.value = $event : null,
                                modelModifiers: { number: true },
                                type: "number",
                                placeholder: "Amt",
                                class: "w-16"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_USelect, {
                                modelValue: unref(newIngredientUnit),
                                "onUpdate:modelValue": ($event) => isRef(newIngredientUnit) ? newIngredientUnit.value = $event : null,
                                items: unref(unitOptions),
                                class: "w-20"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UButton, {
                                icon: "i-lucide-plus",
                                onClick: addIngredient,
                                size: "sm"
                              })
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-3 gap-4" }, [
                        createVNode(_component_UFormField, { label: "Cost" }, {
                          default: withCtx(() => [
                            createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cost))), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Est. Price" }, {
                          default: withCtx(() => [
                            createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(("estimateCocktailPrice" in _ctx ? _ctx.estimateCocktailPrice : unref(estimateCocktailPrice))(unref(cost)))), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Price" }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).price,
                              "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              step: "0.01"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_FormImageUpload, {
                        modelValue: unref(localData).img,
                        "onUpdate:modelValue": ($event) => unref(localData).img = $event,
                        folder: "cocktails",
                        label: "Cocktail Photo"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(_component_UFormField, { label: "Description" }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).description,
                            "onUpdate:modelValue": ($event) => unref(localData).description = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
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
                  createVNode("h2", { class: "text-lg font-bold text-parchment font-[Cormorant_Garamond]" }, toDisplayString(isNew ? "New Cocktail" : "Edit Cocktail"), 1),
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
                            placeholder: "Cocktail name"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-3 gap-4" }, [
                        createVNode(_component_UFormField, { label: "Glassware" }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "flex gap-1" }, [
                              createVNode(_component_USelect, {
                                modelValue: unref(localData).glassware,
                                "onUpdate:modelValue": ($event) => unref(localData).glassware = $event,
                                items: unref(glasswareOptions),
                                class: "flex-1"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UPopover, null, {
                                content: withCtx(() => [
                                  createVNode("div", { class: "p-3 space-y-2 w-56" }, [
                                    createVNode("p", { class: "text-xs font-semibold text-parchment/70" }, "Manage Glassware"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(glasswareOptions), (g) => {
                                      return openBlock(), createBlock("div", {
                                        key: g,
                                        class: "flex items-center justify-between text-sm"
                                      }, [
                                        createVNode("span", null, toDisplayString(g), 1),
                                        createVNode(_component_UButton, {
                                          icon: "i-lucide-x",
                                          size: "xs",
                                          variant: "ghost",
                                          color: "error",
                                          onClick: ($event) => unref(removeGlassware)(g)
                                        }, null, 8, ["onClick"])
                                      ]);
                                    }), 128)),
                                    createVNode("div", { class: "flex gap-1" }, [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(newGlassware),
                                        "onUpdate:modelValue": ($event) => isRef(newGlassware) ? newGlassware.value = $event : null,
                                        placeholder: "Add new...",
                                        size: "xs",
                                        class: "flex-1",
                                        onKeyup: withKeys(($event) => {
                                          unref(addGlassware)(unref(newGlassware));
                                          newGlassware.value = "";
                                        }, ["enter"])
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeyup"]),
                                      createVNode(_component_UButton, {
                                        icon: "i-lucide-plus",
                                        size: "xs",
                                        onClick: ($event) => {
                                          unref(addGlassware)(unref(newGlassware));
                                          newGlassware.value = "";
                                        }
                                      }, null, 8, ["onClick"])
                                    ])
                                  ])
                                ]),
                                default: withCtx(() => [
                                  createVNode(_component_UButton, {
                                    icon: "i-lucide-settings-2",
                                    variant: "ghost",
                                    size: "xs",
                                    color: "neutral"
                                  })
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Menu" }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "flex gap-1" }, [
                              createVNode(_component_USelect, {
                                modelValue: unref(localData).menu,
                                "onUpdate:modelValue": ($event) => unref(localData).menu = $event,
                                items: unref(menuOptions),
                                class: "flex-1"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UPopover, null, {
                                content: withCtx(() => [
                                  createVNode("div", { class: "p-3 space-y-2 w-56" }, [
                                    createVNode("p", { class: "text-xs font-semibold text-parchment/70" }, "Manage Menus"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(menuOptions), (m) => {
                                      return openBlock(), createBlock("div", {
                                        key: m,
                                        class: "flex items-center justify-between text-sm"
                                      }, [
                                        createVNode("span", { class: "capitalize" }, toDisplayString(m), 1),
                                        createVNode(_component_UButton, {
                                          icon: "i-lucide-x",
                                          size: "xs",
                                          variant: "ghost",
                                          color: "error",
                                          onClick: ($event) => unref(removeMenu)(m)
                                        }, null, 8, ["onClick"])
                                      ]);
                                    }), 128)),
                                    createVNode("div", { class: "flex gap-1" }, [
                                      createVNode(_component_UInput, {
                                        modelValue: unref(newMenu),
                                        "onUpdate:modelValue": ($event) => isRef(newMenu) ? newMenu.value = $event : null,
                                        placeholder: "Add new...",
                                        size: "xs",
                                        class: "flex-1",
                                        onKeyup: withKeys(($event) => {
                                          unref(addMenu)(unref(newMenu));
                                          newMenu.value = "";
                                        }, ["enter"])
                                      }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeyup"]),
                                      createVNode(_component_UButton, {
                                        icon: "i-lucide-plus",
                                        size: "xs",
                                        onClick: ($event) => {
                                          unref(addMenu)(unref(newMenu));
                                          newMenu.value = "";
                                        }
                                      }, null, 8, ["onClick"])
                                    ])
                                  ])
                                ]),
                                default: withCtx(() => [
                                  createVNode(_component_UButton, {
                                    icon: "i-lucide-settings-2",
                                    variant: "ghost",
                                    size: "xs",
                                    color: "neutral"
                                  })
                                ]),
                                _: 1
                              })
                            ])
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Preparation" }, {
                          default: withCtx(() => [
                            createVNode(_component_USelect, {
                              modelValue: unref(localData).preparation,
                              "onUpdate:modelValue": ($event) => unref(localData).preparation = $event,
                              items: preparationOptions,
                              placeholder: "Select preparation method"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_UFormField, { label: "Ingredients" }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "space-y-2" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(localData).ingredients, (ingredient, index) => {
                              return openBlock(), createBlock("div", {
                                key: index,
                                class: ["flex items-center gap-2 rounded px-1 py-0.5 transition-colors", unref(dragIndex) === index ? "opacity-50 bg-brown/10" : ""],
                                draggable: "true",
                                onDragstart: ($event) => onDragStart(index, $event),
                                onDragover: ($event) => onDragOver(index, $event),
                                onDrop: ($event) => onDrop(index),
                                onDragend: onDragEnd
                              }, [
                                createVNode(_component_UIcon, {
                                  name: "i-lucide-grip-vertical",
                                  class: "text-parchment/60 cursor-grab shrink-0"
                                }),
                                createVNode("span", { class: "flex-1 text-sm truncate" }, [
                                  createTextVNode(toDisplayString(unref(getIngredientName)(ingredient)) + " ", 1),
                                  ingredient.sourceType === "bottle" ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "text-xs text-copper/70 ml-1"
                                  }, "(Bottle)")) : createCommentVNode("", true)
                                ]),
                                createVNode(_component_UInput, {
                                  modelValue: ingredient.amount,
                                  "onUpdate:modelValue": ($event) => ingredient.amount = $event,
                                  modelModifiers: { number: true },
                                  type: "number",
                                  step: "0.25",
                                  class: "w-16",
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                                createVNode(_component_USelect, {
                                  modelValue: ingredient.unit,
                                  "onUpdate:modelValue": ($event) => ingredient.unit = $event,
                                  items: unref(unitOptions),
                                  class: "w-20",
                                  size: "xs"
                                }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                                createVNode(_component_UButton, {
                                  icon: "i-lucide-trash-2",
                                  color: "error",
                                  variant: "ghost",
                                  size: "xs",
                                  onClick: ($event) => removeIngredient(index)
                                }, null, 8, ["onClick"])
                              ], 42, ["onDragstart", "onDragover", "onDrop"]);
                            }), 128)),
                            createVNode("div", { class: "flex gap-2 items-end" }, [
                              createVNode(_component_USelectMenu, {
                                modelValue: unref(selectedIngredient),
                                "onUpdate:modelValue": ($event) => isRef(selectedIngredient) ? selectedIngredient.value = $event : null,
                                "value-key": "id",
                                items: unref(ingredientOptions),
                                class: "flex-1",
                                placeholder: "Select ingredient",
                                searchable: "",
                                loading: unref(creatingItem),
                                "create-item": { position: "bottom" },
                                onCreate: handleCreateItem
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items", "loading"]),
                              createVNode(_component_UInput, {
                                modelValue: unref(newIngredientAmount),
                                "onUpdate:modelValue": ($event) => isRef(newIngredientAmount) ? newIngredientAmount.value = $event : null,
                                modelModifiers: { number: true },
                                type: "number",
                                placeholder: "Amt",
                                class: "w-16"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                              createVNode(_component_USelect, {
                                modelValue: unref(newIngredientUnit),
                                "onUpdate:modelValue": ($event) => isRef(newIngredientUnit) ? newIngredientUnit.value = $event : null,
                                items: unref(unitOptions),
                                class: "w-20"
                              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"]),
                              createVNode(_component_UButton, {
                                icon: "i-lucide-plus",
                                onClick: addIngredient,
                                size: "sm"
                              })
                            ])
                          ])
                        ]),
                        _: 1
                      }),
                      createVNode("div", { class: "grid grid-cols-3 gap-4" }, [
                        createVNode(_component_UFormField, { label: "Cost" }, {
                          default: withCtx(() => [
                            createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cost))), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Est. Price" }, {
                          default: withCtx(() => [
                            createVNode("span", { class: "text-sm" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(("estimateCocktailPrice" in _ctx ? _ctx.estimateCocktailPrice : unref(estimateCocktailPrice))(unref(cost)))), 1)
                          ]),
                          _: 1
                        }),
                        createVNode(_component_UFormField, { label: "Price" }, {
                          default: withCtx(() => [
                            createVNode(_component_UInput, {
                              modelValue: unref(localData).price,
                              "onUpdate:modelValue": ($event) => unref(localData).price = $event,
                              modelModifiers: { number: true },
                              type: "number",
                              step: "0.01"
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          _: 1
                        })
                      ]),
                      createVNode(_component_FormImageUpload, {
                        modelValue: unref(localData).img,
                        "onUpdate:modelValue": ($event) => unref(localData).img = $event,
                        folder: "cocktails",
                        label: "Cocktail Photo"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                      createVNode(_component_UFormField, { label: "Description" }, {
                        default: withCtx(() => [
                          createVNode(_component_UTextarea, {
                            modelValue: unref(localData).description,
                            "onUpdate:modelValue": ($event) => unref(localData).description = $event
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ]),
                        _: 1
                      }),
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Panel/PanelCocktail.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const PanelCocktail = Object.assign(_sfc_main, { __name: "PanelCocktail" });

export { PanelCocktail as default };
//# sourceMappingURL=PanelCocktail-BJW9EwD1.mjs.map

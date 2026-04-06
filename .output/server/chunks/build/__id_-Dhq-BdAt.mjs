import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$1 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$2 } from './SelectMenu-DljUyjmT.mjs';
import { _ as __nuxt_component_8 } from './BaseItemSelect-8IgvW2BX.mjs';
import { _ as __nuxt_component_7 } from './DashboardBatchCard-C6pNZSG8.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { b as allUnits } from './units-DWysHFem.mjs';
import { defineComponent, computed, ref, watch, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { s as stageBgColor, e as stageTextColor, c as STAGE_DISPLAY } from './batchPipeline-Dr1IalWc.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useItemStore, a as useUnitConversion } from './useItemStore-Cpj9s1UF.mjs';
import { a as useBatchStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { r as recipePrice, l as latestPrice } from './helpers-pfHQ8kqT.mjs';
import { L as LazyPanelRecipe } from './PanelRecipe-xlyuVp0h.mjs';
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
import './errorMessage-C32Dqgoz.mjs';
import './useRecipeColors-C1dzeggx.mjs';
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useProductionStore-SZxhegcf.mjs';
import './useBottleStore-NPRWrMTA.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();
    const recipeStore = useRecipeStore();
    const itemStore = useItemStore();
    const batchStore = useBatchStore();
    const { confirm } = useDeleteConfirm();
    const stageDisplay = (name) => STAGE_DISPLAY[name] || { icon: "i-lucide-circle", color: "neutral" };
    const recipe = computed(
      () => recipeStore.getRecipeById(route.params._id)
    );
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelRecipe);
    const editRecipe = () => {
      if (!recipe.value) return;
      recipeStore.setRecipe(recipe.value._id);
      panel.open();
    };
    const deleteRecipe = async () => {
      if (!recipe.value) return;
      const confirmed = await confirm("Recipe", recipe.value.name);
      if (!confirmed) return;
      await recipeStore.deleteRecipe(recipe.value._id);
      toast.add({ title: "Recipe deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/recipes");
    };
    const totalCost = computed(() => {
      if (!recipe.value) return 0;
      return recipePrice(recipe.value);
    });
    const { ingredientCost } = useUnitConversion();
    const editableIngredients = ref([]);
    watch(
      () => recipe.value?.items,
      (items) => {
        if (items) {
          editableIngredients.value = items.map((ing) => ({ ...ing }));
        }
      },
      { immediate: true, deep: true }
    );
    const ingredientsDirty = computed(() => {
      if (!recipe.value?.items) return false;
      const original = recipe.value.items;
      const edited = editableIngredients.value;
      if (original.length !== edited.length) return true;
      return original.some((orig, i) => {
        const ed = edited[i];
        return orig._id !== ed._id || orig.amount !== ed.amount || orig.unit !== ed.unit;
      });
    });
    const savingIngredients = ref(false);
    const saveIngredients = async () => {
      if (!recipe.value || !ingredientsDirty.value) return;
      savingIngredients.value = true;
      try {
        recipeStore.setRecipe(recipe.value._id);
        recipeStore.recipe.items = editableIngredients.value.map((ing) => ({
          _id: ing._id,
          amount: ing.amount,
          unit: ing.unit
        }));
        await recipeStore.updateRecipe();
        toast.add({
          title: "Ingredients updated",
          color: "success",
          icon: "i-lucide-check-circle"
        });
      } finally {
        savingIngredients.value = false;
      }
    };
    const resetIngredients = () => {
      if (recipe.value?.items) {
        editableIngredients.value = recipe.value.items.map((ing) => ({ ...ing }));
      }
    };
    const removeIngredient = (index) => {
      editableIngredients.value.splice(index, 1);
    };
    const newIngredient = ref({
      _id: "",
      amount: null,
      unit: ""
    });
    const addIngredient = () => {
      if (!newIngredient.value._id || !newIngredient.value.amount || !newIngredient.value.unit) return;
      editableIngredients.value.push({
        _id: newIngredient.value._id,
        amount: newIngredient.value.amount,
        unit: newIngredient.value.unit
      });
      newIngredient.value = { _id: "", amount: null, unit: "" };
    };
    const ingredients = computed(() => {
      return editableIngredients.value.map((ing) => {
        const item = itemStore.getItemById(ing._id);
        const price = latestPrice(ing._id);
        const cost = ingredientCost(price, ing.amount, ing.unit, item?.inventoryUnit || ing.unit);
        return {
          id: ing._id,
          name: item?.name || "Unknown",
          amount: ing.amount,
          unit: ing.unit,
          pricePerUnit: price,
          cost
        };
      });
    });
    const relatedBatches = computed(
      () => batchStore.batches.filter((b) => b.recipe === route.params._id)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UInput = _sfc_main$1;
      const _component_USelectMenu = _sfc_main$2;
      const _component_BaseItemSelect = __nuxt_component_8;
      const _component_DashboardBatchCard = __nuxt_component_7;
      if (!unref(recipeStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(recipe)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(recipe).name,
          subtitle: `${unref(recipe).class}${unref(recipe).type ? " - " + unref(recipe).type : ""}`,
          icon: "i-lucide-book-open"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/recipes")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Back `);
                  } else {
                    return [
                      createTextVNode(" Back ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-pencil",
                size: "sm",
                onClick: editRecipe
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Edit `);
                  } else {
                    return [
                      createTextVNode(" Edit ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-trash-2",
                color: "error",
                variant: "soft",
                size: "sm",
                onClick: deleteRecipe
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Delete `);
                  } else {
                    return [
                      createTextVNode(" Delete ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  icon: "i-lucide-arrow-left",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: ($event) => unref(router).push("/admin/recipes")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editRecipe
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Edit ")
                  ]),
                  _: 1
                }),
                createVNode(_component_UButton, {
                  icon: "i-lucide-trash-2",
                  color: "error",
                  variant: "soft",
                  size: "sm",
                  onClick: deleteRecipe
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Delete ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"> Recipe Info </h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1"> Class </div><div class="text-sm text-parchment">${ssrInterpolate(unref(recipe).class)}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1"> Type </div><div class="text-sm text-parchment">${ssrInterpolate(unref(recipe).type || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1"> Volume </div><div class="text-sm text-parchment">${ssrInterpolate(unref(recipe).volume)} ${ssrInterpolate(unref(recipe).volumeUnit)}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1"> Total Cost </div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalCost)))}</div></div></div></div>`);
        if (unref(recipe).pipeline?.length) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"> Production Pipeline `);
          if (unref(recipe).pipelineTemplate) {
            _push(`<span class="text-sm font-normal text-parchment/50 ml-2"> (${ssrInterpolate(unref(recipe).pipelineTemplate)}) </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</h3><div class="flex items-center flex-wrap gap-1"><!--[-->`);
          ssrRenderList(unref(recipe).pipeline, (stage, index) => {
            _push(`<div class="flex items-center"><div class="${ssrRenderClass([unref(stageBgColor)(stageDisplay(stage).color), "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"])}">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: stageDisplay(stage).icon,
              class: unref(stageTextColor)(stageDisplay(stage).color)
            }, null, _parent));
            _push(`<span class="text-sm text-parchment">${ssrInterpolate(stage)}</span></div>`);
            if (index < unref(recipe).pipeline.length - 1) {
              _push(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-chevron-right",
                class: "text-parchment/50 mx-1 shrink-0"
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"> Ingredients </h3>`);
        if (unref(ingredientsDirty)) {
          _push(`<div class="flex items-center gap-2"><span class="text-xs text-amber-400 flex items-center gap-1">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-circle-dot",
            class: "text-xs"
          }, null, _parent));
          _push(` Unsaved changes </span>`);
          _push(ssrRenderComponent(_component_UButton, {
            size: "xs",
            variant: "outline",
            color: "neutral",
            onClick: resetIngredients
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Reset `);
              } else {
                return [
                  createTextVNode(" Reset ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_UButton, {
            size: "xs",
            icon: "i-lucide-save",
            loading: unref(savingIngredients),
            onClick: saveIngredients
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Save `);
              } else {
                return [
                  createTextVNode(" Save ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(editableIngredients).length > 0 || unref(newIngredient)._id) {
          _push(`<div class="space-y-0"><div class="grid grid-cols-[1fr_100px_100px_90px_70px_36px] sm:grid-cols-[1fr_100px_120px_90px_80px_36px] gap-2 pb-2 text-xs text-parchment/60 uppercase tracking-wider"><span>Item</span><span>Amount</span><span>Unit</span><span>Price/Unit</span><span class="text-right">Cost</span><span></span></div><!--[-->`);
          ssrRenderList(unref(ingredients), (ing, i) => {
            _push(`<div class="grid grid-cols-[1fr_100px_100px_90px_70px_36px] sm:grid-cols-[1fr_100px_120px_90px_80px_36px] gap-2 py-1.5 items-center border-t border-brown/10">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/items/${ing.id}`,
              class: "text-sm text-gold hover:text-copper transition-colors truncate"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(ing.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(ing.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UInput, {
              modelValue: unref(editableIngredients)[i].amount,
              "onUpdate:modelValue": ($event) => unref(editableIngredients)[i].amount = $event,
              modelModifiers: { number: true },
              type: "number",
              size: "sm",
              ui: { base: "text-sm" },
              step: "any",
              min: "0"
            }, null, _parent));
            _push(ssrRenderComponent(_component_USelectMenu, {
              modelValue: unref(editableIngredients)[i].unit,
              "onUpdate:modelValue": ($event) => unref(editableIngredients)[i].unit = $event,
              items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
              size: "sm"
            }, null, _parent));
            _push(`<span class="text-sm text-parchment/60">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(ing.pricePerUnit))}</span><span class="text-sm text-parchment text-right">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(ing.cost))}</span>`);
            _push(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-trash-2",
              color: "error",
              variant: "ghost",
              size: "xs",
              onClick: ($event) => removeIngredient(i)
            }, null, _parent));
            _push(`</div>`);
          });
          _push(`<!--]--><div class="grid grid-cols-[1fr_100px_100px_90px_70px_36px] sm:grid-cols-[1fr_100px_120px_90px_80px_36px] gap-2 pt-3 mt-2 border-t border-brown/30 items-center">`);
          _push(ssrRenderComponent(_component_BaseItemSelect, {
            modelValue: unref(newIngredient)._id,
            "onUpdate:modelValue": ($event) => unref(newIngredient)._id = $event,
            placeholder: "Add item...",
            size: "sm"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(newIngredient).amount,
            "onUpdate:modelValue": ($event) => unref(newIngredient).amount = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Amt",
            size: "sm",
            step: "any",
            min: "0"
          }, null, _parent));
          _push(ssrRenderComponent(_component_USelectMenu, {
            modelValue: unref(newIngredient).unit,
            "onUpdate:modelValue": ($event) => unref(newIngredient).unit = $event,
            items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
            placeholder: "Unit",
            size: "sm"
          }, null, _parent));
          _push(`<span></span><span></span>`);
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-plus",
            size: "xs",
            disabled: !unref(newIngredient)._id || !unref(newIngredient).amount || !unref(newIngredient).unit,
            onClick: addIngredient
          }, null, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<div class="space-y-4"><div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-package-open",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No ingredients listed</p></div><div class="grid grid-cols-[1fr_100px_100px_36px] gap-2 items-center">`);
          _push(ssrRenderComponent(_component_BaseItemSelect, {
            modelValue: unref(newIngredient)._id,
            "onUpdate:modelValue": ($event) => unref(newIngredient)._id = $event,
            placeholder: "Add item...",
            size: "sm"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(newIngredient).amount,
            "onUpdate:modelValue": ($event) => unref(newIngredient).amount = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Amt",
            size: "sm",
            step: "any",
            min: "0"
          }, null, _parent));
          _push(ssrRenderComponent(_component_USelectMenu, {
            modelValue: unref(newIngredient).unit,
            "onUpdate:modelValue": ($event) => unref(newIngredient).unit = $event,
            items: "allUnits" in _ctx ? _ctx.allUnits : unref(allUnits),
            placeholder: "Unit",
            size: "sm"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-plus",
            size: "xs",
            disabled: !unref(newIngredient)._id || !unref(newIngredient).amount || !unref(newIngredient).unit,
            onClick: addIngredient
          }, null, _parent));
          _push(`</div></div>`);
        }
        _push(`</div>`);
        if (unref(recipe).directions) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"> Directions </h3><p class="text-sm text-parchment/60 whitespace-pre-wrap">${ssrInterpolate(unref(recipe).directions)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"> Related Batches </h3>`);
        if (unref(relatedBatches).length > 0) {
          _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"><!--[-->`);
          ssrRenderList(unref(relatedBatches), (b) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: b._id,
              to: `/admin/batch/${b._id}`,
              class: "hover:scale-[1.02] transition-transform"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_DashboardBatchCard, {
                    "batch-id": b._id
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_DashboardBatchCard, {
                      "batch-id": b._id
                    }, null, 8, ["batch-id"])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-flask-conical",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No batches use this recipe</p></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Recipe not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/recipes")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Recipes `);
            } else {
              return [
                createTextVNode(" Back to Recipes ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/recipes/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-Dhq-BdAt.mjs.map

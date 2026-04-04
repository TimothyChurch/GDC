import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { u as useCocktailStore, a as useIngredientResolver } from './useCocktailStore-CByyovs8.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { e as estimateCocktailPrice } from './definitions-C7fnFA_u.mjs';
import { L as LazyPanelCocktail } from './PanelCocktail-6ckGDRJ_.mjs';
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
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';
import './useBottleStore-NPRWrMTA.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const cocktailStore = useCocktailStore();
    const { resolveAllIngredients } = useIngredientResolver();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const cocktail = computed(() => cocktailStore.getCocktailById(route.params._id));
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelCocktail);
    const editCocktail = () => {
      if (!cocktail.value) return;
      cocktailStore.setCocktail(cocktail.value._id);
      panel.open();
    };
    const deleteCocktail = async () => {
      if (!cocktail.value) return;
      const confirmed = await confirm("Cocktail", cocktail.value.name);
      if (!confirmed) return;
      await cocktailStore.deleteCocktail(cocktail.value._id);
      toast.add({ title: "Cocktail deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/cocktails");
    };
    const cost = computed(() => {
      if (!cocktail.value) return 0;
      return cocktailStore.cocktailCost(cocktail.value._id);
    });
    const approxPrice = computed(() => {
      return estimateCocktailPrice(cost.value);
    });
    const margin = computed(() => {
      if (!cocktail.value?.price || cost.value === 0) return 0;
      return (cocktail.value.price - cost.value) / cocktail.value.price * 100;
    });
    const ingredients = computed(() => {
      if (!cocktail.value?.ingredients?.length) return [];
      return resolveAllIngredients(cocktail.value.ingredients);
    });
    const menuLabel = computed(() => {
      switch (cocktail.value?.menu) {
        case "main":
          return "Main Menu";
        case "seasonal":
          return "Seasonal";
        case "shots":
          return "Shots";
        default:
          return "Off Menu";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      if (!unref(cocktailStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(cocktail)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(cocktail).name,
          subtitle: unref(menuLabel),
          icon: "i-lucide-martini"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/cocktails")
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
                onClick: editCocktail
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
                onClick: deleteCocktail
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
                  onClick: ($event) => unref(router).push("/admin/cocktails")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editCocktail
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
                  onClick: deleteCocktail
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
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Cocktail Info</h3><div class="grid grid-cols-2 sm:grid-cols-5 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Glassware</div><div class="text-sm text-parchment">${ssrInterpolate(unref(cocktail).glassware || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Menu</div><div class="text-sm text-parchment">${ssrInterpolate(unref(menuLabel))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Preparation</div><div class="text-sm text-parchment">${ssrInterpolate(unref(cocktail).preparation || "Not specified")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Visible</div><span class="${ssrRenderClass([unref(cocktail).visible ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25", "inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border"])}">${ssrInterpolate(unref(cocktail).visible ? "Yes" : "No")}</span></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Price</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cocktail).price || 0))}</div></div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Cost Analysis</h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Ingredient Cost</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cost)))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Suggested Price</div><div class="text-sm text-parchment/60">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(approxPrice)))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Actual Price</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cocktail).price || 0))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Margin</div><div class="${ssrRenderClass([unref(margin) > 50 ? "text-green-400" : unref(margin) > 30 ? "text-gold" : "text-red-400", "text-sm font-semibold"])}">${ssrInterpolate(unref(margin).toFixed(1))}% </div></div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Ingredients</h3>`);
        if (unref(ingredients).length > 0) {
          _push(`<div class="divide-y divide-brown/20"><div class="hidden sm:grid grid-cols-4 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider"><span>Item</span><span>Amount</span><span>Price/Unit</span><span class="text-right">Cost</span></div><!--[-->`);
          ssrRenderList(unref(ingredients), (ing, i) => {
            _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 py-2 text-sm">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: ing.link,
              class: "text-gold hover:text-copper transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(ing.name)} `);
                  if (ing.sourceType === "bottle") {
                    _push2(`<span class="text-xs text-copper/70 ml-1"${_scopeId}>(Bottle)</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                } else {
                  return [
                    createTextVNode(toDisplayString(ing.name) + " ", 1),
                    ing.sourceType === "bottle" ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-xs text-copper/70 ml-1"
                    }, "(Bottle)")) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="text-parchment/60">${ssrInterpolate(ing.amount)} ${ssrInterpolate(ing.unit)}</span><span class="text-parchment/60 hidden sm:block">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(ing.pricePerUnit))}</span><span class="text-parchment text-right">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(ing.cost))}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-package-open",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No ingredients listed</p></div>`);
        }
        _push(`</div>`);
        if (unref(cocktail).description) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Description</h3><p class="text-sm text-parchment/60">${ssrInterpolate(unref(cocktail).description)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(cocktail).directions) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Directions</h3><p class="text-sm text-parchment/60 whitespace-pre-wrap">${ssrInterpolate(unref(cocktail).directions)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Cocktail not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/cocktails")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Cocktails `);
            } else {
              return [
                createTextVNode(" Back to Cocktails ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/cocktails/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-SD8eyri_.mjs.map

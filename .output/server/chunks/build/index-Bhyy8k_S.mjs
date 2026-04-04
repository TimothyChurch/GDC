import { _ as __nuxt_component_0 } from './SitePageHero-6cglFhn2.mjs';
import { a as useSeoMeta, e as _sfc_main$8, b as __nuxt_component_2 } from './server.mjs';
import { _ as _sfc_main$1 } from './Input-Fd8Vd_4J.mjs';
import { _ as __nuxt_component_3 } from './CardCocktail-KoOQdgKr.mjs';
import { defineComponent, ref, computed, unref, isRef, createSlots, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
import { u as usePublicCocktailStore } from './usePublicCocktailStore-Bf4dI_bQ.mjs';
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
import './formatting-DpuwJPOk.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "Cocktail Menu | Galveston Distilling Co",
        description: "Explore our handcrafted cocktail menu featuring island-inspired drinks made with our own spirits.",
        ogTitle: "Cocktail Menu | Galveston Distilling Co",
        ogDescription: "Explore our handcrafted cocktail menu featuring island-inspired drinks made with our own spirits.",
        ogImage: "https://galvestondistilling.com/images/og-menu.jpg",
        ogUrl: "https://galvestondistilling.com/menu"
      });
    }
    const cocktailStore = usePublicCocktailStore();
    const search = ref("");
    const activeCategory = ref("All");
    const activeSpirit = ref("All");
    const spiritCategoryMap = [
      [/vodka/i, "Vodka"],
      [/bourbon/i, "Whiskey"],
      [/rye/i, "Whiskey"],
      [/whisk(e)?y/i, "Whiskey"],
      [/gin/i, "Gin"],
      [/rum/i, "Rum"],
      [/tequila/i, "Tequila"],
      [/mezcal/i, "Tequila"],
      [/brandy/i, "Brandy"],
      [/cognac/i, "Brandy"],
      [/absinthe/i, "Absinthe"],
      [/liqueur|cordial|amaretto|schnapps|triple sec/i, "Liqueur"],
      [/vermouth|amaro|aperol|campari/i, "Amaro"]
    ];
    const getSpiritCategory = (text) => {
      for (const [pattern, category] of spiritCategoryMap) {
        if (pattern.test(text)) return category;
      }
      return null;
    };
    const getBaseSpirit = (cocktail) => {
      for (const ing of cocktail.ingredients) {
        const category = getSpiritCategory(ing.name);
        if (category) return category;
      }
      return null;
    };
    const visibleCocktails = computed(() => cocktailStore.cocktails);
    const categories = computed(() => {
      const menus = visibleCocktails.value.map((c) => c.menu).filter(Boolean);
      return ["All", ...new Set(menus)];
    });
    const spiritTypes = computed(() => {
      const spirits = visibleCocktails.value.map((c) => getBaseSpirit(c)).filter(Boolean);
      return ["All", ...new Set(spirits)].sort((a, b) => {
        if (a === "All") return -1;
        if (b === "All") return 1;
        return a.localeCompare(b);
      });
    });
    const filteredCocktails = computed(() => {
      let result = visibleCocktails.value;
      if (activeCategory.value !== "All") {
        result = result.filter((c) => c.menu === activeCategory.value);
      }
      if (activeSpirit.value !== "All") {
        result = result.filter((c) => getBaseSpirit(c) === activeSpirit.value);
      }
      if (search.value) {
        const q = search.value.toLowerCase();
        result = result.filter(
          (c) => c.name.toLowerCase().includes(q) || c.ingredients.some(
            (ing) => ing.name.toLowerCase().includes(q)
          )
        );
      }
      return result;
    });
    const hasActiveFilters = computed(() => {
      return search.value || activeCategory.value !== "All" || activeSpirit.value !== "All";
    });
    const clearFilters = () => {
      search.value = "";
      activeCategory.value = "All";
      activeSpirit.value = "All";
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SitePageHero = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_UInput = _sfc_main$1;
      const _component_Icon = __nuxt_component_2;
      const _component_CardCocktail = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_SitePageHero, {
        title: "Cocktail Menu",
        subtitle: "Handcrafted cocktails featuring our house-distilled spirits",
        "background-image": "/images/cocktail.jpg"
      }, null, _parent));
      _push(`<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">`);
      if (unref(categories).length > 2) {
        _push(`<div class="mb-4"><p class="text-xs uppercase tracking-wider text-brown/60 dark:text-parchment/60 text-center mb-2">Menu</p><div role="tablist" aria-label="Menu categories" class="flex flex-wrap gap-2 justify-center"><!--[-->`);
        ssrRenderList(unref(categories), (cat) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: cat,
            role: "tab",
            "aria-selected": unref(activeCategory) === cat,
            label: cat,
            size: "sm",
            variant: unref(activeCategory) === cat ? "solid" : "soft",
            class: [
              unref(activeCategory) === cat ? "bg-gold text-espresso" : "bg-charcoal/5 dark:bg-parchment/10 text-brown/70 dark:text-parchment/70 hover:bg-gold/20",
              "rounded-full"
            ],
            onClick: ($event) => activeCategory.value = cat
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(spiritTypes).length > 2) {
        _push(`<div class="mb-6"><p class="text-xs uppercase tracking-wider text-brown/60 dark:text-parchment/60 text-center mb-2">Base Spirit</p><div role="tablist" aria-label="Base spirit filter" class="flex flex-wrap gap-2 justify-center"><!--[-->`);
        ssrRenderList(unref(spiritTypes), (spirit) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: spirit,
            role: "tab",
            "aria-selected": unref(activeSpirit) === spirit,
            label: spirit,
            size: "sm",
            variant: unref(activeSpirit) === spirit ? "solid" : "soft",
            class: [
              unref(activeSpirit) === spirit ? "bg-copper text-parchment" : "bg-charcoal/5 dark:bg-parchment/10 text-brown/70 dark:text-parchment/70 hover:bg-copper/20",
              "rounded-full"
            ],
            onClick: ($event) => activeSpirit.value = spirit
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="max-w-md mx-auto mb-8">`);
      _push(ssrRenderComponent(_component_UInput, {
        type: "text",
        modelValue: unref(search),
        "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
        placeholder: "Search cocktails or ingredients...",
        class: "w-full",
        size: "lg"
      }, createSlots({ _: 2 }, [
        unref(search)?.length ? {
          name: "trailing",
          fn: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                variant: "ghost",
                icon: "i-lucide-x",
                size: "sm",
                onClick: ($event) => search.value = ""
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  variant: "ghost",
                  icon: "i-lucide-x",
                  size: "sm",
                  onClick: ($event) => search.value = ""
                }, null, 8, ["onClick"])
              ];
            }
          }),
          key: "0"
        } : void 0
      ]), _parent));
      _push(`</div>`);
      if (unref(cocktailStore).loading) {
        _push(`<div class="flex justify-center py-12"><span class="text-brown/50 dark:text-parchment/50">Loading cocktails...</span></div>`);
      } else if (unref(filteredCocktails).length === 0) {
        _push(`<div class="text-center py-12">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:drink-02",
          class: "text-4xl text-brown/20 dark:text-parchment/20 mb-3"
        }, null, _parent));
        _push(`<p class="text-brown/50 dark:text-parchment/50">No cocktails found</p>`);
        if (unref(hasActiveFilters)) {
          _push(ssrRenderComponent(_component_UButton, {
            variant: "link",
            label: "Clear filters",
            class: "mt-3 text-gold hover:text-copper",
            onClick: clearFilters
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="grid md:grid-cols-2 gap-6"><!--[-->`);
        ssrRenderList(unref(filteredCocktails), (cocktail) => {
          _push(ssrRenderComponent(_component_CardCocktail, {
            key: cocktail._id,
            cocktail
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/menu/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bhyy8k_S.mjs.map

import { c as __nuxt_component_1$1 } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as usePublicCocktailStore } from './usePublicCocktailStore-Bf4dI_bQ.mjs';
import { s as seededShuffle, t as todaySeed } from './seededShuffle-TO6Y8aIc.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SiteFeaturedCocktails",
  __ssrInlineRender: true,
  setup(__props) {
    const cocktailStore = usePublicCocktailStore();
    const featuredCocktails = computed(() => {
      if (!cocktailStore.cocktails.length) return [];
      return seededShuffle(cocktailStore.cocktails, todaySeed()).slice(0, 3);
    });
    const getIngredientNames = (cocktail) => {
      return cocktail.ingredients.map((ing) => ing.name).filter((name) => name && name !== "Unknown").join(", ");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "py-16 sm:py-24 bg-charcoal/5 dark:bg-parchment/5" }, _attrs))}><div class="mx-auto max-w-7xl px-6 lg:px-8"><div class="text-center mb-12"><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold"> From Our Bar </h2><div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div><p class="mt-4 text-brown/70 dark:text-parchment/70 max-w-xl mx-auto"> Handcrafted cocktails featuring our house-distilled spirits </p></div><div class="grid md:grid-cols-3 gap-8"><!--[-->`);
      ssrRenderList(unref(featuredCocktails), (cocktail) => {
        _push(`<div class="bg-cream dark:bg-charcoal rounded-lg p-6 border border-gold/10 hover:border-gold/30 transition-colors duration-300"><div class="flex items-start justify-between mb-3"><h3 class="font-[Cormorant_Garamond] text-xl font-bold">${ssrInterpolate(cocktail.name)}</h3><span class="text-gold font-semibold whitespace-nowrap ml-3">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(cocktail.price))}</span></div><div class="w-8 h-0.5 bg-gold/40 mb-3"></div>`);
        if (cocktail.description) {
          _push(`<p class="text-sm text-brown/70 dark:text-parchment/70 mb-3">${ssrInterpolate(cocktail.description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="text-xs italic text-brown/50 dark:text-parchment/50">${ssrInterpolate(getIngredientNames(cocktail))}</p></div>`);
      });
      _push(`<!--]--></div><div class="text-center mt-10">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/menu",
        class: "inline-block rounded-md border border-gold px-6 py-2.5 text-sm font-semibold text-gold hover:bg-gold hover:text-espresso transition-colors duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` View Full Menu `);
          } else {
            return [
              createTextVNode(" View Full Menu ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteFeaturedCocktails.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SiteFeaturedCocktails = Object.assign(_sfc_main, { __name: "SiteFeaturedCocktails" });

export { SiteFeaturedCocktails as default };
//# sourceMappingURL=SiteFeaturedCocktails-BDaQtH4m.mjs.map

import { a as useSeoMeta, d as __nuxt_component_0$2, c as __nuxt_component_1$1, b as __nuxt_component_2 } from './server.mjs';
import { defineComponent, defineAsyncComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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

const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtImg = __nuxt_component_0$2;
  const _component_NuxtLink = __nuxt_component_1$1;
  const _component_Icon = __nuxt_component_2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-[90vh] flex items-center justify-center overflow-hidden" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_NuxtImg, {
    src: "/images/hero.jpg",
    alt: "Galveston Craft Spirits Distillery",
    class: "absolute inset-0 w-full h-full object-cover",
    loading: "eager",
    fetchpriority: "high",
    width: "1920",
    height: "1080",
    densities: "x1 x2",
    format: "webp",
    quality: "80"
  }, null, _parent));
  _push(`<div class="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-espresso/20"></div><div class="relative z-10 text-center px-6 max-w-3xl mx-auto"><p class="text-sm uppercase tracking-[0.3em] text-gold/80 font-semibold mb-4"> Galveston Island, Texas </p><h1 class="font-[Cormorant_Garamond] text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-parchment drop-shadow-lg"> Crafting Spirits with Island Flair </h1><div class="mt-6 flex items-center justify-center gap-3"><div class="h-px w-12 bg-gold/50"></div><div class="w-1.5 h-1.5 rounded-full bg-gold"></div><div class="h-px w-12 bg-gold/50"></div></div><p class="mt-6 text-lg sm:text-xl text-parchment/85 max-w-2xl mx-auto leading-relaxed"> Nestled in the heart of Galveston, our small-batch distillery captures the essence of the island in every bottle. </p><div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/bottles",
    class: "rounded-md bg-gold px-8 py-3.5 text-sm font-semibold text-espresso shadow-md hover:bg-copper transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Explore Our Spirits `);
      } else {
        return [
          createTextVNode(" Explore Our Spirits ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/menu",
    class: "rounded-md border border-parchment/40 px-8 py-3.5 text-sm font-semibold text-parchment hover:bg-parchment/10 transition-colors duration-300"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` View Cocktail Menu `);
      } else {
        return [
          createTextVNode(" View Cocktail Menu ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div><div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">`);
  _push(ssrRenderComponent(_component_Icon, {
    name: "carbon:chevron-down",
    class: "text-parchment/60 text-2xl"
  }, null, _parent));
  _push(`</div></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteHero.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]), { __name: "SiteHero" });
const __nuxt_component_1_lazy = defineAsyncComponent(() => import('./SiteCategories-B_vpnbKz.mjs').then((c) => c.default || c));
const __nuxt_component_2_lazy = defineAsyncComponent(() => import('./SiteFeaturedSpirits-CCn4aSIk.mjs').then((c) => c.default || c));
const __nuxt_component_3_lazy = defineAsyncComponent(() => import('./SiteFeaturedCocktails-BDaQtH4m.mjs').then((c) => c.default || c));
const __nuxt_component_4_lazy = defineAsyncComponent(() => import('./SiteVisitCTA-ExLZrC-c.mjs').then((c) => c.default || c));
const __nuxt_component_5_lazy = defineAsyncComponent(() => import('./SiteNewsletter-B9VGLiVP.mjs').then((c) => c.default || c));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "Galveston Distilling Co | Handcrafted Texas Spirits",
        description: "Small-batch spirits handcrafted on Galveston Island, Texas. Visit our tasting room, explore our spirits, and book cocktail classes.",
        ogTitle: "Galveston Distilling Co | Handcrafted Texas Spirits",
        ogDescription: "Small-batch spirits handcrafted on Galveston Island, Texas. Visit our tasting room, explore our spirits, and book cocktail classes.",
        ogImage: "https://galvestondistilling.com/images/og-home.jpg",
        ogUrl: "https://galvestondistilling.com"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SiteHero = __nuxt_component_0;
      const _component_LazySiteCategories = __nuxt_component_1_lazy;
      const _component_LazySiteFeaturedSpirits = __nuxt_component_2_lazy;
      const _component_LazySiteFeaturedCocktails = __nuxt_component_3_lazy;
      const _component_LazySiteVisitCTA = __nuxt_component_4_lazy;
      const _component_LazySiteNewsletter = __nuxt_component_5_lazy;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_SiteHero, null, null, _parent));
      _push(ssrRenderComponent(_component_LazySiteCategories, null, null, _parent));
      _push(ssrRenderComponent(_component_LazySiteFeaturedSpirits, null, null, _parent));
      _push(ssrRenderComponent(_component_LazySiteFeaturedCocktails, null, null, _parent));
      _push(ssrRenderComponent(_component_LazySiteVisitCTA, null, null, _parent));
      _push(ssrRenderComponent(_component_LazySiteNewsletter, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BnoVZQhz.mjs.map

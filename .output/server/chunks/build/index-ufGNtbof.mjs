import { _ as __nuxt_component_0 } from './SitePageHero-6cglFhn2.mjs';
import { a as useSeoMeta, c as __nuxt_component_1$1, d as __nuxt_component_0$2 } from './server.mjs';
import { defineComponent, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "Events | Galveston Distilling Co",
        description: "Book cocktail classes, distillery tours, and spirit tastings at Galveston Distilling Co.",
        ogTitle: "Events | Galveston Distilling Co",
        ogDescription: "Book cocktail classes, distillery tours, and spirit tastings at Galveston Distilling Co.",
        ogImage: "https://galvestondistilling.com/images/og-events.jpg",
        ogUrl: "https://galvestondistilling.com/events"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SitePageHero = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_NuxtImg = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_SitePageHero, {
        title: "Events & Experiences",
        subtitle: "Join us at our Galveston tasting room for classes, tours, and more",
        "background-image": "/images/class.jpg"
      }, null, _parent));
      _push(`<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"><div class="text-center mb-12"><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold"> What We Offer </h2><div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div></div><div class="grid md:grid-cols-3 gap-8 mb-16">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/events/cocktailClass",
        class: "group bg-cream dark:bg-charcoal rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 hover:shadow-lg transition-all duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="aspect-[4/3] overflow-hidden"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtImg, {
              src: "/images/class.jpg",
              alt: "Cocktail Class",
              class: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
              width: "400",
              height: "300",
              loading: "lazy",
              sizes: "sm:100vw md:33vw",
              format: "webp"
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="p-6"${_scopeId}><h3 class="font-[Cormorant_Garamond] text-xl font-bold group-hover:text-gold transition-colors"${_scopeId}> Cocktail Classes </h3><p class="mt-2 text-sm text-brown/70 dark:text-parchment/70"${_scopeId}> Learn to craft cocktails from our expert bartenders. Perfect for date nights, team outings, or anyone who wants to up their mixology game. </p><span class="inline-block mt-4 text-sm font-semibold text-gold"${_scopeId}> Learn More → </span></div>`);
          } else {
            return [
              createVNode("div", { class: "aspect-[4/3] overflow-hidden" }, [
                createVNode(_component_NuxtImg, {
                  src: "/images/class.jpg",
                  alt: "Cocktail Class",
                  class: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                  width: "400",
                  height: "300",
                  loading: "lazy",
                  sizes: "sm:100vw md:33vw",
                  format: "webp"
                })
              ]),
              createVNode("div", { class: "p-6" }, [
                createVNode("h3", { class: "font-[Cormorant_Garamond] text-xl font-bold group-hover:text-gold transition-colors" }, " Cocktail Classes "),
                createVNode("p", { class: "mt-2 text-sm text-brown/70 dark:text-parchment/70" }, " Learn to craft cocktails from our expert bartenders. Perfect for date nights, team outings, or anyone who wants to up their mixology game. "),
                createVNode("span", { class: "inline-block mt-4 text-sm font-semibold text-gold" }, " Learn More → ")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="bg-cream dark:bg-charcoal rounded-xl overflow-hidden border border-gold/10"><div class="aspect-[4/3] overflow-hidden">`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        src: "/images/20231017_104945.jpg",
        alt: "Distillery Tour",
        class: "w-full h-full object-cover",
        width: "400",
        height: "300",
        loading: "lazy",
        sizes: "sm:100vw md:33vw",
        format: "webp"
      }, null, _parent));
      _push(`</div><div class="p-6"><h3 class="font-[Cormorant_Garamond] text-xl font-bold"> Distillery Tours </h3><p class="mt-2 text-sm text-brown/70 dark:text-parchment/70"> Go behind the scenes and see how we craft our spirits. Walk through the mashing, fermentation, and distillation processes with our distillers. </p><span class="inline-block mt-4 text-sm text-brown/50 dark:text-parchment/50"> Drop in during business hours </span></div></div><div class="bg-cream dark:bg-charcoal rounded-xl overflow-hidden border border-gold/10"><div class="aspect-[4/3] overflow-hidden bg-charcoal/5 dark:bg-parchment/5 flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        src: "/images/cocktail.jpg",
        alt: "Spirit Tastings",
        class: "w-full h-full object-cover",
        width: "400",
        height: "300",
        loading: "lazy",
        sizes: "sm:100vw md:33vw",
        format: "webp"
      }, null, _parent));
      _push(`</div><div class="p-6"><h3 class="font-[Cormorant_Garamond] text-xl font-bold"> Spirit Tastings </h3><p class="mt-2 text-sm text-brown/70 dark:text-parchment/70"> Sample our full lineup of small-batch spirits. Our knowledgeable staff will guide you through tasting notes, production methods, and food pairings. </p><span class="inline-block mt-4 text-sm text-brown/50 dark:text-parchment/50"> Available daily at the tasting room </span></div></div></div><div class="relative rounded-xl overflow-hidden">`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        src: "/images/20231205_174024 (3).jpg",
        alt: "Private events at Galveston Distilling",
        class: "absolute inset-0 w-full h-full object-cover",
        width: "1200",
        height: "600",
        loading: "lazy",
        densities: "x1 x2",
        format: "webp"
      }, null, _parent));
      _push(`<div class="absolute inset-0 bg-espresso/70"></div><div class="relative z-10 text-center px-6 py-16 sm:py-20"><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold text-parchment"> Host Your Event With Us </h2><p class="mt-4 text-parchment/80 max-w-xl mx-auto"> Looking for a unique venue? Our tasting room is available for private events, corporate gatherings, and celebrations. Let us create a custom experience for your group. </p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/contact?topic=private-events",
        class: "inline-block mt-8 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-espresso hover:bg-copper transition-colors duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Contact Us About Private Events `);
          } else {
            return [
              createTextVNode(" Contact Us About Private Events ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/events/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-ufGNtbof.mjs.map

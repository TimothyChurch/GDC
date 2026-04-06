import { a as useSeoMeta, d as __nuxt_component_0$2, f as _sfc_main$e, c as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, withCtx, createTextVNode, useSSRContext } from 'vue';
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
  __name: "about",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "About Us | Galveston Distilling Co",
        description: "Learn about Galveston Distilling Co — our story, our mission, and our commitment to crafting exceptional spirits on Galveston Island.",
        ogTitle: "About Us | Galveston Distilling Co",
        ogDescription: "Learn about Galveston Distilling Co — our story, our mission, and our commitment to crafting exceptional spirits on Galveston Island.",
        ogImage: "https://galvestondistilling.com/images/og-about.jpg",
        ogUrl: "https://galvestondistilling.com/about"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_0$2;
      const _component_UIcon = _sfc_main$e;
      const _component_NuxtLink = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(_attrs)}><section class="relative py-20 sm:py-28 bg-charcoal text-parchment"><div class="mx-auto max-w-7xl px-6 lg:px-8"><div class="max-w-3xl"><h1 class="font-[Cormorant_Garamond] text-4xl sm:text-5xl font-bold tracking-tight"> Our Story </h1><div class="mt-4 w-16 h-0.5 bg-gold"></div><p class="mt-6 text-lg text-parchment/80 leading-relaxed"> Galveston Distilling Company is a craft distillery on Galveston Island, Texas. We believe in small-batch production, quality ingredients, and the art of distillation. </p></div></div></section><section class="py-16 sm:py-24"><div class="mx-auto max-w-7xl px-6 lg:px-8"><div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"><div><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold text-brown dark:text-parchment"> Crafted with Island Character </h2><div class="mt-3 w-16 h-0.5 bg-gold"></div><p class="mt-6 text-brown/80 dark:text-parchment/80 leading-relaxed"> Every bottle we produce reflects the unique spirit of Galveston Island. From grain to glass, we oversee every step of the process to ensure the highest quality in every pour. </p><p class="mt-4 text-brown/80 dark:text-parchment/80 leading-relaxed"> Our tasting room is open to visitors who want to experience our spirits firsthand, learn about our process, and discover what makes island-distilled spirits truly special. </p></div><div class="aspect-[4/3] bg-charcoal/5 dark:bg-parchment/5 rounded-lg flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        src: "/images/Logo.png",
        alt: "Galveston Distilling Co",
        class: "max-h-48 object-contain",
        width: "192",
        height: "192",
        loading: "lazy",
        format: "webp"
      }, null, _parent));
      _push(`</div></div></div></section><section class="py-16 sm:py-24 bg-charcoal/5 dark:bg-parchment/5"><div class="mx-auto max-w-7xl px-6 lg:px-8"><div class="text-center mb-12"><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold text-brown dark:text-parchment"> What We Stand For </h2><div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-8"><div class="text-center"><div class="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-flask-conical",
        class: "text-xl text-gold"
      }, null, _parent));
      _push(`</div><h3 class="font-semibold text-brown dark:text-parchment mb-2">Small Batch</h3><p class="text-sm text-brown/70 dark:text-parchment/70"> Every batch is crafted with attention to detail, ensuring consistent quality and unique character. </p></div><div class="text-center"><div class="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-leaf",
        class: "text-xl text-gold"
      }, null, _parent));
      _push(`</div><h3 class="font-semibold text-brown dark:text-parchment mb-2">Quality Ingredients</h3><p class="text-sm text-brown/70 dark:text-parchment/70"> We source the finest grains and botanicals to create spirits that are smooth, complex, and memorable. </p></div><div class="text-center"><div class="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-map-pin",
        class: "text-xl text-gold"
      }, null, _parent));
      _push(`</div><h3 class="font-semibold text-brown dark:text-parchment mb-2">Island Made</h3><p class="text-sm text-brown/70 dark:text-parchment/70"> Proudly distilled on Galveston Island, Texas. Our spirits carry the warmth and character of the Gulf Coast. </p></div></div></div></section><section class="py-16 sm:py-24"><div class="mx-auto max-w-7xl px-6 lg:px-8 text-center"><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold text-brown dark:text-parchment"> Visit Our Tasting Room </h2><div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div><p class="mt-4 text-brown/70 dark:text-parchment/70 max-w-xl mx-auto"> Come experience our spirits in person. Tour the distillery, sample our latest releases, and discover your new favorite spirit. </p><div class="mt-8 flex justify-center gap-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/events",
        class: "inline-block rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-espresso hover:bg-copper transition-colors duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Book an Event `);
          } else {
            return [
              createTextVNode(" Book an Event ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/bottles",
        class: "inline-block rounded-md border border-gold px-6 py-2.5 text-sm font-semibold text-gold hover:bg-gold hover:text-espresso transition-colors duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` View Our Spirits `);
          } else {
            return [
              createTextVNode(" View Our Spirits ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=about-C2uoFTAC.mjs.map

import { d as __nuxt_component_0$2, c as __nuxt_component_1$1 } from './server.mjs';
import { mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
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

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtImg = __nuxt_component_0$2;
  const _component_NuxtLink = __nuxt_component_1$1;
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "relative py-24 overflow-hidden" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_NuxtImg, {
    src: "/images/20231017_104945.jpg",
    alt: "Galveston Distilling tasting room",
    class: "absolute inset-0 w-full h-full object-cover",
    loading: "lazy",
    width: "1920",
    height: "1080",
    densities: "x1 x2",
    format: "webp",
    quality: "80"
  }, null, _parent));
  _push(`<div class="absolute inset-0 bg-espresso/75"></div><div class="relative z-10 text-center px-6 max-w-3xl mx-auto"><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl md:text-5xl font-bold text-parchment"> Visit Our Tasting Room </h2><div class="mt-4 w-16 h-0.5 bg-gold mx-auto"></div><p class="mt-6 text-parchment/80 text-lg max-w-xl mx-auto"> 2618 Market St, Galveston, TX 77550 </p><p class="text-parchment/60 mt-1"> Monday - Saturday · 11:00 AM - 11:00 PM </p><div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"><a href="https://maps.google.com/?q=2618+Market+St+Galveston+TX+77550" target="_blank" rel="noopener noreferrer" class="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-espresso hover:bg-copper transition-colors duration-300"> Get Directions </a>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/events",
    class: "rounded-md border border-parchment/50 px-6 py-3 text-sm font-semibold text-parchment hover:bg-parchment/10 transition-colors duration-300"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` Upcoming Events `);
      } else {
        return [
          createTextVNode(" Upcoming Events ")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div></section>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteVisitCTA.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SiteVisitCTA = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]), { __name: "SiteVisitCTA" });

export { SiteVisitCTA as default };
//# sourceMappingURL=SiteVisitCTA-ExLZrC-c.mjs.map

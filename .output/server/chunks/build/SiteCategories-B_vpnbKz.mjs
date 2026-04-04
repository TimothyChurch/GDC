import { c as __nuxt_component_1$1, d as __nuxt_component_0$2 } from './server.mjs';
import { mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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

const _sfc_main = {
  __name: "SiteCategories",
  __ssrInlineRender: true,
  setup(__props) {
    const categories = [
      {
        name: "Cocktail Collection",
        href: "/menu",
        imageSrc: "/images/cocktail.jpg",
        imageAlt: "Handcrafted cocktail featuring house-distilled spirits",
        description: "Handcrafted cocktails featuring our house-distilled spirits, designed to showcase the unique character of each bottle."
      },
      {
        name: "Bottles",
        href: "/bottles",
        imageSrc: "/images/absinthe.jpg",
        imageAlt: "Small-batch craft spirits bottle",
        description: "Our full lineup of small-batch spirits — from smooth vodkas to complex whiskeys, each crafted with island character."
      },
      {
        name: "Events",
        href: "/events",
        imageSrc: "/images/class.jpg",
        imageAlt: "Cocktail class at the distillery tasting room",
        description: "Join us for cocktail classes, distillery tours, tastings, and more at our Galveston tasting room."
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_NuxtImg = __nuxt_component_0$2;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8" }, _attrs))}><div class="text-center mb-12"><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold"> Discover Galveston Distilling </h2><div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div></div><div class="space-y-12 lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-x-8"><!--[-->`);
      ssrRenderList(categories, (category) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: category.name,
          to: category.href,
          class: "group block"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="overflow-hidden rounded-lg"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtImg, {
                src: category.imageSrc,
                alt: category.imageAlt,
                width: "600",
                height: "720",
                class: "aspect-3/2 w-full object-cover group-hover:scale-105 transition-transform duration-500 lg:aspect-5/6",
                loading: "lazy",
                sizes: "sm:100vw lg:33vw",
                format: "webp"
              }, null, _parent2, _scopeId));
              _push2(`</div><h3 class="mt-4 text-lg font-semibold text-brown dark:text-parchment font-[Cormorant_Garamond]"${_scopeId}>${ssrInterpolate(category.name)}</h3><p class="mt-2 text-sm text-brown/70 dark:text-parchment/70"${_scopeId}>${ssrInterpolate(category.description)}</p>`);
            } else {
              return [
                createVNode("div", { class: "overflow-hidden rounded-lg" }, [
                  createVNode(_component_NuxtImg, {
                    src: category.imageSrc,
                    alt: category.imageAlt,
                    width: "600",
                    height: "720",
                    class: "aspect-3/2 w-full object-cover group-hover:scale-105 transition-transform duration-500 lg:aspect-5/6",
                    loading: "lazy",
                    sizes: "sm:100vw lg:33vw",
                    format: "webp"
                  }, null, 8, ["src", "alt"])
                ]),
                createVNode("h3", { class: "mt-4 text-lg font-semibold text-brown dark:text-parchment font-[Cormorant_Garamond]" }, toDisplayString(category.name), 1),
                createVNode("p", { class: "mt-2 text-sm text-brown/70 dark:text-parchment/70" }, toDisplayString(category.description), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></section>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteCategories.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=SiteCategories-B_vpnbKz.mjs.map

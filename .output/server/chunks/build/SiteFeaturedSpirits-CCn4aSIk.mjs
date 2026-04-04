import { c as __nuxt_component_1$1, d as __nuxt_component_0$2, b as __nuxt_component_2 } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as usePublicBottleStore } from './usePublicBottleStore-BpJ-2ITR.mjs';
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
  __name: "SiteFeaturedSpirits",
  __ssrInlineRender: true,
  setup(__props) {
    const bottleStore = usePublicBottleStore();
    const featuredBottles = computed(() => {
      const inStock = bottleStore.activeBottles.filter((b) => b.inStock);
      if (!inStock.length) return [];
      return seededShuffle(inStock, todaySeed()).slice(0, 4);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_NuxtImg = __nuxt_component_0$2;
      const _component_Icon = __nuxt_component_2;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "py-16 sm:py-24" }, _attrs))}><div class="mx-auto max-w-7xl px-6 lg:px-8"><div class="text-center mb-12"><h2 class="font-[Cormorant_Garamond] text-3xl sm:text-4xl font-bold"> Our Spirits </h2><div class="mt-3 w-16 h-0.5 bg-gold mx-auto"></div><p class="mt-4 text-brown/70 dark:text-parchment/70 max-w-xl mx-auto"> Small-batch spirits crafted with island character </p></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-6"><!--[-->`);
      ssrRenderList(unref(featuredBottles), (bottle) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: bottle._id,
          to: `/bottles/${bottle._id}`,
          class: "group text-center"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="aspect-[3/4] bg-charcoal/5 dark:bg-parchment/5 rounded-lg overflow-hidden mb-4 flex items-center justify-center"${_scopeId}>`);
              if (bottle.img) {
                _push2(ssrRenderComponent(_component_NuxtImg, {
                  src: bottle.img,
                  alt: bottle.name,
                  width: "400",
                  height: "533",
                  class: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                  loading: "lazy",
                  sizes: "sm:50vw lg:25vw",
                  format: "webp"
                }, null, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "lucide:wine",
                  class: "text-5xl text-brown/20 dark:text-parchment/20"
                }, null, _parent2, _scopeId));
              }
              _push2(`</div><h3 class="font-[Cormorant_Garamond] text-lg font-semibold group-hover:text-gold transition-colors"${_scopeId}>${ssrInterpolate(bottle.name)}</h3>`);
              if (bottle.class) {
                _push2(`<p class="text-sm text-brown/60 dark:text-parchment/60 mt-1"${_scopeId}>${ssrInterpolate(bottle.class)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (bottle.price) {
                _push2(`<p class="text-sm font-semibold text-gold mt-1"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(bottle.price))}</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("div", { class: "aspect-[3/4] bg-charcoal/5 dark:bg-parchment/5 rounded-lg overflow-hidden mb-4 flex items-center justify-center" }, [
                  bottle.img ? (openBlock(), createBlock(_component_NuxtImg, {
                    key: 0,
                    src: bottle.img,
                    alt: bottle.name,
                    width: "400",
                    height: "533",
                    class: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                    loading: "lazy",
                    sizes: "sm:50vw lg:25vw",
                    format: "webp"
                  }, null, 8, ["src", "alt"])) : (openBlock(), createBlock(_component_Icon, {
                    key: 1,
                    name: "lucide:wine",
                    class: "text-5xl text-brown/20 dark:text-parchment/20"
                  }))
                ]),
                createVNode("h3", { class: "font-[Cormorant_Garamond] text-lg font-semibold group-hover:text-gold transition-colors" }, toDisplayString(bottle.name), 1),
                bottle.class ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-sm text-brown/60 dark:text-parchment/60 mt-1"
                }, toDisplayString(bottle.class), 1)) : createCommentVNode("", true),
                bottle.price ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-sm font-semibold text-gold mt-1"
                }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(bottle.price)), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><div class="text-center mt-10">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/bottles",
        class: "inline-block rounded-md border border-gold px-6 py-2.5 text-sm font-semibold text-gold hover:bg-gold hover:text-espresso transition-colors duration-300"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` View All Spirits `);
          } else {
            return [
              createTextVNode(" View All Spirits ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteFeaturedSpirits.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SiteFeaturedSpirits = Object.assign(_sfc_main, { __name: "SiteFeaturedSpirits" });

export { SiteFeaturedSpirits as default };
//# sourceMappingURL=SiteFeaturedSpirits-CCn4aSIk.mjs.map

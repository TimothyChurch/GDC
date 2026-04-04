import { _ as __nuxt_component_0 } from './SitePageHero-6cglFhn2.mjs';
import { a as useSeoMeta, e as _sfc_main$8, b as __nuxt_component_2, c as __nuxt_component_1$1, d as __nuxt_component_0$2 } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, computed, unref, mergeProps, withCtx, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as usePublicBottleStore } from './usePublicBottleStore-BpJ-2ITR.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "CardBottle",
  __ssrInlineRender: true,
  props: {
    bottle: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_NuxtImg = __nuxt_component_0$2;
      const _component_Icon = __nuxt_component_2;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: `/bottles/${__props.bottle._id}`,
        class: "group block bg-cream dark:bg-charcoal rounded-lg overflow-hidden border border-gold/10 hover:border-gold/30 hover:shadow-lg transition-all duration-300"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="aspect-[3/4] bg-charcoal/5 dark:bg-parchment/5 overflow-hidden flex items-center justify-center"${_scopeId}>`);
            if (__props.bottle.img) {
              _push2(ssrRenderComponent(_component_NuxtImg, {
                src: __props.bottle.img,
                alt: __props.bottle.name,
                class: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                width: "400",
                height: "533",
                loading: "lazy",
                sizes: "sm:50vw lg:25vw",
                format: "webp"
              }, null, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:wine",
                class: "text-6xl text-brown/15 dark:text-parchment/15"
              }, null, _parent2, _scopeId));
            }
            _push2(`</div><div class="p-4"${_scopeId}><h3 class="font-[Cormorant_Garamond] text-lg font-bold leading-tight group-hover:text-gold transition-colors"${_scopeId}>${ssrInterpolate(__props.bottle.name)}</h3><div class="flex flex-wrap gap-1.5 mt-2"${_scopeId}>`);
            if (__props.bottle.class) {
              _push2(`<span class="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full"${_scopeId}>${ssrInterpolate(__props.bottle.class)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.bottle.type && __props.bottle.type !== "N/A") {
              _push2(`<span class="text-xs bg-copper/10 text-copper px-2 py-0.5 rounded-full"${_scopeId}>${ssrInterpolate(__props.bottle.type)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="flex items-center justify-between mt-3"${_scopeId}>`);
            if (__props.bottle.price) {
              _push2(`<span class="text-gold font-bold"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.bottle.price))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.bottle.abv) {
              _push2(`<span class="text-xs text-brown/50 dark:text-parchment/50"${_scopeId}>${ssrInterpolate(__props.bottle.abv)}% ABV </span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (__props.bottle.inStock !== true) {
              _push2(`<div class="mt-2"${_scopeId}><span class="text-xs text-red-400 font-semibold"${_scopeId}>Out of Stock</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "aspect-[3/4] bg-charcoal/5 dark:bg-parchment/5 overflow-hidden flex items-center justify-center" }, [
                __props.bottle.img ? (openBlock(), createBlock(_component_NuxtImg, {
                  key: 0,
                  src: __props.bottle.img,
                  alt: __props.bottle.name,
                  class: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                  width: "400",
                  height: "533",
                  loading: "lazy",
                  sizes: "sm:50vw lg:25vw",
                  format: "webp"
                }, null, 8, ["src", "alt"])) : (openBlock(), createBlock(_component_Icon, {
                  key: 1,
                  name: "lucide:wine",
                  class: "text-6xl text-brown/15 dark:text-parchment/15"
                }))
              ]),
              createVNode("div", { class: "p-4" }, [
                createVNode("h3", { class: "font-[Cormorant_Garamond] text-lg font-bold leading-tight group-hover:text-gold transition-colors" }, toDisplayString(__props.bottle.name), 1),
                createVNode("div", { class: "flex flex-wrap gap-1.5 mt-2" }, [
                  __props.bottle.class ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full"
                  }, toDisplayString(__props.bottle.class), 1)) : createCommentVNode("", true),
                  __props.bottle.type && __props.bottle.type !== "N/A" ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "text-xs bg-copper/10 text-copper px-2 py-0.5 rounded-full"
                  }, toDisplayString(__props.bottle.type), 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "flex items-center justify-between mt-3" }, [
                  __props.bottle.price ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-gold font-bold"
                  }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.bottle.price)), 1)) : createCommentVNode("", true),
                  __props.bottle.abv ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "text-xs text-brown/50 dark:text-parchment/50"
                  }, toDisplayString(__props.bottle.abv) + "% ABV ", 1)) : createCommentVNode("", true)
                ]),
                __props.bottle.inStock !== true ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "mt-2"
                }, [
                  createVNode("span", { class: "text-xs text-red-400 font-semibold" }, "Out of Stock")
                ])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Card/CardBottle.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "CardBottle" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "Our Spirits | Galveston Distilling Co",
        description: "Discover our collection of small-batch spirits crafted on Galveston Island, Texas.",
        ogTitle: "Our Spirits | Galveston Distilling Co",
        ogDescription: "Discover our collection of small-batch spirits crafted on Galveston Island, Texas.",
        ogImage: "https://galvestondistilling.com/images/og-spirits.jpg",
        ogUrl: "https://galvestondistilling.com/bottles"
      });
    }
    const bottleStore = usePublicBottleStore();
    const activeClass = ref("All");
    const spiritClasses = computed(() => {
      const classes = bottleStore.activeBottles.map((b) => b.class).filter(Boolean);
      return ["All", ...new Set(classes)];
    });
    const filteredBottles = computed(() => {
      if (activeClass.value === "All") return bottleStore.activeBottles;
      return bottleStore.activeBottles.filter((b) => b.class === activeClass.value);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SitePageHero = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_Icon = __nuxt_component_2;
      const _component_CardBottle = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_SitePageHero, {
        title: "Our Spirits",
        subtitle: "Small-batch spirits crafted with island character",
        "background-image": "/images/absinthe.jpg"
      }, null, _parent));
      _push(`<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">`);
      if (unref(spiritClasses).length > 2) {
        _push(`<div role="tablist" aria-label="Spirit categories" class="flex flex-wrap gap-2 mb-8 justify-center"><!--[-->`);
        ssrRenderList(unref(spiritClasses), (cls) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: cls,
            role: "tab",
            "aria-selected": unref(activeClass) === cls,
            label: cls,
            size: "sm",
            variant: unref(activeClass) === cls ? "solid" : "soft",
            class: [
              unref(activeClass) === cls ? "bg-gold text-espresso" : "bg-charcoal/5 dark:bg-parchment/10 text-brown/70 dark:text-parchment/70 hover:bg-gold/20",
              "rounded-full"
            ],
            onClick: ($event) => activeClass.value = cls
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(bottleStore).loading) {
        _push(`<div class="flex justify-center py-12"><span class="text-brown/50 dark:text-parchment/50">Loading spirits...</span></div>`);
      } else if (unref(filteredBottles).length === 0) {
        _push(`<div class="text-center py-12">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:wine",
          class: "text-4xl text-brown/20 dark:text-parchment/20 mb-3"
        }, null, _parent));
        _push(`<p class="text-brown/50 dark:text-parchment/50">No spirits found</p>`);
        if (unref(activeClass) !== "All") {
          _push(ssrRenderComponent(_component_UButton, {
            variant: "link",
            label: "Show all spirits",
            class: "mt-3 text-gold hover:text-copper",
            onClick: ($event) => activeClass.value = "All"
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"><!--[-->`);
        ssrRenderList(unref(filteredBottles), (bottle) => {
          _push(ssrRenderComponent(_component_CardBottle, {
            key: bottle._id,
            bottle
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bottles/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CW6Z2hN7.mjs.map

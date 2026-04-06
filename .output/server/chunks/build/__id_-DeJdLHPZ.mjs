import { u as useRoute, a as useSeoMeta, b as __nuxt_component_2, c as __nuxt_component_1$1, d as __nuxt_component_0$2 } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, withAsyncContext, computed, unref, mergeProps, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const cocktailStore = usePublicCocktailStore();
    [__temp, __restore] = withAsyncContext(() => cocktailStore.ensureLoaded()), await __temp, __restore();
    const cocktail = computed(() => cocktailStore.getCocktailById(route.params._id));
    useSeoMeta({
      title: () => cocktail.value ? `${cocktail.value.name} | Galveston Distilling Co` : "Cocktail | Galveston Distilling Co",
      description: () => cocktail.value?.description || "A handcrafted cocktail from Galveston Distilling Co.",
      ogTitle: () => cocktail.value ? `${cocktail.value.name} | Galveston Distilling Co` : "Cocktail",
      ogDescription: () => cocktail.value?.description || "A handcrafted cocktail from Galveston Distilling Co.",
      ogImage: () => cocktail.value?.img || "https://galvestondistilling.com/images/cocktail.jpg"
    });
    const formattedAmount = (amount) => {
      if (amount === 0) return "";
      const fractions = {
        "0.25": "¼",
        "0.33": "⅓",
        "0.5": "½",
        "0.67": "⅔",
        "0.75": "¾"
      };
      const whole = Math.floor(amount);
      const decimal = amount - whole;
      const decimalKey = decimal.toFixed(2);
      if (decimal === 0) return whole.toString();
      const fraction = fractions[decimalKey];
      if (fraction) {
        return whole > 0 ? `${whole}${fraction}` : fraction;
      }
      return amount % 1 === 0 ? amount.toString() : amount.toFixed(2).replace(/\.?0+$/, "");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_NuxtImg = __nuxt_component_0$2;
      if (!unref(cocktail)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-[60vh] flex flex-col items-center justify-center px-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "i-lucide-search-x",
          class: "text-5xl text-brown/30 dark:text-parchment/50 mb-4"
        }, null, _parent));
        _push(`<h1 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment mb-2"> Cocktail Not Found </h1><p class="text-brown/60 dark:text-parchment/60 mb-6"> We couldn&#39;t find the cocktail you&#39;re looking for. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/menu",
          class: "inline-flex items-center gap-2 px-6 py-3 bg-gold text-espresso font-semibold rounded-lg hover:bg-copper transition-colors duration-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "i-lucide-arrow-left",
                class: "text-lg"
              }, null, _parent2, _scopeId));
              _push2(` Back to Menu `);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: "i-lucide-arrow-left",
                  class: "text-lg"
                }),
                createTextVNode(" Back to Menu ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(_attrs)}><div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/menu",
          class: "inline-flex items-center gap-1.5 text-sm text-brown/60 dark:text-parchment/60 hover:text-gold transition-colors duration-200 group"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "i-lucide-arrow-left",
                class: "text-base transition-transform duration-200 group-hover:-translate-x-0.5"
              }, null, _parent2, _scopeId));
              _push2(` Back to Menu `);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: "i-lucide-arrow-left",
                  class: "text-base transition-transform duration-200 group-hover:-translate-x-0.5"
                }),
                createTextVNode(" Back to Menu ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(cocktail).img) {
          _push(`<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-6"><div class="overflow-hidden rounded-xl sm:rounded-2xl shadow-lg">`);
          _push(ssrRenderComponent(_component_NuxtImg, {
            src: unref(cocktail).img,
            alt: unref(cocktail).name,
            class: "w-full h-64 sm:h-80 md:h-96 object-cover",
            loading: "eager",
            format: "webp",
            quality: "85"
          }, null, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12"><div class="text-center"><h1 class="font-[Cormorant_Garamond] text-4xl sm:text-5xl md:text-6xl font-bold text-brown dark:text-parchment leading-tight">${ssrInterpolate(unref(cocktail).name)}</h1><p class="mt-3 text-xl sm:text-2xl text-gold font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cocktail).price))}</p></div><div class="flex justify-center my-8"><div class="w-24 h-0.5 bg-gold/50"></div></div>`);
        if (unref(cocktail).glassware || unref(cocktail).preparation) {
          _push(`<div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8">`);
          if (unref(cocktail).glassware) {
            _push(`<div class="flex items-center gap-2 text-brown/70 dark:text-parchment/70">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "carbon:drink-02",
              class: "text-lg text-gold"
            }, null, _parent));
            _push(`<span class="text-sm font-medium">${ssrInterpolate(unref(cocktail).glassware)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(cocktail).glassware && unref(cocktail).preparation) {
            _push(`<div class="w-px h-4 bg-brown/20 dark:bg-parchment/20"></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(cocktail).preparation) {
            _push(`<div class="flex items-center gap-2 text-brown/70 dark:text-parchment/70">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "i-lucide-chef-hat",
              class: "text-lg text-gold"
            }, null, _parent));
            _push(`<span class="text-sm font-medium">${ssrInterpolate(unref(cocktail).preparation)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(cocktail).description) {
          _push(`<p class="text-center text-lg text-brown/80 dark:text-parchment/80 leading-relaxed max-w-2xl mx-auto mb-10">${ssrInterpolate(unref(cocktail).description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid md:grid-cols-2 gap-8 md:gap-12"><div><h2 class="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-bold text-brown dark:text-parchment mb-5"> Ingredients </h2><ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(cocktail).ingredients, (ing, idx) => {
          _push(`<li class="flex items-baseline gap-3 text-brown/90 dark:text-parchment/90"><span class="text-gold font-bold whitespace-nowrap min-w-[4.5rem] text-right tabular-nums">${ssrInterpolate(formattedAmount(ing.amount))} ${ssrInterpolate(ing.unit)}</span><span class="font-medium">${ssrInterpolate(ing.name)}</span></li>`);
        });
        _push(`<!--]--></ul></div>`);
        if (unref(cocktail).directions) {
          _push(`<div><h2 class="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-bold text-brown dark:text-parchment mb-5"> Directions </h2><p class="text-brown/80 dark:text-parchment/80 leading-relaxed whitespace-pre-line">${ssrInterpolate(unref(cocktail).directions)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex justify-center my-10 sm:my-12"><div class="w-16 h-0.5 bg-gold/30"></div></div><div class="text-center">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/menu",
          class: "inline-flex items-center gap-2 px-8 py-3 bg-gold/10 text-gold border border-gold/30 font-semibold rounded-lg hover:bg-gold hover:text-espresso transition-all duration-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "i-lucide-arrow-left",
                class: "text-lg"
              }, null, _parent2, _scopeId));
              _push2(` Explore More Cocktails `);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: "i-lucide-arrow-left",
                  class: "text-lg"
                }),
                createTextVNode(" Explore More Cocktails ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/menu/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-DeJdLHPZ.mjs.map

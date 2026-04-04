import { u as useRoute, a as useSeoMeta, b as __nuxt_component_2, c as __nuxt_component_1$1, d as __nuxt_component_0$2 } from './server.mjs';
import { _ as __nuxt_component_3 } from './CardCocktail-KoOQdgKr.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as usePublicBottleStore } from './usePublicBottleStore-BpJ-2ITR.mjs';
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
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const bottleStore = usePublicBottleStore();
    const cocktailStore = usePublicCocktailStore();
    const bottle = computed(() => {
      return bottleStore.getBottleById(route.params.id);
    });
    const relatedCocktails = computed(() => {
      if (!bottle.value) return [];
      const bottleType = bottle.value.type && bottle.value.type !== "N/A" ? bottle.value.type.toLowerCase() : null;
      const bottleClass = bottle.value.class?.toLowerCase();
      const typeTerm = bottleType || (bottleClass && !bottleClass.includes("/") && !bottleClass.includes(" or ") ? bottleClass : null);
      const bottleName = bottle.value.name?.toLowerCase();
      if (!typeTerm && !bottleName) return [];
      return cocktailStore.cocktails.filter(
        (c) => c.ingredients.some((ing) => {
          const ingName = ing.name.toLowerCase();
          if (typeTerm && (ingName.includes(typeTerm) || typeTerm.includes(ingName))) {
            return true;
          }
          if (bottleName && (ingName.includes(bottleName) || bottleName.includes(ingName))) {
            return true;
          }
          return false;
        })
      ).slice(0, 3);
    });
    const proof = computed(() => {
      if (!bottle.value?.abv) return null;
      return (bottle.value.abv * 2).toFixed(0);
    });
    useSeoMeta({
      title: () => bottle.value ? `${bottle.value.name} | Galveston Distilling Co` : "Spirit Details | Galveston Distilling Co",
      description: () => bottle.value?.description || "Handcrafted spirit from Galveston Distilling Co."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_2;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_NuxtImg = __nuxt_component_0$2;
      const _component_CardCocktail = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (!unref(bottle)) {
        _push(`<div class="flex flex-col items-center justify-center py-24">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:wine",
          class: "text-5xl text-brown/20 dark:text-parchment/20 mb-4"
        }, null, _parent));
        _push(`<p class="text-brown/50 dark:text-parchment/50 text-lg">Bottle not found</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/bottles",
          class: "mt-4 text-gold hover:text-copper transition-colors text-sm font-semibold"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` ← Back to all spirits `);
            } else {
              return [
                createTextVNode(" ← Back to all spirits ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div><div class="bg-charcoal/5 dark:bg-parchment/5"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/bottles",
          class: "inline-flex items-center gap-1 text-sm text-gold hover:text-copper transition-colors mb-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, { name: "carbon:arrow-left" }, null, _parent2, _scopeId));
              _push2(` Back to all spirits `);
            } else {
              return [
                createVNode(_component_Icon, { name: "carbon:arrow-left" }),
                createTextVNode(" Back to all spirits ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start"><div class="aspect-[3/4] bg-charcoal/5 dark:bg-parchment/5 rounded-xl overflow-hidden flex items-center justify-center">`);
        if (unref(bottle).img) {
          _push(ssrRenderComponent(_component_NuxtImg, {
            src: unref(bottle).img,
            alt: unref(bottle).name,
            class: "w-full h-full object-cover",
            width: "600",
            height: "800",
            format: "webp"
          }, null, _parent));
        } else {
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:wine",
            class: "text-8xl text-brown/10 dark:text-parchment/10"
          }, null, _parent));
        }
        _push(`</div><div><div class="flex flex-wrap gap-2 mb-3">`);
        if (unref(bottle).class) {
          _push(`<span class="text-xs bg-gold/15 text-gold px-3 py-1 rounded-full font-semibold">${ssrInterpolate(unref(bottle).class)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(bottle).type && unref(bottle).type !== "N/A") {
          _push(`<span class="text-xs bg-copper/15 text-copper px-3 py-1 rounded-full font-semibold">${ssrInterpolate(unref(bottle).type)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><h1 class="font-[Cormorant_Garamond] text-4xl sm:text-5xl font-bold leading-tight">${ssrInterpolate(unref(bottle).name)}</h1><div class="flex items-center gap-4 mt-4">`);
        if (unref(bottle).price) {
          _push(`<span class="text-2xl font-bold text-gold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(bottle).price))}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(bottle).inStock === true) {
          _push(`<span class="text-xs bg-green-500/15 text-green-600 dark:text-green-400 px-3 py-1 rounded-full font-semibold"> In Stock </span>`);
        } else {
          _push(`<span class="text-xs bg-red-500/15 text-red-500 px-3 py-1 rounded-full font-semibold"> Out of Stock </span>`);
        }
        _push(`</div><div class="w-12 h-0.5 bg-gold/40 my-6"></div>`);
        if (unref(bottle).description) {
          _push(`<p class="text-brown/70 dark:text-parchment/70 leading-relaxed text-lg">${ssrInterpolate(unref(bottle).description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-8 grid grid-cols-2 gap-4">`);
        if (unref(bottle).abv) {
          _push(`<div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10"><span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider">ABV</span><p class="text-xl font-bold mt-1">${ssrInterpolate(unref(bottle).abv)}%</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(proof)) {
          _push(`<div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10"><span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider">Proof</span><p class="text-xl font-bold mt-1">${ssrInterpolate(unref(proof))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(bottle).class) {
          _push(`<div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10"><span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider">Class</span><p class="text-lg font-semibold mt-1">${ssrInterpolate(unref(bottle).class)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(bottle).type && unref(bottle).type !== "N/A") {
          _push(`<div class="bg-cream dark:bg-charcoal rounded-lg p-4 border border-gold/10"><span class="text-xs text-brown/50 dark:text-parchment/50 uppercase tracking-wider">Type</span><p class="text-lg font-semibold mt-1">${ssrInterpolate(unref(bottle).type)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div></div>`);
        if (unref(relatedCocktails).length) {
          _push(`<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12"><div class="text-center mb-8"><h2 class="font-[Cormorant_Garamond] text-2xl sm:text-3xl font-bold"> Cocktails Featuring This Spirit </h2><div class="mt-3 w-12 h-0.5 bg-gold mx-auto"></div></div><div class="grid md:grid-cols-3 gap-6"><!--[-->`);
          ssrRenderList(unref(relatedCocktails), (cocktail) => {
            _push(ssrRenderComponent(_component_CardCocktail, {
              key: cocktail._id,
              cocktail
            }, null, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bottles/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CHiynfvz.mjs.map

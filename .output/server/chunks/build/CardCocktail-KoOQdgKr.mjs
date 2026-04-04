import { c as __nuxt_component_1$1, b as __nuxt_component_2 } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, mergeProps, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CardCocktail",
  __ssrInlineRender: true,
  props: {
    cocktail: {}
  },
  setup(__props) {
    const props = __props;
    const ingredientNames = computed(() => {
      return props.cocktail.ingredients.map((ing) => ing.name).filter((name) => name && name !== "Unknown").join(", ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_Icon = __nuxt_component_2;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: `/menu/${__props.cocktail._id}`,
        class: "block bg-cream dark:bg-charcoal rounded-lg p-5 border border-gold/10 hover:border-gold/30 hover:shadow-lg transition-all duration-300"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-start justify-between gap-3"${_scopeId}><h3 class="font-[Cormorant_Garamond] text-xl sm:text-2xl font-bold leading-tight"${_scopeId}>${ssrInterpolate(__props.cocktail.name)}</h3><span class="text-gold font-bold text-lg whitespace-nowrap"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.cocktail.price))}</span></div><div class="w-10 h-0.5 bg-gold/40 my-3"${_scopeId}></div>`);
            if (__props.cocktail.description) {
              _push2(`<p class="text-sm text-brown/70 dark:text-parchment/70 mb-3 leading-relaxed"${_scopeId}>${ssrInterpolate(__props.cocktail.description)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<p class="text-xs italic text-brown/50 dark:text-parchment/50"${_scopeId}>${ssrInterpolate(unref(ingredientNames))}</p>`);
            if (__props.cocktail.glassware) {
              _push2(`<div class="mt-3 flex items-center gap-1.5 text-xs text-brown/60 dark:text-parchment/60"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "carbon:drink-02",
                class: "text-sm"
              }, null, _parent2, _scopeId));
              _push2(`<span${_scopeId}>${ssrInterpolate(__props.cocktail.glassware)}</span></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "flex items-start justify-between gap-3" }, [
                createVNode("h3", { class: "font-[Cormorant_Garamond] text-xl sm:text-2xl font-bold leading-tight" }, toDisplayString(__props.cocktail.name), 1),
                createVNode("span", { class: "text-gold font-bold text-lg whitespace-nowrap" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.cocktail.price)), 1)
              ]),
              createVNode("div", { class: "w-10 h-0.5 bg-gold/40 my-3" }),
              __props.cocktail.description ? (openBlock(), createBlock("p", {
                key: 0,
                class: "text-sm text-brown/70 dark:text-parchment/70 mb-3 leading-relaxed"
              }, toDisplayString(__props.cocktail.description), 1)) : createCommentVNode("", true),
              createVNode("p", { class: "text-xs italic text-brown/50 dark:text-parchment/50" }, toDisplayString(unref(ingredientNames)), 1),
              __props.cocktail.glassware ? (openBlock(), createBlock("div", {
                key: 1,
                class: "mt-3 flex items-center gap-1.5 text-xs text-brown/60 dark:text-parchment/60"
              }, [
                createVNode(_component_Icon, {
                  name: "carbon:drink-02",
                  class: "text-sm"
                }),
                createVNode("span", null, toDisplayString(__props.cocktail.glassware), 1)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Card/CardCocktail.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main, { __name: "CardCocktail" });

export { __nuxt_component_3 as _ };
//# sourceMappingURL=CardCocktail-KoOQdgKr.mjs.map

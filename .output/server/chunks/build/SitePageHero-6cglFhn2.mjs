import { d as __nuxt_component_0$2 } from './server.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SitePageHero",
  __ssrInlineRender: true,
  props: {
    title: {},
    subtitle: {},
    backgroundImage: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtImg = __nuxt_component_0$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative min-h-[40vh] flex items-center justify-center overflow-hidden" }, _attrs))}>`);
      if (__props.backgroundImage) {
        _push(ssrRenderComponent(_component_NuxtImg, {
          src: __props.backgroundImage,
          alt: __props.title,
          class: "absolute inset-0 w-full h-full object-cover",
          loading: "eager",
          fetchpriority: "high",
          width: "1920",
          height: "1080",
          densities: "x1 x2",
          format: "webp",
          quality: "80"
        }, null, _parent));
      } else {
        _push(`<div class="absolute inset-0 bg-charcoal"></div>`);
      }
      _push(`<div class="absolute inset-0 bg-espresso/60"></div><div class="relative z-10 text-center px-6 py-16"><h1 class="font-[Cormorant_Garamond] text-4xl sm:text-5xl md:text-6xl font-bold text-parchment drop-shadow-lg">${ssrInterpolate(__props.title)}</h1><div class="mt-4 w-16 h-0.5 bg-gold mx-auto"></div>`);
      if (__props.subtitle) {
        _push(`<p class="mt-4 text-lg text-parchment/80 max-w-2xl mx-auto">${ssrInterpolate(__props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SitePageHero.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "SitePageHero" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=SitePageHero-6cglFhn2.mjs.map

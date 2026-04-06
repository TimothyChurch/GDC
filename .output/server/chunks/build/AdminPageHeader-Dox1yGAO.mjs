import { f as _sfc_main$e } from './server.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminPageHeader",
  __ssrInlineRender: true,
  props: {
    title: {},
    subtitle: {},
    icon: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" }, _attrs))}><div class="flex items-center gap-3">`);
      if (__props.icon) {
        _push(ssrRenderComponent(_component_UIcon, {
          name: __props.icon,
          class: "text-2xl text-gold shrink-0"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div><h1 class="text-2xl font-bold text-parchment font-[Cormorant_Garamond]">${ssrInterpolate(__props.title)}</h1>`);
      if (__props.subtitle) {
        _push(`<p class="text-sm text-parchment/60 mt-0.5">${ssrInterpolate(__props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (_ctx.$slots.actions) {
        _push(`<div class="flex items-center gap-2">`);
        ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Admin/AdminPageHeader.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "AdminPageHeader" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=AdminPageHeader-Dox1yGAO.mjs.map

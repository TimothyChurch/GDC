import { f as _sfc_main$e, e as _sfc_main$8 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BaseEmptyState",
  __ssrInlineRender: true,
  props: {
    icon: {},
    title: {},
    description: {},
    actionLabel: {}
  },
  emits: ["action"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
      if (__props.icon) {
        _push(ssrRenderComponent(_component_UIcon, {
          name: __props.icon,
          class: "text-3xl text-parchment/50 mx-auto mb-3"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<p class="text-sm font-medium text-parchment/70 mb-1">${ssrInterpolate(__props.title)}</p>`);
      if (__props.description) {
        _push(`<p class="text-xs text-parchment/50 mb-4">${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.actionLabel) {
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus-circle",
          variant: "ghost",
          size: "sm",
          onClick: ($event) => _ctx.$emit("action")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(__props.actionLabel)}`);
            } else {
              return [
                createTextVNode(toDisplayString(__props.actionLabel), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Base/BaseEmptyState.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main, { __name: "BaseEmptyState" });

export { __nuxt_component_6 as _ };
//# sourceMappingURL=BaseEmptyState-BmEkGz1p.mjs.map

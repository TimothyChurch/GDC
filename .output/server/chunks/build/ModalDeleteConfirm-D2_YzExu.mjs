import { _ as _sfc_main$1 } from './Modal-GBrZNdlF.mjs';
import { e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import 'reka-ui';
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
  __name: "ModalDeleteConfirm",
  __ssrInlineRender: true,
  props: {
    entityName: {},
    entityLabel: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UModal = _sfc_main$1;
      const _component_UIcon = _sfc_main$e;
      const _component_UButton = _sfc_main$8;
      _push(ssrRenderComponent(_component_UModal, mergeProps({
        onClose: ($event) => emit("close", false)
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-alert-triangle",
              class: "text-red-500 size-5"
            }, null, _parent2, _scopeId));
            _push2(`<span${_scopeId}>Delete ${ssrInterpolate(props.entityName)}</span></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2" }, [
                createVNode(_component_UIcon, {
                  name: "i-lucide-alert-triangle",
                  class: "text-red-500 size-5"
                }),
                createVNode("span", null, "Delete " + toDisplayString(props.entityName), 1)
              ])
            ];
          }
        }),
        body: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p${_scopeId}> Are you sure you want to delete `);
            if (props.entityLabel) {
              _push2(`<strong${_scopeId}>${ssrInterpolate(props.entityLabel)}</strong>`);
            } else {
              _push2(`<span${_scopeId}>this ${ssrInterpolate(props.entityName.toLowerCase())}</span>`);
            }
            _push2(`? </p><p class="text-sm text-neutral-500 mt-2"${_scopeId}>This action cannot be undone.</p>`);
          } else {
            return [
              createVNode("p", null, [
                createTextVNode(" Are you sure you want to delete "),
                props.entityLabel ? (openBlock(), createBlock("strong", { key: 0 }, toDisplayString(props.entityLabel), 1)) : (openBlock(), createBlock("span", { key: 1 }, "this " + toDisplayString(props.entityName.toLowerCase()), 1)),
                createTextVNode("? ")
              ]),
              createVNode("p", { class: "text-sm text-neutral-500 mt-2" }, "This action cannot be undone.")
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "outline",
              onClick: ($event) => emit("close", false)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Cancel`);
                } else {
                  return [
                    createTextVNode("Cancel")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              color: "error",
              onClick: ($event) => emit("close", true)
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Delete`);
                } else {
                  return [
                    createTextVNode("Delete")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex justify-end gap-2" }, [
                createVNode(_component_UButton, {
                  color: "neutral",
                  variant: "outline",
                  onClick: ($event) => emit("close", false)
                }, {
                  default: withCtx(() => [
                    createTextVNode("Cancel")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  color: "error",
                  onClick: ($event) => emit("close", true)
                }, {
                  default: withCtx(() => [
                    createTextVNode("Delete")
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Modal/ModalDeleteConfirm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ModalDeleteConfirm = Object.assign(_sfc_main, { __name: "ModalDeleteConfirm" });

export { ModalDeleteConfirm as default };
//# sourceMappingURL=ModalDeleteConfirm-D2_YzExu.mjs.map

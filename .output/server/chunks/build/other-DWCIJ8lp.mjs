import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8 } from './server.mjs';
import { _ as __nuxt_component_2 } from './TableInventoryCategory-BHv6O_mI.mjs';
import { defineComponent, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
import './Badge-BJMjvXJU.mjs';
import './Table-BV7aBYOB.mjs';
import './Input-Fd8Vd_4J.mjs';
import './FormField-DcXe0kwN.mjs';
import './Select-xxK8NqZT.mjs';
import '@tanstack/vue-table';
import '@tanstack/vue-virtual';
import './Switch-BH6j8VnQ.mjs';
import './BaseEmptyState-BmEkGz1p.mjs';
import './units-DWysHFem.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';
import './useDeleteConfirm-ChUK9dnx.mjs';
import './useTableHelpers-DFWtCr-k.mjs';
import './PanelItem-vALhuSqS.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "other",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableInventoryCategory = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Other Supplies",
        subtitle: "Cleaning supplies, lab supplies, and miscellaneous items",
        icon: "i-lucide-box"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-arrow-left",
              variant: "outline",
              color: "neutral",
              size: "sm",
              to: "/admin/inventory"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Back `);
                } else {
                  return [
                    createTextVNode(" Back ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                to: "/admin/inventory"
              }, {
                default: withCtx(() => [
                  createTextVNode(" Back ")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TableInventoryCategory, { category: "Other" }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/inventory/other.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=other-DWCIJ8lp.mjs.map

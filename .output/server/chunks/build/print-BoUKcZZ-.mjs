import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$1 } from './Switch-BH6j8VnQ.mjs';
import { e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { defineComponent, ref, computed, withCtx, isRef, unref, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { d as useInventoryCategories, u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
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
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "print",
  __ssrInlineRender: true,
  setup(__props) {
    const categories = useInventoryCategories();
    const itemStore = useItemStore();
    const inventoryStore = useInventoryStore();
    const showOutOfStock = ref(false);
    function getLatestQuantity(itemId) {
      const records = inventoryStore.getInventoriesByItem(itemId);
      if (records.length === 0) return 0;
      const sorted = [...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sorted[0].quantity;
    }
    const categorizedItems = computed(
      () => categories.value.map((cat) => {
        const allItems = itemStore.getItemsByCategory(cat.category);
        const items = showOutOfStock.value ? allItems : allItems.filter((item) => getLatestQuantity(item._id) > 0);
        return { ...cat, items };
      }).filter((cat) => cat.items.length > 0)
    );
    const outOfStockTotal = computed(() => {
      let count = 0;
      for (const cat of categories.value) {
        const items = itemStore.getItemsByCategory(cat.category);
        count += items.filter((item) => getLatestQuantity(item._id) <= 0).length;
      }
      return count;
    });
    const printSheet = () => (void 0).print();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_USwitch = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="print:hidden">`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Printable Inventory Sheet",
        subtitle: "Print a blank count sheet for manual inventory",
        icon: "i-lucide-printer"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<label class="flex items-center gap-2 cursor-pointer select-none"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_USwitch, {
              modelValue: unref(showOutOfStock),
              "onUpdate:modelValue": ($event) => isRef(showOutOfStock) ? showOutOfStock.value = $event : null
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-xs text-parchment/60"${_scopeId}> Include out-of-stock `);
            if (unref(outOfStockTotal) > 0) {
              _push2(`<span class="text-red-400/70"${_scopeId}>(${ssrInterpolate(unref(outOfStockTotal))})</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</span></label>`);
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
            _push2(ssrRenderComponent(_component_UButton, {
              onClick: printSheet,
              icon: "i-lucide-printer"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Print`);
                } else {
                  return [
                    createTextVNode("Print")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("label", { class: "flex items-center gap-2 cursor-pointer select-none" }, [
                createVNode(_component_USwitch, {
                  modelValue: unref(showOutOfStock),
                  "onUpdate:modelValue": ($event) => isRef(showOutOfStock) ? showOutOfStock.value = $event : null
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode("span", { class: "text-xs text-parchment/60" }, [
                  createTextVNode(" Include out-of-stock "),
                  unref(outOfStockTotal) > 0 ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-red-400/70"
                  }, "(" + toDisplayString(unref(outOfStockTotal)) + ")", 1)) : createCommentVNode("", true)
                ])
              ]),
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
              }),
              createVNode(_component_UButton, {
                onClick: printSheet,
                icon: "i-lucide-printer"
              }, {
                default: withCtx(() => [
                  createTextVNode("Print")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div id="inventory-sheet" class="hidden print:block"><div class="text-center mb-4"><h1 class="text-xl font-bold">Galveston Distilling Co</h1><h2 class="text-lg">Raw Materials Inventory Count Sheet</h2><p class="text-sm mt-1">Date: ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleDateString())}</p></div><div class="mb-6 text-sm"> Counted by: ________________________________________ </div><!--[-->`);
      ssrRenderList(unref(categorizedItems), (cat) => {
        _push(`<div class="mb-6"><h3 class="text-base font-bold mb-2">${ssrInterpolate(cat.label)}</h3><table class="w-full border-collapse"><thead><tr><th class="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">Item Name</th><th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-20">Unit</th><th class="border border-gray-400 px-3 py-2 text-center text-sm font-semibold w-24">Count</th><th class="border border-gray-400 px-3 py-2 text-left text-sm font-semibold w-40">Notes</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(cat.items, (item) => {
          _push(`<tr><td class="border border-gray-400 px-3 py-3 text-sm">${ssrInterpolate(item.name)}</td><td class="border border-gray-400 px-3 py-3 text-sm text-center">${ssrInterpolate(item.inventoryUnit || "")}</td><td class="border border-gray-400 px-3 py-3"> </td><td class="border border-gray-400 px-3 py-3"> </td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      });
      _push(`<!--]--></div><div class="print:hidden"><div class="bg-charcoal rounded-xl border border-brown/30 p-6"><div class="text-center mb-6"><h2 class="text-xl font-bold text-parchment font-[Cormorant_Garamond]">Galveston Distilling Co</h2><p class="text-sm text-parchment/60">Raw Materials Inventory Count Sheet</p><p class="text-xs text-parchment/50 mt-1">Date: ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleDateString())}</p></div><!--[-->`);
      ssrRenderList(unref(categorizedItems), (cat) => {
        _push(`<div class="mb-6"><h3 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-2 flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: cat.icon,
          class: "text-gold"
        }, null, _parent));
        _push(` ${ssrInterpolate(cat.label)}</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/30"><th class="text-left px-3 py-2 text-xs text-parchment/60 uppercase tracking-wider">Item Name</th><th class="text-center px-3 py-2 text-xs text-parchment/60 uppercase tracking-wider w-20">Unit</th><th class="text-center px-3 py-2 text-xs text-parchment/60 uppercase tracking-wider w-24">Count</th><th class="text-left px-3 py-2 text-xs text-parchment/60 uppercase tracking-wider w-40">Notes</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(cat.items, (item) => {
          _push(`<tr class="border-b border-brown/15 last:border-0"><td class="px-3 py-2 text-parchment">${ssrInterpolate(item.name)}</td><td class="px-3 py-2 text-center text-parchment/60">${ssrInterpolate(item.inventoryUnit || "")}</td><td class="px-3 py-2 text-center text-parchment/50">___</td><td class="px-3 py-2 text-parchment/50">___</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/inventory/print.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=print-BoUKcZZ-.mjs.map

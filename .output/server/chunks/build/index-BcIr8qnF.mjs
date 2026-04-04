import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1, f as _sfc_main$e } from './server.mjs';
import { defineComponent, computed, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { d as useInventoryCategories, u as useItemStore, g as getStockStatus } from './useItemStore-Cpj9s1UF.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
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
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const categories = useInventoryCategories();
    const itemStore = useItemStore();
    const inventoryStore = useInventoryStore();
    function getLatestQuantity(itemId) {
      const records = inventoryStore.getInventoriesByItem(itemId);
      if (records.length === 0) return 0;
      const sorted = [...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sorted[0].quantity;
    }
    function getCategoryStats(category) {
      const items = itemStore.getItemsByCategory(category);
      let lowStock = 0;
      let outOfStock = 0;
      for (const item of items) {
        const qty = getLatestQuantity(item._id);
        const status = getStockStatus(qty, item.reorderPoint || 0);
        if (status === "Low Stock") lowStock++;
        if (status === "Out of Stock") outOfStock++;
      }
      return { total: items.length, lowStock, outOfStock };
    }
    const categoryCards = computed(
      () => categories.value.map((cat) => {
        const stats = getCategoryStats(cat.category);
        return { ...cat, stats };
      })
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Inventory",
        subtitle: "Raw materials and supplies organized by category",
        icon: "i-lucide-warehouse"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-shopping-cart",
              variant: "outline",
              to: "/admin/inventory/shopping-list"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Shopping List `);
                } else {
                  return [
                    createTextVNode(" Shopping List ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-clipboard-check",
              variant: "outline",
              to: "/admin/inventory/input"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Count Inventory `);
                } else {
                  return [
                    createTextVNode(" Count Inventory ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-printer",
              variant: "outline",
              to: "/admin/inventory/print"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Print Sheet `);
                } else {
                  return [
                    createTextVNode(" Print Sheet ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-shopping-cart",
                variant: "outline",
                to: "/admin/inventory/shopping-list"
              }, {
                default: withCtx(() => [
                  createTextVNode(" Shopping List ")
                ]),
                _: 1
              }),
              createVNode(_component_UButton, {
                icon: "i-lucide-clipboard-check",
                variant: "outline",
                to: "/admin/inventory/input"
              }, {
                default: withCtx(() => [
                  createTextVNode(" Count Inventory ")
                ]),
                _: 1
              }),
              createVNode(_component_UButton, {
                icon: "i-lucide-printer",
                variant: "outline",
                to: "/admin/inventory/print"
              }, {
                default: withCtx(() => [
                  createTextVNode(" Print Sheet ")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"><!--[-->`);
      ssrRenderList(unref(categoryCards), (card) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: card.key,
          to: `/admin/inventory/${card.key}`,
          class: "group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-5 transition-all duration-200"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-start gap-3 mb-4"${_scopeId}><div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-gold/15 transition-colors"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: card.icon,
                class: "text-xl text-gold"
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors"${_scopeId}>${ssrInterpolate(card.label)}</h3><p class="text-xs text-parchment/60 mt-0.5"${_scopeId}>${ssrInterpolate(card.description)}</p></div></div><div class="grid grid-cols-3 gap-3"${_scopeId}><div class="bg-brown/10 rounded-lg px-3 py-2"${_scopeId}><div class="text-xl font-bold text-parchment"${_scopeId}>${ssrInterpolate(card.stats.total)}</div><div class="text-[10px] text-parchment/60"${_scopeId}>Total Items</div></div><div class="bg-brown/10 rounded-lg px-3 py-2"${_scopeId}><div class="${ssrRenderClass([card.stats.lowStock > 0 ? "text-amber-400" : "text-parchment", "text-xl font-bold"])}"${_scopeId}>${ssrInterpolate(card.stats.lowStock)}</div><div class="text-[10px] text-parchment/60"${_scopeId}>Low Stock</div></div><div class="bg-brown/10 rounded-lg px-3 py-2"${_scopeId}><div class="${ssrRenderClass([card.stats.outOfStock > 0 ? "text-red-400" : "text-parchment", "text-xl font-bold"])}"${_scopeId}>${ssrInterpolate(card.stats.outOfStock)}</div><div class="text-[10px] text-parchment/60"${_scopeId}>Out of Stock</div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-start gap-3 mb-4" }, [
                  createVNode("div", { class: "w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-gold/15 transition-colors" }, [
                    createVNode(_component_UIcon, {
                      name: card.icon,
                      class: "text-xl text-gold"
                    }, null, 8, ["name"])
                  ]),
                  createVNode("div", null, [
                    createVNode("h3", { class: "text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors" }, toDisplayString(card.label), 1),
                    createVNode("p", { class: "text-xs text-parchment/60 mt-0.5" }, toDisplayString(card.description), 1)
                  ])
                ]),
                createVNode("div", { class: "grid grid-cols-3 gap-3" }, [
                  createVNode("div", { class: "bg-brown/10 rounded-lg px-3 py-2" }, [
                    createVNode("div", { class: "text-xl font-bold text-parchment" }, toDisplayString(card.stats.total), 1),
                    createVNode("div", { class: "text-[10px] text-parchment/60" }, "Total Items")
                  ]),
                  createVNode("div", { class: "bg-brown/10 rounded-lg px-3 py-2" }, [
                    createVNode("div", {
                      class: ["text-xl font-bold", card.stats.lowStock > 0 ? "text-amber-400" : "text-parchment"]
                    }, toDisplayString(card.stats.lowStock), 3),
                    createVNode("div", { class: "text-[10px] text-parchment/60" }, "Low Stock")
                  ]),
                  createVNode("div", { class: "bg-brown/10 rounded-lg px-3 py-2" }, [
                    createVNode("div", {
                      class: ["text-xl font-bold", card.stats.outOfStock > 0 ? "text-red-400" : "text-parchment"]
                    }, toDisplayString(card.stats.outOfStock), 3),
                    createVNode("div", { class: "text-[10px] text-parchment/60" }, "Out of Stock")
                  ])
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><h2 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-3">Quick Links</h2><div class="grid grid-cols-1 sm:grid-cols-3 gap-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/items",
        class: "group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-4 flex items-center gap-3 transition-all duration-200"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-package",
              class: "text-lg text-parchment/60 group-hover:text-gold"
            }, null, _parent2, _scopeId));
            _push2(`<div${_scopeId}><div class="text-sm font-medium text-parchment group-hover:text-gold transition-colors"${_scopeId}>All Items</div><div class="text-xs text-parchment/50"${_scopeId}>Master item list</div></div>`);
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-lucide-package",
                class: "text-lg text-parchment/60 group-hover:text-gold"
              }),
              createVNode("div", null, [
                createVNode("div", { class: "text-sm font-medium text-parchment group-hover:text-gold transition-colors" }, "All Items"),
                createVNode("div", { class: "text-xs text-parchment/50" }, "Master item list")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/bottles/inventory",
        class: "group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-4 flex items-center gap-3 transition-all duration-200"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-wine",
              class: "text-lg text-parchment/60 group-hover:text-gold"
            }, null, _parent2, _scopeId));
            _push2(`<div${_scopeId}><div class="text-sm font-medium text-parchment group-hover:text-gold transition-colors"${_scopeId}>Bottle Inventory</div><div class="text-xs text-parchment/50"${_scopeId}>Count finished bottles</div></div>`);
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-lucide-wine",
                class: "text-lg text-parchment/60 group-hover:text-gold"
              }),
              createVNode("div", null, [
                createVNode("div", { class: "text-sm font-medium text-parchment group-hover:text-gold transition-colors" }, "Bottle Inventory"),
                createVNode("div", { class: "text-xs text-parchment/50" }, "Count finished bottles")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/purchaseOrders",
        class: "group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-4 flex items-center gap-3 transition-all duration-200"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-receipt",
              class: "text-lg text-parchment/60 group-hover:text-gold"
            }, null, _parent2, _scopeId));
            _push2(`<div${_scopeId}><div class="text-sm font-medium text-parchment group-hover:text-gold transition-colors"${_scopeId}>Purchase Orders</div><div class="text-xs text-parchment/50"${_scopeId}>Track incoming orders</div></div>`);
          } else {
            return [
              createVNode(_component_UIcon, {
                name: "i-lucide-receipt",
                class: "text-lg text-parchment/60 group-hover:text-gold"
              }),
              createVNode("div", null, [
                createVNode("div", { class: "text-sm font-medium text-parchment group-hover:text-gold transition-colors" }, "Purchase Orders"),
                createVNode("div", { class: "text-xs text-parchment/50" }, "Track incoming orders")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/inventory/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BcIr8qnF.mjs.map

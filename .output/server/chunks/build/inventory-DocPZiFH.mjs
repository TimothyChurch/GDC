import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as _sfc_main$2 } from './Switch-BH6j8VnQ.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, withCtx, createTextVNode, createVNode, ref, computed, mergeProps, unref, toDisplayString, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { Bar } from 'vue-chartjs';
import { u as useChartRegistration } from './useChartRegistration-vDVtbpQr.mjs';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { l as latestPrice } from './helpers-pfHQ8kqT.mjs';
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
import 'chart.js';
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportInventoryTable",
  __ssrInlineRender: true,
  setup(__props) {
    useChartRegistration();
    const itemStore = useItemStore();
    const bottleStore = useBottleStore();
    const inventoryStore = useInventoryStore();
    const productionStore = useProductionStore();
    const showOutOfStock = ref(false);
    const allItemInventory = computed(() => {
      return itemStore.items.filter((item) => item.trackInventory !== false).map((item) => {
        const records = inventoryStore.inventories.filter((inv) => inv.item === item._id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestQty = records.length > 0 ? records[0].quantity : 0;
        const previousQty = records.length > 1 ? records[1].quantity : null;
        const unitPrice = latestPrice(item._id) || 0;
        return {
          _id: item._id,
          name: item.name,
          type: item.type || "Other",
          unit: item.inventoryUnit || "",
          currentStock: latestQty,
          previousStock: previousQty,
          delta: previousQty !== null ? latestQty - previousQty : null,
          lastCounted: records.length > 0 ? new Date(records[0].date) : null,
          unitPrice,
          totalValue: latestQty * unitPrice
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
    });
    const itemInventory = computed(() => {
      if (showOutOfStock.value) return allItemInventory.value;
      return allItemInventory.value.filter((i) => i.currentStock > 0);
    });
    const allBottleInventory = computed(() => {
      return bottleStore.activeBottles.map((bottle) => {
        const records = inventoryStore.inventories.filter((inv) => inv.item === bottle._id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latestQty = records.length > 0 ? records[0].quantity : 0;
        const totalProduced = productionStore.productions.filter((p) => p.bottle === bottle._id).reduce((sum, p) => sum + (p.quantity || 0), 0);
        return {
          _id: bottle._id,
          name: bottle.name,
          class: bottle.class || "",
          currentStock: latestQty,
          totalProduced,
          price: bottle.price || 0,
          retailValue: latestQty * (bottle.price || 0),
          inStock: bottle.inStock,
          lastCounted: records.length > 0 ? new Date(records[0].date) : null
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
    });
    const bottleInventory = computed(() => {
      if (showOutOfStock.value) return allBottleInventory.value;
      return allBottleInventory.value.filter((b) => b.currentStock > 0);
    });
    const totalItemValue = computed(
      () => allItemInventory.value.reduce((sum, i) => sum + i.totalValue, 0)
    );
    const totalBottleRetailValue = computed(
      () => allBottleInventory.value.reduce((sum, b) => sum + b.retailValue, 0)
    );
    const outOfStockItemCount = computed(
      () => allItemInventory.value.filter((i) => i.currentStock <= 0).length
    );
    const totalBottlesOnHand = computed(
      () => allBottleInventory.value.reduce((sum, b) => sum + b.currentStock, 0)
    );
    const inventoryByType = computed(() => {
      const typeMap = /* @__PURE__ */ new Map();
      allItemInventory.value.forEach((item) => {
        const type = item.type || "Other";
        typeMap.set(type, (typeMap.get(type) || 0) + item.totalValue);
      });
      const sorted = Array.from(typeMap.entries()).sort(([, a], [, b]) => b - a);
      return {
        labels: sorted.map(([k]) => k),
        datasets: [{
          label: "Value by Type",
          data: sorted.map(([, v]) => v),
          backgroundColor: "rgba(184, 115, 51, 0.6)",
          borderColor: "rgba(184, 115, 51, 1)",
          borderWidth: 1,
          borderRadius: 4
        }]
      };
    });
    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      scales: {
        x: { ticks: { color: "rgba(245, 245, 220, 0.5)", callback: (v) => "$" + v }, grid: { color: "rgba(139, 69, 19, 0.15)" } },
        y: { ticks: { color: "rgba(245, 245, 220, 0.5)" }, grid: { display: false } }
      },
      plugins: {
        legend: { display: false }
      }
    };
    const activeTab = ref("items");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8;
      const _component_USwitch = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-copper">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalItemValue)))}</div><div class="text-xs text-parchment/60 mt-1">Raw Material Value</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-gold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalBottleRetailValue)))}</div><div class="text-xs text-parchment/60 mt-1">Bottle Retail Value</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(totalBottlesOnHand))}</div><div class="text-xs text-parchment/60 mt-1">Bottles On Hand</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="${ssrRenderClass([unref(outOfStockItemCount) > 0 ? "text-red-400" : "text-green-400", "text-2xl font-bold"])}">${ssrInterpolate(unref(outOfStockItemCount))}</div><div class="text-xs text-parchment/60 mt-1">Out of Stock Items</div></div></div>`);
      if (unref(inventoryByType).labels.length > 0) {
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Inventory Value by Type</h3><div class="h-48">`);
        _push(ssrRenderComponent(unref(Bar), {
          data: unref(inventoryByType),
          options: barOptions
        }, null, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex flex-wrap items-center justify-between gap-3"><div class="flex items-center gap-1.5 bg-brown/15 rounded-lg p-1 border border-brown/20 w-fit">`);
      _push(ssrRenderComponent(_component_UButton, {
        variant: "ghost",
        size: "xs",
        class: ["rounded-md border", unref(activeTab) === "items" ? "bg-gold/15 text-gold border-gold/20" : "text-parchment/50 hover:text-parchment/70 border-transparent"],
        onClick: ($event) => activeTab.value = "items"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Raw Materials (${ssrInterpolate(unref(itemInventory).length)}) `);
          } else {
            return [
              createTextVNode(" Raw Materials (" + toDisplayString(unref(itemInventory).length) + ") ", 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        variant: "ghost",
        size: "xs",
        class: ["rounded-md border", unref(activeTab) === "bottles" ? "bg-gold/15 text-gold border-gold/20" : "text-parchment/50 hover:text-parchment/70 border-transparent"],
        onClick: ($event) => activeTab.value = "bottles"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Finished Goods (${ssrInterpolate(unref(bottleInventory).length)}) `);
          } else {
            return [
              createTextVNode(" Finished Goods (" + toDisplayString(unref(bottleInventory).length) + ") ", 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><label class="flex items-center gap-2 cursor-pointer select-none">`);
      _push(ssrRenderComponent(_component_USwitch, {
        modelValue: unref(showOutOfStock),
        "onUpdate:modelValue": ($event) => isRef(showOutOfStock) ? showOutOfStock.value = $event : null
      }, null, _parent));
      _push(`<span class="text-xs text-parchment/60"> Show out-of-stock items `);
      if (unref(outOfStockItemCount) > 0 && !unref(showOutOfStock)) {
        _push(`<span class="text-red-400/70">(${ssrInterpolate(unref(outOfStockItemCount))} hidden)</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</span></label></div>`);
      if (unref(activeTab) === "items") {
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Raw Material Stock</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20"><th class="text-left py-2 px-3 text-parchment/50 font-medium">Item</th><th class="text-left py-2 px-3 text-parchment/50 font-medium">Type</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Stock</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Delta</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Unit Price</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Value</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Last Count</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(itemInventory), (item) => {
          _push(`<tr class="border-b border-brown/10 hover:bg-brown/10"><td class="py-2 px-3 text-parchment">${ssrInterpolate(item.name)}</td><td class="py-2 px-3 text-parchment/60">${ssrInterpolate(item.type)}</td><td class="py-2 px-3 text-right text-parchment">${ssrInterpolate(item.currentStock)} ${ssrInterpolate(item.unit)}</td><td class="py-2 px-3 text-right">`);
          if (item.delta !== null) {
            _push(`<span class="${ssrRenderClass(item.delta > 0 ? "text-green-400" : item.delta < 0 ? "text-red-400" : "text-parchment/60")}">${ssrInterpolate(item.delta > 0 ? "+" : "")}${ssrInterpolate(item.delta)}</span>`);
          } else {
            _push(`<span class="text-parchment/20">--</span>`);
          }
          _push(`</td><td class="py-2 px-3 text-right text-parchment/70">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.unitPrice))}</td><td class="py-2 px-3 text-right text-copper">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.totalValue))}</td><td class="py-2 px-3 text-right text-parchment/50">${ssrInterpolate(item.lastCounted ? item.lastCounted.toLocaleDateString() : "--")}</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
        if (unref(itemInventory).length === 0) {
          _push(`<div class="text-center py-6 text-parchment/50 text-sm">`);
          if (!unref(showOutOfStock) && unref(allItemInventory).length > 0) {
            _push(`<!--[--> All ${ssrInterpolate(unref(allItemInventory).length)} items are out of stock. Toggle &quot;Show out-of-stock items&quot; to view them. <!--]-->`);
          } else {
            _push(`<!--[--> No inventory items <!--]-->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "bottles") {
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Finished Goods Stock</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20"><th class="text-left py-2 px-3 text-parchment/50 font-medium">Product</th><th class="text-left py-2 px-3 text-parchment/50 font-medium">Class</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">On Hand</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Total Produced</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Price</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Retail Value</th><th class="text-center py-2 px-3 text-parchment/50 font-medium">Status</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Last Count</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(bottleInventory), (bottle) => {
          _push(`<tr class="border-b border-brown/10 hover:bg-brown/10"><td class="py-2 px-3 text-parchment">${ssrInterpolate(bottle.name)}</td><td class="py-2 px-3 text-parchment/60">${ssrInterpolate(bottle.class)}</td><td class="py-2 px-3 text-right text-parchment font-semibold">${ssrInterpolate(bottle.currentStock)}</td><td class="py-2 px-3 text-right text-parchment/70">${ssrInterpolate(bottle.totalProduced)}</td><td class="py-2 px-3 text-right text-parchment/70">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(bottle.price))}</td><td class="py-2 px-3 text-right text-gold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(bottle.retailValue))}</td><td class="py-2 px-3 text-center"><span class="${ssrRenderClass([bottle.currentStock > 0 ? "bg-green-500/15 text-green-400 border border-green-500/25" : "bg-red-500/15 text-red-400 border border-red-500/25", "px-2 py-0.5 rounded-full text-[10px] font-semibold"])}">${ssrInterpolate(bottle.currentStock > 0 ? "In Stock" : "Out")}</span></td><td class="py-2 px-3 text-right text-parchment/50">${ssrInterpolate(bottle.lastCounted ? bottle.lastCounted.toLocaleDateString() : "--")}</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
        if (unref(bottleInventory).length === 0) {
          _push(`<div class="text-center py-6 text-parchment/50 text-sm">`);
          if (!unref(showOutOfStock) && unref(allBottleInventory).length > 0) {
            _push(`<!--[--> All ${ssrInterpolate(unref(allBottleInventory).length)} products are out of stock. Toggle &quot;Show out-of-stock items&quot; to view them. <!--]-->`);
          } else {
            _push(`<!--[--> No bottle products <!--]-->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportInventoryTable.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "ReportInventoryTable" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "inventory",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_ReportInventoryTable = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Inventory Report",
        subtitle: "Stock levels, valuations, and alerts",
        icon: "i-lucide-package"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "outline",
              icon: "i-lucide-printer",
              size: "sm",
              class: "print:hidden",
              onClick: ($event) => _ctx.window.print()
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
            _push2(ssrRenderComponent(_component_NuxtLink, { to: "/admin/reports" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UButton, {
                    variant: "outline",
                    icon: "i-lucide-arrow-left",
                    size: "sm"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Back`);
                      } else {
                        return [
                          createTextVNode("Back")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      variant: "outline",
                      icon: "i-lucide-arrow-left",
                      size: "sm"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Back")
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                variant: "outline",
                icon: "i-lucide-printer",
                size: "sm",
                class: "print:hidden",
                onClick: ($event) => _ctx.window.print()
              }, {
                default: withCtx(() => [
                  createTextVNode("Print")
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_component_NuxtLink, { to: "/admin/reports" }, {
                default: withCtx(() => [
                  createVNode(_component_UButton, {
                    variant: "outline",
                    icon: "i-lucide-arrow-left",
                    size: "sm"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Back")
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_ReportInventoryTable, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/inventory.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=inventory-DocPZiFH.mjs.map

import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, withCtx, createTextVNode, createVNode, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { Bar, Doughnut } from 'vue-chartjs';
import { u as useChartRegistration } from './useChartRegistration-vDVtbpQr.mjs';
import { a as useBatchStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { r as recipePrice, b as bottleCost } from './helpers-pfHQ8kqT.mjs';
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
import './batchPipeline-Dr1IalWc.mjs';
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportCostBreakdown",
  __ssrInlineRender: true,
  setup(__props) {
    useChartRegistration();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const bottleStore = useBottleStore();
    useProductionStore();
    const batchCostData = computed(() => {
      return batchStore.batches.filter((b) => b.batchCost && b.batchCost > 0).map((batch) => {
        const recipe = recipeStore.getRecipeById(batch.recipe);
        const recipeCostVal = recipePrice(batch.recipe);
        return {
          _id: batch._id,
          recipeName: recipe?.name || "Unknown",
          recipeClass: recipe?.class || "",
          status: batch.status || "Unknown",
          batchSize: batch.batchSize,
          batchSizeUnit: batch.batchSizeUnit,
          recipeCost: recipeCostVal,
          batchCost: batch.batchCost || 0,
          brewDate: batch.createdAt ? new Date(batch.createdAt) : null
        };
      }).sort((a, b) => (b.brewDate?.getTime() || 0) - (a.brewDate?.getTime() || 0));
    });
    const recipeCosts = computed(() => {
      const costMap = /* @__PURE__ */ new Map();
      batchStore.batches.forEach((batch) => {
        const recipe = recipeStore.getRecipeById(batch.recipe);
        if (!recipe) return;
        const existing = costMap.get(recipe._id);
        if (!existing) {
          costMap.set(recipe._id, {
            name: recipe.name,
            class: recipe.class || "",
            cost: recipePrice(recipe._id),
            batchCount: 1
          });
        } else {
          existing.batchCount++;
        }
      });
      return Array.from(costMap.values()).sort((a, b) => b.cost - a.cost);
    });
    const recipeCostChart = computed(() => {
      const data = recipeCosts.value.slice(0, 10);
      return {
        labels: data.map((r) => r.name),
        datasets: [{
          label: "Recipe Cost",
          data: data.map((r) => r.cost),
          backgroundColor: "rgba(212, 175, 55, 0.6)",
          borderColor: "rgba(212, 175, 55, 1)",
          borderWidth: 1,
          borderRadius: 4
        }]
      };
    });
    const recipeCostBarOptions = {
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
    const marginData = computed(() => {
      return bottleStore.bottles.filter((b) => b.price && b.price > 0).map((bottle) => {
        const cost = bottleCost(bottle._id) || 0;
        const price = bottle.price || 0;
        const margin = price - cost;
        const marginPct = price > 0 ? margin / price * 100 : 0;
        return {
          _id: bottle._id,
          name: bottle.name,
          class: bottle.class || "",
          price,
          cost,
          margin,
          marginPct
        };
      }).sort((a, b) => b.marginPct - a.marginPct);
    });
    const marginChart = computed(() => {
      const totalCost = marginData.value.reduce((sum, m) => sum + m.cost, 0);
      const totalMargin = marginData.value.reduce((sum, m) => sum + m.margin, 0);
      return {
        labels: ["Cost", "Margin"],
        datasets: [{
          data: [totalCost, Math.max(0, totalMargin)],
          backgroundColor: [
            "rgba(184, 115, 51, 0.7)",
            "rgba(16, 185, 129, 0.7)"
          ],
          borderColor: "rgba(28, 25, 23, 0.8)",
          borderWidth: 2
        }]
      };
    });
    const doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "rgba(245, 245, 220, 0.7)", padding: 12, font: { size: 11 } }
        }
      }
    };
    const totalBatchCost = computed(
      () => batchCostData.value.reduce((sum, b) => sum + b.batchCost, 0)
    );
    const avgBatchCost = computed(
      () => batchCostData.value.length > 0 ? totalBatchCost.value / batchCostData.value.length : 0
    );
    const avgMargin = computed(() => {
      const margins = marginData.value.filter((m) => m.cost > 0);
      if (margins.length === 0) return 0;
      return margins.reduce((sum, m) => sum + m.marginPct, 0) / margins.length;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-copper">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalBatchCost)))}</div><div class="text-xs text-parchment/60 mt-1">Total Batch Costs</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-parchment">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(avgBatchCost)))}</div><div class="text-xs text-parchment/60 mt-1">Avg Batch Cost</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-gold">${ssrInterpolate(unref(recipeCosts).length)}</div><div class="text-xs text-parchment/60 mt-1">Recipes Costed</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="${ssrRenderClass([unref(avgMargin) > 50 ? "text-green-400" : unref(avgMargin) > 30 ? "text-amber-400" : "text-red-400", "text-2xl font-bold"])}">${ssrInterpolate(unref(avgMargin).toFixed(1))}% </div><div class="text-xs text-parchment/60 mt-1">Avg Margin</div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Recipe Cost Comparison</h3>`);
      if (unref(recipeCostChart).labels.length === 0) {
        _push(`<div class="text-center py-8 text-parchment/50 text-sm"> No recipe cost data </div>`);
      } else {
        _push(`<div class="h-64">`);
        _push(ssrRenderComponent(unref(Bar), {
          data: unref(recipeCostChart),
          options: recipeCostBarOptions
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Overall Cost vs Margin</h3>`);
      if (unref(marginData).length === 0) {
        _push(`<div class="text-center py-8 text-parchment/50 text-sm"> No margin data </div>`);
      } else {
        _push(`<div class="h-64">`);
        _push(ssrRenderComponent(unref(Doughnut), {
          data: unref(marginChart),
          options: doughnutOptions
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Product Margin Analysis</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20"><th class="text-left py-2 px-3 text-parchment/50 font-medium">Product</th><th class="text-left py-2 px-3 text-parchment/50 font-medium">Class</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Price</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Cost</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Margin</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Margin %</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(marginData), (m) => {
        _push(`<tr class="border-b border-brown/10 hover:bg-brown/10"><td class="py-2 px-3 text-parchment">${ssrInterpolate(m.name)}</td><td class="py-2 px-3 text-parchment/60">${ssrInterpolate(m.class)}</td><td class="py-2 px-3 text-right text-parchment">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(m.price))}</td><td class="py-2 px-3 text-right text-copper">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(m.cost))}</td><td class="${ssrRenderClass([m.margin > 0 ? "text-green-400" : "text-red-400", "py-2 px-3 text-right"])}">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(m.margin))}</td><td class="py-2 px-3 text-right"><span class="${ssrRenderClass([m.marginPct > 50 ? "bg-green-500/15 text-green-400" : m.marginPct > 30 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400", "px-2 py-0.5 rounded-full text-[10px] font-semibold"])}">${ssrInterpolate(m.marginPct.toFixed(1))}% </span></td></tr>`);
      });
      _push(`<!--]--></tbody></table>`);
      if (unref(marginData).length === 0) {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No products with pricing data </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Batch Cost Breakdown</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20"><th class="text-left py-2 px-3 text-parchment/50 font-medium">Recipe</th><th class="text-left py-2 px-3 text-parchment/50 font-medium">Status</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Batch Size</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Recipe Cost</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Batch Cost</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Brew Date</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(batchCostData), (batch) => {
        _push(`<tr class="border-b border-brown/10 hover:bg-brown/10"><td class="py-2 px-3 text-parchment">${ssrInterpolate(batch.recipeName)}</td><td class="py-2 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brown/20 text-parchment/60">${ssrInterpolate(batch.status)}</span></td><td class="py-2 px-3 text-right text-parchment/70">${ssrInterpolate(batch.batchSize)} ${ssrInterpolate(batch.batchSizeUnit)}</td><td class="py-2 px-3 text-right text-parchment/70">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(batch.recipeCost))}</td><td class="py-2 px-3 text-right text-copper font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(batch.batchCost))}</td><td class="py-2 px-3 text-right text-parchment/50">${ssrInterpolate(batch.brewDate ? batch.brewDate.toLocaleDateString() : "--")}</td></tr>`);
      });
      _push(`<!--]--></tbody></table>`);
      if (unref(batchCostData).length === 0) {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No batch cost data available </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportCostBreakdown.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "ReportCostBreakdown" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "costs",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_ReportCostBreakdown = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Cost Analysis",
        subtitle: "Batch costs, recipe comparisons, and margins",
        icon: "i-lucide-dollar-sign"
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
      _push(ssrRenderComponent(_component_ReportCostBreakdown, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/costs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=costs-DFzyIf-u.mjs.map

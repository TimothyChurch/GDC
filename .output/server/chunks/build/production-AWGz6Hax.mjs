import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1, f as _sfc_main$e } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, withCtx, createTextVNode, createVNode, unref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { Doughnut, Bar, Line } from 'vue-chartjs';
import { u as useChartRegistration } from './useChartRegistration-vDVtbpQr.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
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
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportProductionChart",
  __ssrInlineRender: true,
  props: {
    productions: {},
    period: {}
  },
  setup(__props) {
    useChartRegistration();
    const props = __props;
    const bottleStore = useBottleStore();
    const filteredProductions = computed(() => {
      if (props.period === "all") return props.productions;
      const now = /* @__PURE__ */ new Date();
      const cutoff = /* @__PURE__ */ new Date();
      switch (props.period) {
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          cutoff.setMonth(now.getMonth() - 3);
          break;
        case "year":
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }
      return props.productions.filter((p) => new Date(p.date) >= cutoff);
    });
    const totalBottles = computed(
      () => filteredProductions.value.reduce((sum, p) => sum + (p.quantity || 0), 0)
    );
    const totalCost = computed(
      () => filteredProductions.value.reduce((sum, p) => sum + (p.productionCost || 0), 0)
    );
    const avgCostPerBottle = computed(
      () => totalBottles.value > 0 ? totalCost.value / totalBottles.value : 0
    );
    const totalRuns = computed(() => filteredProductions.value.length);
    const productBreakdown = computed(() => {
      const map = /* @__PURE__ */ new Map();
      filteredProductions.value.forEach((p) => {
        const name = bottleStore.getBottleById(p.bottle)?.name || "Unknown";
        map.set(name, (map.get(name) || 0) + (p.quantity || 0));
      });
      return map;
    });
    const doughnutData = computed(() => {
      const labels = Array.from(productBreakdown.value.keys());
      const data = Array.from(productBreakdown.value.values());
      const colors = [
        "rgba(212, 175, 55, 0.8)",
        // gold
        "rgba(184, 115, 51, 0.8)",
        // copper
        "rgba(245, 158, 11, 0.8)",
        // amber
        "rgba(139, 92, 246, 0.8)",
        // purple
        "rgba(59, 130, 246, 0.8)",
        // blue
        "rgba(16, 185, 129, 0.8)",
        // green
        "rgba(239, 68, 68, 0.8)",
        // red
        "rgba(107, 114, 128, 0.8)"
        // gray
      ];
      return {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
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
    const timelineData = computed(() => {
      const monthMap = /* @__PURE__ */ new Map();
      filteredProductions.value.forEach((p) => {
        const d = new Date(p.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(key, (monthMap.get(key) || 0) + (p.quantity || 0));
      });
      const sorted = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
      return {
        labels: sorted.map(([k]) => {
          const [y, m] = k.split("-");
          return new Date(+y, +m - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        }),
        datasets: [{
          label: "Bottles Produced",
          data: sorted.map(([, v]) => v),
          backgroundColor: "rgba(212, 175, 55, 0.6)",
          borderColor: "rgba(212, 175, 55, 1)",
          borderWidth: 1,
          borderRadius: 4
        }]
      };
    });
    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "rgba(245, 245, 220, 0.5)" }, grid: { color: "rgba(139, 69, 19, 0.15)" } },
        y: { ticks: { color: "rgba(245, 245, 220, 0.5)" }, grid: { color: "rgba(139, 69, 19, 0.15)" }, beginAtZero: true }
      },
      plugins: {
        legend: { labels: { color: "rgba(245, 245, 220, 0.7)" } }
      }
    };
    const costTrendData = computed(() => {
      const monthMap = /* @__PURE__ */ new Map();
      filteredProductions.value.forEach((p) => {
        const d = new Date(p.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const existing = monthMap.get(key) || { cost: 0, qty: 0 };
        existing.cost += p.productionCost || 0;
        existing.qty += p.quantity || 0;
        monthMap.set(key, existing);
      });
      const sorted = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
      return {
        labels: sorted.map(([k]) => {
          const [y, m] = k.split("-");
          return new Date(+y, +m - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        }),
        datasets: [
          {
            label: "Total Cost",
            data: sorted.map(([, v]) => v.cost),
            borderColor: "rgba(184, 115, 51, 1)",
            backgroundColor: "rgba(184, 115, 51, 0.1)",
            fill: true,
            tension: 0.3
          },
          {
            label: "Avg Cost/Bottle",
            data: sorted.map(([, v]) => v.qty > 0 ? v.cost / v.qty : 0),
            borderColor: "rgba(212, 175, 55, 1)",
            backgroundColor: "rgba(212, 175, 55, 0.1)",
            fill: true,
            tension: 0.3
          }
        ]
      };
    });
    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "rgba(245, 245, 220, 0.5)" }, grid: { color: "rgba(139, 69, 19, 0.15)" } },
        y: { ticks: { color: "rgba(245, 245, 220, 0.5)", callback: (v) => "$" + v }, grid: { color: "rgba(139, 69, 19, 0.15)" }, beginAtZero: true }
      },
      plugins: {
        legend: { labels: { color: "rgba(245, 245, 220, 0.7)" } }
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-gold">${ssrInterpolate(unref(totalRuns))}</div><div class="text-xs text-parchment/60 mt-1">Production Runs</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(totalBottles).toLocaleString())}</div><div class="text-xs text-parchment/60 mt-1">Bottles Produced</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-copper">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalCost)))}</div><div class="text-xs text-parchment/60 mt-1">Total Cost</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-parchment">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(avgCostPerBottle)))}</div><div class="text-xs text-parchment/60 mt-1">Avg Cost/Bottle</div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Production by Product</h3>`);
      if (unref(productBreakdown).size === 0) {
        _push(`<div class="text-center py-8 text-parchment/50 text-sm"> No production data </div>`);
      } else {
        _push(`<div class="h-64">`);
        _push(ssrRenderComponent(unref(Doughnut), {
          data: unref(doughnutData),
          options: doughnutOptions
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Production Timeline</h3>`);
      if (unref(timelineData).labels.length === 0) {
        _push(`<div class="text-center py-8 text-parchment/50 text-sm"> No production data </div>`);
      } else {
        _push(`<div class="h-64">`);
        _push(ssrRenderComponent(unref(Bar), {
          data: unref(timelineData),
          options: barOptions
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Cost Trend</h3>`);
      if (unref(costTrendData).labels.length === 0) {
        _push(`<div class="text-center py-8 text-parchment/50 text-sm"> No cost data </div>`);
      } else {
        _push(`<div class="h-72">`);
        _push(ssrRenderComponent(unref(Line), {
          data: unref(costTrendData),
          options: lineOptions
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Production Records</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20"><th class="text-left py-2 px-3 text-parchment/50 font-medium">Date</th><th class="text-left py-2 px-3 text-parchment/50 font-medium">Product</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Quantity</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Total Cost</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Per Bottle</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(filteredProductions).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), (p) => {
        _push(`<tr class="border-b border-brown/10 hover:bg-brown/10"><td class="py-2 px-3 text-parchment/70">${ssrInterpolate(new Date(p.date).toLocaleDateString())}</td><td class="py-2 px-3 text-parchment">${ssrInterpolate(unref(bottleStore).getBottleById(p.bottle)?.name || "Unknown")}</td><td class="py-2 px-3 text-right text-parchment">${ssrInterpolate(p.quantity)}</td><td class="py-2 px-3 text-right text-copper">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(p.productionCost || 0))}</td><td class="py-2 px-3 text-right text-parchment/70">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(p.quantity > 0 ? (p.productionCost || 0) / p.quantity : 0))}</td></tr>`);
      });
      _push(`<!--]--></tbody></table>`);
      if (unref(filteredProductions).length === 0) {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No production records for this period </div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportProductionChart.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$1, { __name: "ReportProductionChart" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "production",
  __ssrInlineRender: true,
  setup(__props) {
    const productionsStore = useProductionStore();
    const period = ref("year");
    const periods = [
      { label: "7 Days", value: "week" },
      { label: "30 Days", value: "month" },
      { label: "90 Days", value: "quarter" },
      { label: "1 Year", value: "year" },
      { label: "All Time", value: "all" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      const _component_ReportProductionChart = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Production Report",
        subtitle: "Bottle output, costs, and trends",
        icon: "i-lucide-factory"
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
      _push(`<div class="flex items-center gap-1.5 mb-6 bg-brown/15 rounded-lg p-1 border border-brown/20 w-fit"><!--[-->`);
      ssrRenderList(periods, (p) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: p.value,
          size: "xs",
          variant: unref(period) === p.value ? "soft" : "ghost",
          color: unref(period) === p.value ? "primary" : "neutral",
          label: p.label,
          onClick: ($event) => period.value = p.value
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
      if (unref(productionsStore).loading) {
        _push(`<div class="text-center py-12">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "text-2xl text-parchment/50 animate-spin mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">Loading production data...</p></div>`);
      } else {
        _push(ssrRenderComponent(_component_ReportProductionChart, {
          productions: unref(productionsStore).productions,
          period: unref(period)
        }, null, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/production.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=production-AWGz6Hax.mjs.map

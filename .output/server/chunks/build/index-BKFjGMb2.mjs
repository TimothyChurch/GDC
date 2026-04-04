import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { c as __nuxt_component_1$1, f as _sfc_main$e } from './server.mjs';
import { defineComponent, computed, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { a as useBatchStore, u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
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
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './conversions-t0mnZFvt.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const productionsStore = useProductionStore();
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
    const bottleStore = useBottleStore();
    useInventoryStore();
    const itemStore = useItemStore();
    const totalProductions = computed(() => productionsStore.productions.length);
    const totalBottlesProduced = computed(
      () => productionsStore.productions.reduce((sum, p) => sum + (p.quantity || 0), 0)
    );
    const activeBatches = computed(
      () => batchStore.batches.filter((b) => b.status === "active").length
    );
    const totalBarrels = computed(() => vesselStore.barrels.length);
    const filledBarrels = computed(
      () => vesselStore.barrels.filter((b) => b.contents && b.contents.length > 0).length
    );
    const distillingBatches = computed(
      () => batchStore.batches.filter((b) => b.stages?.distilling?.startedAt).length
    );
    const barreledBatches = computed(
      () => batchStore.batches.filter((b) => b.stages?.barrelAging?.entry?.date).length
    );
    const now = /* @__PURE__ */ new Date();
    now.setHours(0, 0, 0, 0);
    function getNextMonthly15() {
      const d = new Date(now);
      if (d.getDate() > 15) {
        d.setMonth(d.getMonth() + 1);
      }
      d.setDate(15);
      return d;
    }
    const nextDeadlineDays = computed(() => {
      const d15 = getNextMonthly15();
      const fet29 = new Date(now.getFullYear(), now.getMonth(), 29);
      const fet14 = new Date(now.getFullYear(), now.getMonth(), 14);
      const candidates = [d15, fet29, fet14].filter((d) => d >= now);
      if (candidates.length === 0) return 30;
      const closest = Math.min(...candidates.map((d) => Math.round((d.getTime() - now.getTime()) / 864e5)));
      return closest;
    });
    const calendarUrgency = computed(() => {
      if (nextDeadlineDays.value <= 3) return { color: "text-red-400", bg: "group-hover:bg-red-900/10", border: "hover:border-red-500/30" };
      if (nextDeadlineDays.value <= 7) return { color: "text-orange-400", bg: "group-hover:bg-orange-900/10", border: "hover:border-orange-500/30" };
      return { color: "text-blue-400", bg: "group-hover:bg-blue-900/10", border: "hover:border-blue-500/20" };
    });
    const reportCards = [
      {
        title: "Production",
        subtitle: "Bottle output, costs, and trends over time",
        icon: "i-lucide-factory",
        to: "/admin/reports/production",
        stats: [
          { label: "Total Runs", value: totalProductions },
          { label: "Bottles Produced", value: totalBottlesProduced }
        ],
        color: "text-gold"
      },
      {
        title: "Inventory",
        subtitle: "Stock levels, valuations, and low stock alerts",
        icon: "i-lucide-package",
        to: "/admin/reports/inventory",
        stats: [
          { label: "Items Tracked", value: computed(() => itemStore.items.length) },
          { label: "Bottle Products", value: computed(() => bottleStore.bottles.length) }
        ],
        color: "text-copper"
      },
      {
        title: "Cost Analysis",
        subtitle: "Batch costs, recipe comparisons, and margins",
        icon: "i-lucide-dollar-sign",
        to: "/admin/reports/costs",
        stats: [
          { label: "Active Batches", value: activeBatches },
          { label: "Total Batches", value: computed(() => batchStore.batches.length) }
        ],
        color: "text-amber-400"
      },
      {
        title: "Barrel Aging",
        subtitle: "Barrel inventory, aging progress, and warehouse status",
        icon: "i-lucide-cylinder",
        to: "/admin/reports/barrels",
        stats: [
          { label: "Total Barrels", value: totalBarrels },
          { label: "Filled", value: filledBarrels }
        ],
        color: "text-amber-600"
      }
    ];
    const ttbCards = [
      {
        title: "TTB Production",
        subtitle: "Monthly Report of Production Operations (Form 5110.11)",
        icon: "i-lucide-flask-conical",
        to: "/admin/reports/ttb-production",
        stats: [
          { label: "Distillation Runs", value: distillingBatches },
          { label: "Active Batches", value: activeBatches }
        ],
        color: "text-blue-400"
      },
      {
        title: "TTB Storage",
        subtitle: "Storage Operations — barrel inventory and movements",
        icon: "i-lucide-warehouse",
        to: "/admin/reports/ttb-storage",
        stats: [
          { label: "Filled Barrels", value: filledBarrels },
          { label: "Barreled Batches", value: barreledBatches }
        ],
        color: "text-purple-400"
      },
      {
        title: "TTB Processing",
        subtitle: "Monthly Report of Processing Operations (Form 5110.28)",
        icon: "i-lucide-package-check",
        to: "/admin/reports/ttb-processing",
        stats: [
          { label: "Bottling Runs", value: totalProductions },
          { label: "Bottles Filled", value: totalBottlesProduced }
        ],
        color: "text-emerald-400"
      },
      {
        title: "TTB Excise Tax",
        subtitle: "Federal excise tax on spirits removed for consumption (Form 5000.24)",
        icon: "i-lucide-receipt",
        to: "/admin/reports/ttb-excise-tax",
        stats: [
          { label: "Bottling Runs", value: totalProductions },
          { label: "Bottles Removed", value: totalBottlesProduced }
        ],
        color: "text-gold"
      }
    ];
    const tabcCards = [
      {
        title: "TABC Monthly Report",
        subtitle: "Texas monthly production and disposition report",
        icon: "i-lucide-file-text",
        to: "/admin/reports/tabc-monthly",
        stats: [
          { label: "Distillation Runs", value: distillingBatches },
          { label: "Active Batches", value: activeBatches }
        ],
        color: "text-amber-400"
      },
      {
        title: "TABC Excise Tax",
        subtitle: "Texas distilled spirits excise tax — $2.40/wine gallon produced",
        icon: "i-lucide-landmark",
        to: "/admin/reports/tabc-excise-tax",
        stats: [
          { label: "Distillation Runs", value: distillingBatches },
          { label: "Total Batches", value: computed(() => batchStore.batches.length) }
        ],
        color: "text-amber-500"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Reports & Compliance",
        subtitle: "Production analytics, TTB federal filings, and TABC state reporting",
        icon: "i-lucide-bar-chart-3"
      }, null, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/reports/compliance-calendar",
        class: ["group block mb-6 bg-charcoal rounded-xl border border-brown/30 p-5 transition-all duration-200", [unref(calendarUrgency).border, unref(calendarUrgency).bg]]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-start sm:items-center justify-between gap-4 flex-wrap"${_scopeId}><div class="flex items-center gap-3"${_scopeId}><div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-blue-900/20 transition-colors"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-calendar-days",
              class: ["text-xl", unref(calendarUrgency).color]
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors"${_scopeId}> Compliance Calendar </h3><p class="text-xs text-parchment/60 mt-0.5"${_scopeId}>TTB and TABC filing deadlines — 90-day rolling window</p></div></div><div class="flex items-center gap-3"${_scopeId}><div class="text-right"${_scopeId}><div class="text-xs text-parchment/50 uppercase tracking-wider"${_scopeId}>Next Deadline</div><div class="${ssrRenderClass([unref(calendarUrgency).color, "text-sm font-semibold"])}"${_scopeId}>${ssrInterpolate(unref(nextDeadlineDays))} day${ssrInterpolate(unref(nextDeadlineDays) !== 1 ? "s" : "")}</div></div>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-arrow-right",
              class: "text-parchment/50 group-hover:text-parchment/60 transition-colors"
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-start sm:items-center justify-between gap-4 flex-wrap" }, [
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-blue-900/20 transition-colors" }, [
                    createVNode(_component_UIcon, {
                      name: "i-lucide-calendar-days",
                      class: ["text-xl", unref(calendarUrgency).color]
                    }, null, 8, ["class"])
                  ]),
                  createVNode("div", null, [
                    createVNode("h3", { class: "text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors" }, " Compliance Calendar "),
                    createVNode("p", { class: "text-xs text-parchment/60 mt-0.5" }, "TTB and TABC filing deadlines — 90-day rolling window")
                  ])
                ]),
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "text-right" }, [
                    createVNode("div", { class: "text-xs text-parchment/50 uppercase tracking-wider" }, "Next Deadline"),
                    createVNode("div", {
                      class: ["text-sm font-semibold", unref(calendarUrgency).color]
                    }, toDisplayString(unref(nextDeadlineDays)) + " day" + toDisplayString(unref(nextDeadlineDays) !== 1 ? "s" : ""), 3)
                  ]),
                  createVNode(_component_UIcon, {
                    name: "i-lucide-arrow-right",
                    class: "text-parchment/50 group-hover:text-parchment/60 transition-colors"
                  })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h2 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-3">Operational Reports</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"><!--[-->`);
      ssrRenderList(reportCards, (card) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: card.title,
          to: card.to,
          class: "group bg-charcoal rounded-xl border border-brown/30 hover:border-gold/30 p-5 transition-all duration-200"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-start gap-3 mb-4"${_scopeId}><div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-gold/15 transition-colors"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: card.icon,
                class: ["text-xl", card.color]
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors"${_scopeId}>${ssrInterpolate(card.title)}</h3><p class="text-xs text-parchment/60 mt-0.5"${_scopeId}>${ssrInterpolate(card.subtitle)}</p></div></div><div class="grid grid-cols-2 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(card.stats, (stat) => {
                _push2(`<div class="bg-brown/10 rounded-lg px-3 py-2"${_scopeId}><div class="text-xl font-bold text-parchment"${_scopeId}>${ssrInterpolate(stat.value.value)}</div><div class="text-[10px] text-parchment/60"${_scopeId}>${ssrInterpolate(stat.label)}</div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-start gap-3 mb-4" }, [
                  createVNode("div", { class: "w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-gold/15 transition-colors" }, [
                    createVNode(_component_UIcon, {
                      name: card.icon,
                      class: ["text-xl", card.color]
                    }, null, 8, ["name", "class"])
                  ]),
                  createVNode("div", null, [
                    createVNode("h3", { class: "text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors" }, toDisplayString(card.title), 1),
                    createVNode("p", { class: "text-xs text-parchment/60 mt-0.5" }, toDisplayString(card.subtitle), 1)
                  ])
                ]),
                createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(card.stats, (stat) => {
                    return openBlock(), createBlock("div", {
                      key: stat.label,
                      class: "bg-brown/10 rounded-lg px-3 py-2"
                    }, [
                      createVNode("div", { class: "text-xl font-bold text-parchment" }, toDisplayString(stat.value.value), 1),
                      createVNode("div", { class: "text-[10px] text-parchment/60" }, toDisplayString(stat.label), 1)
                    ]);
                  }), 128))
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><h2 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-1"> TTB Federal Compliance </h2><p class="text-xs text-parchment/50 mb-3"> Alcohol and Tobacco Tax and Trade Bureau — 27 CFR Parts 19 &amp; 26 — reports due 15th of following month </p><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"><!--[-->`);
      ssrRenderList(ttbCards, (card) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: card.title,
          to: card.to,
          class: "group bg-charcoal rounded-xl border border-brown/30 hover:border-blue-500/30 p-5 transition-all duration-200"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-start gap-3 mb-4"${_scopeId}><div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-blue-900/20 transition-colors"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: card.icon,
                class: ["text-xl", card.color]
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><h3 class="text-base font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors"${_scopeId}>${ssrInterpolate(card.title)}</h3><p class="text-xs text-parchment/60 mt-0.5"${_scopeId}>${ssrInterpolate(card.subtitle)}</p></div></div><div class="grid grid-cols-2 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(card.stats, (stat) => {
                _push2(`<div class="bg-brown/10 rounded-lg px-3 py-2"${_scopeId}><div class="text-xl font-bold text-parchment"${_scopeId}>${ssrInterpolate(stat.value.value)}</div><div class="text-[10px] text-parchment/60"${_scopeId}>${ssrInterpolate(stat.label)}</div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-start gap-3 mb-4" }, [
                  createVNode("div", { class: "w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-blue-900/20 transition-colors" }, [
                    createVNode(_component_UIcon, {
                      name: card.icon,
                      class: ["text-xl", card.color]
                    }, null, 8, ["name", "class"])
                  ]),
                  createVNode("div", null, [
                    createVNode("h3", { class: "text-base font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors" }, toDisplayString(card.title), 1),
                    createVNode("p", { class: "text-xs text-parchment/60 mt-0.5" }, toDisplayString(card.subtitle), 1)
                  ])
                ]),
                createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(card.stats, (stat) => {
                    return openBlock(), createBlock("div", {
                      key: stat.label,
                      class: "bg-brown/10 rounded-lg px-3 py-2"
                    }, [
                      createVNode("div", { class: "text-xl font-bold text-parchment" }, toDisplayString(stat.value.value), 1),
                      createVNode("div", { class: "text-[10px] text-parchment/60" }, toDisplayString(stat.label), 1)
                    ]);
                  }), 128))
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><h2 class="text-base font-bold text-parchment font-[Cormorant_Garamond] mb-1"> TABC State Compliance </h2><p class="text-xs text-parchment/50 mb-3"> Texas Alcoholic Beverage Commission — Distiller&#39;s &amp; Rectifier&#39;s Permit — reports due 15th of following month </p><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><!--[-->`);
      ssrRenderList(tabcCards, (card) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: card.title,
          to: card.to,
          class: "group bg-charcoal rounded-xl border border-brown/30 hover:border-amber-500/30 p-5 transition-all duration-200"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-start gap-3 mb-4"${_scopeId}><div class="w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-amber-900/20 transition-colors"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: card.icon,
                class: ["text-xl", card.color]
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><h3 class="text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors"${_scopeId}>${ssrInterpolate(card.title)}</h3><p class="text-xs text-parchment/60 mt-0.5"${_scopeId}>${ssrInterpolate(card.subtitle)}</p></div></div><div class="grid grid-cols-2 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(card.stats, (stat) => {
                _push2(`<div class="bg-brown/10 rounded-lg px-3 py-2"${_scopeId}><div class="text-xl font-bold text-parchment"${_scopeId}>${ssrInterpolate(stat.value.value)}</div><div class="text-[10px] text-parchment/60"${_scopeId}>${ssrInterpolate(stat.label)}</div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-start gap-3 mb-4" }, [
                  createVNode("div", { class: "w-10 h-10 rounded-lg bg-brown/20 flex items-center justify-center shrink-0 group-hover:bg-amber-900/20 transition-colors" }, [
                    createVNode(_component_UIcon, {
                      name: card.icon,
                      class: ["text-xl", card.color]
                    }, null, 8, ["name", "class"])
                  ]),
                  createVNode("div", null, [
                    createVNode("h3", { class: "text-lg font-semibold text-parchment font-[Cormorant_Garamond] group-hover:text-gold transition-colors" }, toDisplayString(card.title), 1),
                    createVNode("p", { class: "text-xs text-parchment/60 mt-0.5" }, toDisplayString(card.subtitle), 1)
                  ])
                ]),
                createVNode("div", { class: "grid grid-cols-2 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(card.stats, (stat) => {
                    return openBlock(), createBlock("div", {
                      key: stat.label,
                      class: "bg-brown/10 rounded-lg px-3 py-2"
                    }, [
                      createVNode("div", { class: "text-xl font-bold text-parchment" }, toDisplayString(stat.value.value), 1),
                      createVNode("div", { class: "text-[10px] text-parchment/60" }, toDisplayString(stat.label), 1)
                    ]);
                  }), 128))
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BKFjGMb2.mjs.map

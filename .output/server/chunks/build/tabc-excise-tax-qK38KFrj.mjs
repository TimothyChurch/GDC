import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, ref, computed, withCtx, createTextVNode, createVNode, unref, mergeProps, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
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
import './useInventoryStore-BPtbZ8hY.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';

const TABC_TAX_RATE = 2.4;
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportTABCExciseTax",
  __ssrInlineRender: true,
  props: {
    month: {}
  },
  setup(__props) {
    const props = __props;
    const productionStore = useProductionStore();
    const bottleStore = useBottleStore();
    const monthStart = computed(() => {
      const [y, m] = props.month.split("-").map(Number);
      return new Date(y, m - 1, 1);
    });
    const monthEnd = computed(() => {
      const [y, m] = props.month.split("-").map(Number);
      return new Date(y, m, 0, 23, 59, 59);
    });
    const monthLabel = computed(
      () => monthStart.value.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    );
    function bottleToWineGallons(bottle) {
      const vol = bottle.volume || 750;
      const unit = (bottle.volumeUnit || "mL").toLowerCase();
      if (unit === "ml" || unit.includes("milli")) return vol * 264172e-9;
      if (unit === "l" || unit.includes("liter")) return vol * 0.264172;
      if (unit.includes("oz")) return vol * 78125e-7;
      if (unit.includes("gal")) return vol;
      return vol * 264172e-9;
    }
    const monthProductions = computed(
      () => productionStore.productions.filter((p) => {
        const prodDate = p.date ? new Date(p.date) : null;
        return prodDate && prodDate >= monthStart.value && prodDate <= monthEnd.value;
      })
    );
    const taxLines = computed(() => {
      return monthProductions.value.map((prod) => {
        const bottle = prod.bottle ? bottleStore.getBottleById(prod.bottle) : null;
        const wgPerBottle = bottle ? bottleToWineGallons(bottle) : 0;
        const totalWG = wgPerBottle * (prod.quantity || 0);
        return {
          productionId: prod._id,
          bottleName: bottle?.name || "Unknown",
          spiritType: bottle?.class || bottle?.type || "Unknown",
          date: prod.date ? new Date(prod.date).toLocaleDateString() : "--",
          quantity: prod.quantity || 0,
          bottleSize: bottle ? `${bottle.volume || 750}${bottle.volumeUnit || "mL"}` : "--",
          wineGallons: totalWG,
          taxDue: totalWG * TABC_TAX_RATE
        };
      }).sort((a, b) => a.date.localeCompare(b.date));
    });
    const totalBottles = computed(() => taxLines.value.reduce((s, l) => s + l.quantity, 0));
    const totalTaxableWG = computed(() => taxLines.value.reduce((s, l) => s + l.wineGallons, 0));
    const totalTaxDue = computed(() => totalTaxableWG.value * TABC_TAX_RATE);
    const taxByType = computed(() => {
      const map = /* @__PURE__ */ new Map();
      taxLines.value.forEach((line) => {
        const existing = map.get(line.spiritType) || { wineGallons: 0, taxDue: 0, productions: 0, bottles: 0 };
        existing.wineGallons += line.wineGallons;
        existing.taxDue += line.taxDue;
        existing.productions += 1;
        existing.bottles += line.quantity;
        map.set(line.spiritType, existing);
      });
      return Array.from(map.entries()).map(([type, data]) => ({ type, ...data })).sort((a, b) => b.taxDue - a.taxDue);
    });
    const dueDate = computed(() => {
      const [y, m] = props.month.split("-").map(Number);
      const nextMonth = m === 12 ? 1 : m + 1;
      const nextYear = m === 12 ? y + 1 : y;
      return new Date(nextYear, nextMonth - 1, 15).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    });
    const isOverdue = computed(() => {
      const [y, m] = props.month.split("-").map(Number);
      const nextMonth = m === 12 ? 1 : m + 1;
      const nextYear = m === 12 ? y + 1 : y;
      return /* @__PURE__ */ new Date() > new Date(nextYear, nextMonth - 1, 15);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300"><div class="flex items-center justify-between mb-2"><div><h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black"> TABC Distilled Spirits Excise Tax Report </h2><p class="text-xs text-parchment/60 mt-0.5 print:text-gray-500"> Texas Tax Code § 201.43 — $2.40 per wine gallon produced </p></div><div class="text-right"><div class="text-xs text-parchment/60 print:text-gray-500">Reporting Period</div><div class="text-sm font-semibold text-parchment print:text-black">${ssrInterpolate(unref(monthLabel))}</div><div class="${ssrRenderClass([unref(isOverdue) ? "text-red-400" : "text-parchment/50 print:text-gray-500", "text-xs mt-1"])}"> Due: ${ssrInterpolate(unref(dueDate))}${ssrInterpolate(unref(isOverdue) ? " — OVERDUE" : "")}</div></div></div></div><div class="${ssrRenderClass([unref(isOverdue) ? "border-red-500/40 bg-red-900/10" : "border-gold/30 bg-gold/5", "rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"])}"><div><div class="text-sm text-parchment/70 print:text-gray-600">Texas Excise Tax Due</div><div class="${ssrRenderClass([unref(isOverdue) ? "text-red-400" : "text-gold", "text-3xl font-bold font-[Cormorant_Garamond] mt-1"])}"> $${ssrInterpolate(unref(totalTaxDue).toFixed(2))}</div><div class="text-xs text-parchment/50 mt-1 print:text-gray-500">${ssrInterpolate(unref(totalTaxableWG).toFixed(4))} wine gallons x $${ssrInterpolate(TABC_TAX_RATE.toFixed(2))}/gallon </div></div><div class="text-right"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Due Date</div><div class="${ssrRenderClass([unref(isOverdue) ? "text-red-400" : "text-parchment print:text-black", "text-sm font-semibold"])}">${ssrInterpolate(unref(dueDate))}</div>`);
      if (unref(isOverdue)) {
        _push(`<div class="text-xs text-red-400 font-bold mt-1">OVERDUE — FILE IMMEDIATELY</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(monthProductions).length)}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Production Runs</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(totalBottles).toLocaleString())}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Bottles Produced</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(totalTaxableWG).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Taxable Wine Gallons</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-gold print:text-black">$${ssrInterpolate(unref(totalTaxDue).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">TX Excise Tax Due</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Tax Liability by Spirit Type</h3>`);
      if (unref(taxByType).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Runs</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Bottles</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Taxable WG</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Rate</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax Due</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(taxByType), (row) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">${ssrInterpolate(row.type)}</td><td class="py-2 px-3 text-right text-parchment/70 print:text-gray-700">${ssrInterpolate(row.productions)}</td><td class="py-2 px-3 text-right text-parchment/70 print:text-gray-700">${ssrInterpolate(row.bottles.toLocaleString())}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(row.wineGallons.toFixed(4))}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">$${ssrInterpolate(TABC_TAX_RATE.toFixed(2))}/gal</td><td class="py-2 px-3 text-right text-gold print:text-black font-bold">$${ssrInterpolate(row.taxDue.toFixed(2))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black">Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(monthProductions).length)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalBottles).toLocaleString())}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalTaxableWG).toFixed(4))}</td><td class="py-2 px-3"></td><td class="py-2 px-3 text-right text-gold print:text-black">$${ssrInterpolate(unref(totalTaxDue).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No production runs in ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Production Detail</h3>`);
      if (unref(taxLines).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Qty</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Bottle Size</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gallons</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax Due</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(taxLines), (line) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: line.productionId,
            to: `/admin/production/${line.productionId}`,
            custom: ""
          }, {
            default: withCtx(({ navigate }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<tr class="border-b border-brown/10 hover:bg-brown/10 cursor-pointer print:border-gray-200"${_scopeId}><td class="py-2 px-3 text-parchment/70 print:text-gray-700"${_scopeId}>${ssrInterpolate(line.date)}</td><td class="py-2 px-3 text-parchment print:text-black"${_scopeId}>${ssrInterpolate(line.bottleName)}</td><td class="py-2 px-3 text-parchment/60 print:text-gray-600"${_scopeId}>${ssrInterpolate(line.spiritType)}</td><td class="py-2 px-3 text-right text-parchment print:text-black"${_scopeId}>${ssrInterpolate(line.quantity.toLocaleString())}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600"${_scopeId}>${ssrInterpolate(line.bottleSize)}</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold"${_scopeId}>${ssrInterpolate(line.wineGallons.toFixed(4))}</td><td class="py-2 px-3 text-right text-gold print:text-black font-bold"${_scopeId}>$${ssrInterpolate(line.taxDue.toFixed(2))}</td></tr>`);
              } else {
                return [
                  createVNode("tr", {
                    class: "border-b border-brown/10 hover:bg-brown/10 cursor-pointer print:border-gray-200",
                    onClick: navigate
                  }, [
                    createVNode("td", { class: "py-2 px-3 text-parchment/70 print:text-gray-700" }, toDisplayString(line.date), 1),
                    createVNode("td", { class: "py-2 px-3 text-parchment print:text-black" }, toDisplayString(line.bottleName), 1),
                    createVNode("td", { class: "py-2 px-3 text-parchment/60 print:text-gray-600" }, toDisplayString(line.spiritType), 1),
                    createVNode("td", { class: "py-2 px-3 text-right text-parchment print:text-black" }, toDisplayString(line.quantity.toLocaleString()), 1),
                    createVNode("td", { class: "py-2 px-3 text-right text-parchment/60 print:text-gray-600" }, toDisplayString(line.bottleSize), 1),
                    createVNode("td", { class: "py-2 px-3 text-right text-copper print:text-black font-semibold" }, toDisplayString(line.wineGallons.toFixed(4)), 1),
                    createVNode("td", { class: "py-2 px-3 text-right text-gold print:text-black font-bold" }, "$" + toDisplayString(line.taxDue.toFixed(2)), 1)
                  ], 8, ["onClick"])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black" colspan="3">Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalBottles).toLocaleString())}</td><td class="py-2 px-3"></td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalTaxableWG).toFixed(4))}</td><td class="py-2 px-3 text-right text-gold print:text-black">$${ssrInterpolate(unref(totalTaxDue).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No production runs recorded for ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`</div><div class="bg-brown/10 rounded-xl border border-brown/20 p-4 print:border-gray-300"><p class="text-xs text-parchment/50 leading-relaxed print:text-gray-600"><strong class="text-parchment/70 print:text-black">Note:</strong> Texas Tax Code § 201.43 imposes a $2.40 per gallon (wine gallon) excise tax on distilled spirits manufactured in Texas. Tax is calculated from production records: bottle volume × quantity produced = taxable wine gallons. This report must reconcile with your TABC Monthly Production Report (same filing period). Remit payment with your monthly report via the TABC Compliance Portal. </p></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportTABCExciseTax.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "ReportTABCExciseTax" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tabc-excise-tax",
  __ssrInlineRender: true,
  setup(__props) {
    const now = /* @__PURE__ */ new Date();
    const selectedMonth = ref(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    );
    const months = computed(() => {
      const result = [];
      const d = /* @__PURE__ */ new Date();
      for (let i = 0; i < 12; i++) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        result.push({
          label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          value: `${y}-${String(m).padStart(2, "0")}`
        });
        d.setMonth(d.getMonth() - 1);
      }
      return result;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_ReportTABCExciseTax = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "TABC Excise Tax Report",
        subtitle: "Texas Distilled Spirits Excise Tax — Texas Tax Code § 201.43 ($2.40/wine gallon produced)",
        icon: "i-lucide-landmark"
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
      _push(`<div class="flex flex-wrap items-center gap-1.5 mb-6 bg-brown/15 rounded-lg p-1 border border-brown/20 w-fit print:hidden"><!--[-->`);
      ssrRenderList(unref(months), (m) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: m.value,
          size: "xs",
          variant: unref(selectedMonth) === m.value ? "soft" : "ghost",
          color: unref(selectedMonth) === m.value ? "primary" : "neutral",
          label: m.label,
          onClick: ($event) => selectedMonth.value = m.value
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
      _push(ssrRenderComponent(_component_ReportTABCExciseTax, { month: unref(selectedMonth) }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/tabc-excise-tax.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tabc-excise-tax-qK38KFrj.mjs.map

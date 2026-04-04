import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$2 } from './Select-xxK8NqZT.mjs';
import { _ as _sfc_main$3 } from './Input-Fd8Vd_4J.mjs';
import { defineComponent, ref, computed, withCtx, createTextVNode, createVNode, unref, isRef, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
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
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useContactStore-DKhOek2F.mjs';

const CBMA_TIER1_LIMIT = 1e5;
const TAX_RATE_TIER1 = 2.7;
const TAX_RATE_TIER2 = 13.34;
const TAX_RATE_STANDARD = 13.5;
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportTTBExciseTax",
  __ssrInlineRender: true,
  props: {
    month: {},
    cbmaRate: {},
    ytdProofGallons: {}
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
    function getRateLabel(rate) {
      if (rate === "tier1") return `CBMA Reduced Rate — $${TAX_RATE_TIER1.toFixed(2)}/PG (first 100,000 PG)`;
      if (rate === "tier2") return `CBMA Reduced Rate — $${TAX_RATE_TIER2.toFixed(2)}/PG (100,001–22,230,000 PG)`;
      return `Standard Rate — $${TAX_RATE_STANDARD.toFixed(2)}/PG`;
    }
    function getApplicableRate(rate) {
      if (rate === "tier1") return TAX_RATE_TIER1;
      if (rate === "tier2") return TAX_RATE_TIER2;
      return TAX_RATE_STANDARD;
    }
    function bottleToWineGallons(bottle) {
      const vol = bottle.volume || 750;
      const unit = (bottle.volumeUnit || "mL").toLowerCase();
      if (unit === "ml" || unit.includes("milli")) return vol * 264172e-9;
      if (unit === "l" || unit.includes("liter")) return vol * 0.264172;
      if (unit.includes("oz")) return vol * 78125e-7;
      if (unit.includes("gal")) return vol;
      return vol * 264172e-9;
    }
    const monthlyRemovals = computed(
      () => productionStore.productions.filter((p) => {
        const d = new Date(p.date);
        return d >= monthStart.value && d <= monthEnd.value;
      })
    );
    const period1Removals = computed(
      () => monthlyRemovals.value.filter((p) => new Date(p.date).getDate() <= 15)
    );
    const period2Removals = computed(
      () => monthlyRemovals.value.filter((p) => new Date(p.date).getDate() > 15)
    );
    function buildRemovalLines(productions) {
      const rate = getApplicableRate(props.cbmaRate);
      return productions.map((p) => {
        const bottle = bottleStore.getBottleById(p.bottle);
        const abv = bottle?.abv || 0;
        const wgPerBottle = bottle ? bottleToWineGallons(bottle) : 0;
        const totalWG2 = wgPerBottle * (p.quantity || 0);
        const totalPG2 = calculateProofGallons(totalWG2, "gallon", abv);
        return {
          _id: p._id,
          date: new Date(p.date).toLocaleDateString(),
          product: bottle?.name || "Unknown Product",
          spiritType: bottle?.class || bottle?.type || "Unknown",
          quantity: p.quantity || 0,
          bottleSize: bottle ? `${bottle.volume || 750}${bottle.volumeUnit || "mL"}` : "--",
          wineGallons: totalWG2,
          abv,
          proofGallons: totalPG2,
          taxDue: totalPG2 * rate
        };
      }).sort((a, b) => a.date.localeCompare(b.date));
    }
    const period1Lines = computed(() => buildRemovalLines(period1Removals.value));
    const period2Lines = computed(() => buildRemovalLines(period2Removals.value));
    const allLines = computed(() => buildRemovalLines(monthlyRemovals.value));
    const removalsByProduct = computed(() => {
      const rate = getApplicableRate(props.cbmaRate);
      const map = /* @__PURE__ */ new Map();
      allLines.value.forEach((line) => {
        const existing = map.get(line.product) || {
          product: line.product,
          spiritType: line.spiritType,
          bottles: 0,
          wineGallons: 0,
          proofGallons: 0,
          taxDue: 0
        };
        existing.bottles += line.quantity;
        existing.wineGallons += line.wineGallons;
        existing.proofGallons += line.proofGallons;
        existing.taxDue += line.proofGallons * rate;
        map.set(line.product, existing);
      });
      return Array.from(map.values()).sort((a, b) => b.proofGallons - a.proofGallons);
    });
    const totalWG = computed(() => allLines.value.reduce((s, l) => s + l.wineGallons, 0));
    const totalPG = computed(() => allLines.value.reduce((s, l) => s + l.proofGallons, 0));
    const totalTax = computed(() => totalPG.value * getApplicableRate(props.cbmaRate));
    const period1PG = computed(() => period1Lines.value.reduce((s, l) => s + l.proofGallons, 0));
    const period1Tax = computed(() => period1PG.value * getApplicableRate(props.cbmaRate));
    const period2PG = computed(() => period2Lines.value.reduce((s, l) => s + l.proofGallons, 0));
    const period2Tax = computed(() => period2PG.value * getApplicableRate(props.cbmaRate));
    const ytdAfterMonth = computed(
      () => (props.ytdProofGallons || 0) + totalPG.value
    );
    const cbmaTier1Remaining = computed(
      () => Math.max(0, CBMA_TIER1_LIMIT - ytdAfterMonth.value)
    );
    const period1DueDate = computed(() => {
      const [y, m] = props.month.split("-").map(Number);
      return new Date(y, m - 1, 29).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    });
    const period2DueDate = computed(() => {
      const [y, m] = props.month.split("-").map(Number);
      const nextMonth = m === 12 ? 1 : m + 1;
      const nextYear = m === 12 ? y + 1 : y;
      return new Date(nextYear, nextMonth - 1, 14).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    });
    const now = /* @__PURE__ */ new Date();
    const period1Overdue = computed(() => {
      const [y, m] = props.month.split("-").map(Number);
      return now > new Date(y, m - 1, 29) && period1PG.value > 0;
    });
    const period2Overdue = computed(() => {
      const [y, m] = props.month.split("-").map(Number);
      const nextMonth = m === 12 ? 1 : m + 1;
      const nextYear = m === 12 ? y + 1 : y;
      return now > new Date(nextYear, nextMonth - 1, 14) && period2PG.value > 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300"><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black"> TTB Excise Tax Return </h2><span class="text-xs text-parchment/60 print:text-gray-500">Form 5000.24</span></div><p class="text-sm text-parchment/60 print:text-gray-600"> Reporting Period: ${ssrInterpolate(unref(monthLabel))}</p><p class="text-xs text-parchment/50 mt-1 print:text-gray-500"> Applied rate: ${ssrInterpolate(getRateLabel(__props.cbmaRate))}</p></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden"><div class="${ssrRenderClass([unref(period1Overdue) ? "border-red-500/50 bg-red-900/20" : "border-brown/30 bg-charcoal", "rounded-lg border p-4"])}"><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: unref(period1Overdue) ? "i-lucide-alert-triangle" : "i-lucide-calendar-check",
        class: unref(period1Overdue) ? "text-red-400 text-lg mt-0.5" : "text-blue-400 text-lg mt-0.5"
      }, null, _parent));
      _push(`<div><div class="text-sm font-semibold text-parchment"> Period 1 Deposit (Days 1–15) </div><div class="text-xs text-parchment/60 mt-0.5"> Due: ${ssrInterpolate(unref(period1DueDate))} `);
      if (unref(period1Overdue)) {
        _push(`<span class="text-red-400 font-semibold ml-1">OVERDUE</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="${ssrRenderClass([unref(period1Overdue) ? "text-red-400" : "text-gold", "text-base font-bold mt-1"])}"> $${ssrInterpolate(unref(period1Tax).toFixed(2))} <span class="text-xs font-normal text-parchment/50 ml-1">(${ssrInterpolate(unref(period1PG).toFixed(2))} PG)</span></div></div></div></div><div class="${ssrRenderClass([unref(period2Overdue) ? "border-red-500/50 bg-red-900/20" : "border-brown/30 bg-charcoal", "rounded-lg border p-4"])}"><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: unref(period2Overdue) ? "i-lucide-alert-triangle" : "i-lucide-calendar-check",
        class: unref(period2Overdue) ? "text-red-400 text-lg mt-0.5" : "text-blue-400 text-lg mt-0.5"
      }, null, _parent));
      _push(`<div><div class="text-sm font-semibold text-parchment"> Period 2 Deposit (Days 16–End) </div><div class="text-xs text-parchment/60 mt-0.5"> Due: ${ssrInterpolate(unref(period2DueDate))} `);
      if (unref(period2Overdue)) {
        _push(`<span class="text-red-400 font-semibold ml-1">OVERDUE</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="${ssrRenderClass([unref(period2Overdue) ? "text-red-400" : "text-gold", "text-base font-bold mt-1"])}"> $${ssrInterpolate(unref(period2Tax).toFixed(2))} <span class="text-xs font-normal text-parchment/50 ml-1">(${ssrInterpolate(unref(period2PG).toFixed(2))} PG)</span></div></div></div></div></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(monthlyRemovals).length)}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Removal Events</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(totalWG).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Wine Gallons Removed</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-copper print:text-black">${ssrInterpolate(unref(totalPG).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Proof Gallons Taxable</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-gold print:text-black">$${ssrInterpolate(unref(totalTax).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Total Tax Due</div></div></div><div class="bg-charcoal rounded-xl border border-blue-500/20 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-blue-400 mb-3 print:text-black">CBMA Tier 1 Monitoring</h3><div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">YTD Before This Month</div><div class="text-parchment print:text-black font-medium">${ssrInterpolate((__props.ytdProofGallons || 0).toFixed(2))} PG</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">This Month</div><div class="text-parchment print:text-black font-medium">${ssrInterpolate(unref(totalPG).toFixed(2))} PG</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tier 1 Remaining (100,000 PG limit)</div><div class="${ssrRenderClass([unref(cbmaTier1Remaining) === 0 ? "text-red-400" : "text-green-400", "font-semibold"])}">${ssrInterpolate(unref(cbmaTier1Remaining) > 0 ? unref(cbmaTier1Remaining).toFixed(2) + " PG" : "TIER 1 EXHAUSTED")}</div></div></div><p class="text-xs text-parchment/60 mt-3 print:text-gray-500"> CBMA Tier 1 rate of $2.70/PG applies to the first 100,000 proof gallons domestically produced and removed per calendar year. Ensure your annual assignment of CBMA credits to TTB is current before claiming reduced rates. </p></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Tax Liability by Product</h3>`);
      if (unref(removalsByProduct).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Bottles</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax Due</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(removalsByProduct), (row) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">${ssrInterpolate(row.product)}</td><td class="py-2 px-3 text-parchment/60 print:text-gray-600">${ssrInterpolate(row.spiritType)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(row.bottles.toLocaleString())}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(row.wineGallons.toFixed(4))}</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold">${ssrInterpolate(row.proofGallons.toFixed(4))}</td><td class="py-2 px-3 text-right text-gold print:text-black font-bold">$${ssrInterpolate(row.taxDue.toFixed(2))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black" colspan="2">Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(removalsByProduct).reduce((s, r) => s + r.bottles, 0).toLocaleString())}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalWG).toFixed(4))}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalPG).toFixed(4))}</td><td class="py-2 px-3 text-right text-gold print:text-black">$${ssrInterpolate(unref(totalTax).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No removals recorded for ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><div class="flex items-center justify-between mb-3"><h3 class="text-sm font-semibold text-parchment/70 print:text-black"> Period 1 Detail — Days 1–15 (Deposit due ${ssrInterpolate(unref(period1DueDate))}) </h3><span class="text-xs font-bold text-gold">$${ssrInterpolate(unref(period1Tax).toFixed(2))}</span></div>`);
      if (unref(period1Lines).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th><th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Qty</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(period1Lines), (line) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment/70 print:text-gray-700">${ssrInterpolate(line.date)}</td><td class="py-2 px-3 text-parchment print:text-black">${ssrInterpolate(line.product)}</td><td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">${ssrInterpolate(line.bottleSize)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(line.quantity)}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">${ssrInterpolate(line.abv.toFixed(1))}%</td><td class="py-2 px-3 text-right text-copper print:text-black">${ssrInterpolate(line.proofGallons.toFixed(4))}</td><td class="py-2 px-3 text-right text-gold print:text-black font-semibold">$${ssrInterpolate(line.taxDue.toFixed(2))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t border-brown/20 font-semibold print:border-gray-300"><td class="py-2 px-3 text-parchment print:text-black" colspan="5">Period 1 Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(period1PG).toFixed(4))}</td><td class="py-2 px-3 text-right text-gold print:text-black">$${ssrInterpolate(unref(period1Tax).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-4 text-parchment/50 text-sm">No removals in Period 1</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><div class="flex items-center justify-between mb-3"><h3 class="text-sm font-semibold text-parchment/70 print:text-black"> Period 2 Detail — Days 16–End (Deposit due ${ssrInterpolate(unref(period2DueDate))}) </h3><span class="text-xs font-bold text-gold">$${ssrInterpolate(unref(period2Tax).toFixed(2))}</span></div>`);
      if (unref(period2Lines).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th><th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Qty</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Tax</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(period2Lines), (line) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment/70 print:text-gray-700">${ssrInterpolate(line.date)}</td><td class="py-2 px-3 text-parchment print:text-black">${ssrInterpolate(line.product)}</td><td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">${ssrInterpolate(line.bottleSize)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(line.quantity)}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">${ssrInterpolate(line.abv.toFixed(1))}%</td><td class="py-2 px-3 text-right text-copper print:text-black">${ssrInterpolate(line.proofGallons.toFixed(4))}</td><td class="py-2 px-3 text-right text-gold print:text-black font-semibold">$${ssrInterpolate(line.taxDue.toFixed(2))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t border-brown/20 font-semibold print:border-gray-300"><td class="py-2 px-3 text-parchment print:text-black" colspan="5">Period 2 Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(period2PG).toFixed(4))}</td><td class="py-2 px-3 text-right text-gold print:text-black">$${ssrInterpolate(unref(period2Tax).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-4 text-parchment/50 text-sm">No removals in Period 2</div>`);
      }
      _push(`</div><div class="bg-brown/10 rounded-xl border border-brown/20 p-4 print:border-gray-300"><p class="text-xs text-parchment/50 leading-relaxed print:text-gray-600"><strong class="text-parchment/70 print:text-black">Important:</strong> Federal excise tax (FET) applies to all distilled spirits removed from your bonded premises for consumption or sale. This report derives removals from bottling/production records. Tasting room pours and any other removals not captured as production records must be added manually before filing. File Form 5000.24 electronically via Pay.gov. Quarterly returns are available for taxpayers whose FET liability does not exceed $50,000/year (27 CFR 19.235). Consult your TTB Specialist or a compliance attorney before filing. </p></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportTTBExciseTax.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$1, { __name: "ReportTTBExciseTax" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ttb-excise-tax",
  __ssrInlineRender: true,
  setup(__props) {
    const now = /* @__PURE__ */ new Date();
    const selectedMonth = ref(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    );
    const cbmaRate = ref("tier1");
    const cbmaRateOptions = [
      { label: "CBMA Tier 1 — $2.70/PG (first 100,000 PG)", value: "tier1" },
      { label: "CBMA Tier 2 — $13.34/PG (100,001–22,230,000 PG)", value: "tier2" },
      { label: "Standard Rate — $13.50/PG", value: "standard" }
    ];
    const ytdProofGallons = ref(0);
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
      const _component_USelect = _sfc_main$2;
      const _component_UInput = _sfc_main$3;
      const _component_ReportTTBExciseTax = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "TTB Excise Tax Return",
        subtitle: "Federal Excise Tax on Distilled Spirits Removed for Consumption (Form 5000.24)",
        icon: "i-lucide-receipt"
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
      _push(`<div class="flex flex-wrap items-end gap-4 mb-6 print:hidden"><div><div class="text-xs text-parchment/50 mb-2 uppercase tracking-wider">Reporting Period</div><div class="flex flex-wrap items-center gap-1.5 bg-brown/15 rounded-lg p-1 border border-brown/20 w-fit"><!--[-->`);
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
      _push(`<!--]--></div></div><div class="min-w-64"><div class="text-xs text-parchment/50 mb-2 uppercase tracking-wider">CBMA Tax Rate</div>`);
      _push(ssrRenderComponent(_component_USelect, {
        modelValue: unref(cbmaRate),
        "onUpdate:modelValue": ($event) => isRef(cbmaRate) ? cbmaRate.value = $event : null,
        items: cbmaRateOptions,
        "value-key": "value",
        placeholder: "Select CBMA rate tier",
        class: "text-sm"
      }, null, _parent));
      _push(`</div><div><div class="text-xs text-parchment/50 mb-2 uppercase tracking-wider"> YTD Proof Gallons Removed (before this month) </div>`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(ytdProofGallons),
        "onUpdate:modelValue": ($event) => isRef(ytdProofGallons) ? ytdProofGallons.value = $event : null,
        modelModifiers: { number: true },
        type: "number",
        min: "0",
        step: "0.01",
        placeholder: "0.00",
        class: "w-40 text-sm"
      }, null, _parent));
      _push(`</div></div>`);
      _push(ssrRenderComponent(_component_ReportTTBExciseTax, {
        month: unref(selectedMonth),
        "cbma-rate": unref(cbmaRate),
        "ytd-proof-gallons": unref(ytdProofGallons)
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/ttb-excise-tax.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ttb-excise-tax-DEfdch8B.mjs.map

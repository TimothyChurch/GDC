import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, ref, computed, withCtx, createTextVNode, createVNode, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { t as toGallons, c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
import { n as normalizeDistillingRuns } from './distillingMigration-D0KFnhrX.mjs';
import { b as bottleToWineGallons } from './useProductionCosts-BgHwywl6.mjs';
import { a as useBatchStore, u as useVesselStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
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
import './conversions-t0mnZFvt.mjs';
import './helpers-pfHQ8kqT.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './batchPipeline-Dr1IalWc.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useContactStore-DKhOek2F.mjs';

const TABC_TAX_RATE = 2.4;
function useTABCCalculations(month) {
  const batchStore = useBatchStore();
  const productionStore = useProductionStore();
  const bottleStore = useBottleStore();
  const recipeStore = useRecipeStore();
  const itemStore = useItemStore();
  const vesselStore = useVesselStore();
  const monthStart = computed(() => {
    const [y, m] = month.value.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });
  const monthEnd = computed(() => {
    const [y, m] = month.value.split("-").map(Number);
    return new Date(y, m, 0, 23, 59, 59);
  });
  const monthLabel = computed(
    () => monthStart.value.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  );
  const dueDate = computed(() => {
    const [y, m] = month.value.split("-").map(Number);
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? y + 1 : y;
    return new Date(nextYear, nextMonth - 1, 15).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  });
  const isOverdue = computed(() => /* @__PURE__ */ new Date() > new Date(monthEnd.value.getFullYear(), monthEnd.value.getMonth() + 1, 15));
  const getDistillingStartDate = (b) => {
    const spiritDate = b.stages?.spiritRun?.startedAt;
    const distDate = b.stages?.distilling?.startedAt;
    const dateStr = spiritDate || distDate;
    return dateStr ? new Date(dateStr) : null;
  };
  const getSpiritRuns = (b) => {
    const newRuns = b.stages?.spiritRun?.runs || [];
    const legacyRuns = normalizeDistillingRuns(b.stages?.distilling);
    return [...newRuns, ...legacyRuns].filter((r) => r.runType === "spirit");
  };
  const distilledBatches = computed(
    () => batchStore.batches.filter((b) => {
      const distDate = getDistillingStartDate(b);
      if (!distDate) return false;
      return distDate >= monthStart.value && distDate <= monthEnd.value;
    })
  );
  const productionByType = computed(() => {
    const map = /* @__PURE__ */ new Map();
    distilledBatches.value.forEach((batch) => {
      const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null;
      const spiritType = recipe?.class || recipe?.type || "Unknown";
      const runs = getSpiritRuns(batch);
      let heartsVol = 0;
      let heartsAbvWeighted = 0;
      for (const run of runs) {
        if (run.collected?.hearts) {
          const h = run.collected.hearts;
          const vol = toGallons(h.volume || 0, h.volumeUnit || "gallon");
          heartsVol += vol;
          heartsAbvWeighted += vol * (h.abv || 0);
        }
      }
      if (heartsVol === 0) return;
      const avgAbv = heartsAbvWeighted / heartsVol;
      const pg = calculateProofGallons(heartsVol, "gallon", avgAbv);
      const existing = map.get(spiritType) || { wineGallons: 0, proofGallons: 0, batches: 0 };
      existing.wineGallons += heartsVol;
      existing.proofGallons += pg;
      existing.batches += 1;
      map.set(spiritType, existing);
    });
    return Array.from(map.entries()).map(([type, data]) => ({ type, ...data })).sort((a, b) => b.wineGallons - a.wineGallons);
  });
  const totalProductionWG = computed(
    () => productionByType.value.reduce((s, t) => s + t.wineGallons, 0)
  );
  const totalProductionPG = computed(
    () => productionByType.value.reduce((s, t) => s + t.proofGallons, 0)
  );
  const headsAndTails = computed(() => {
    let headsWG = 0, tailsWG = 0, headsAbvWt = 0, tailsAbvWt = 0;
    distilledBatches.value.forEach((batch) => {
      const runs = getSpiritRuns(batch);
      for (const run of runs) {
        if (!run.collected) continue;
        const heads = run.collected.heads;
        const lateHeads = run.collected.lateHeads;
        const tails = run.collected.tails;
        if (heads) {
          const vol = toGallons(heads.volume || 0, heads.volumeUnit || "gallon");
          headsWG += vol;
          headsAbvWt += vol * (heads.abv || 0);
        }
        if (lateHeads) {
          const vol = toGallons(lateHeads.volume || 0, lateHeads.volumeUnit || "gallon");
          headsWG += vol;
          headsAbvWt += vol * (lateHeads.abv || 0);
        }
        if (tails) {
          const vol = toGallons(tails.volume || 0, tails.volumeUnit || "gallon");
          tailsWG += vol;
          tailsAbvWt += vol * (tails.abv || 0);
        }
      }
    });
    const headsAvgAbv = headsWG > 0 ? headsAbvWt / headsWG : 0;
    const tailsAvgAbv = tailsWG > 0 ? tailsAbvWt / tailsWG : 0;
    return {
      headsWG,
      headsPG: calculateProofGallons(headsWG, "gallon", headsAvgAbv),
      tailsWG,
      tailsPG: calculateProofGallons(tailsWG, "gallon", tailsAvgAbv)
    };
  });
  const materialsUsed = computed(() => {
    const map = /* @__PURE__ */ new Map();
    distilledBatches.value.forEach((batch) => {
      const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null;
      if (!recipe?.items?.length) return;
      recipe.items.forEach((ing) => {
        const item = itemStore.getItemById(ing._id);
        const name = item?.name || "Unknown Material";
        const unit = ing.unit || "units";
        const key = `${name}||${unit}`;
        const existing = map.get(key) || { amount: 0, unit };
        existing.amount += ing.amount || 0;
        map.set(key, existing);
      });
    });
    return Array.from(map.entries()).map(([key, data]) => ({ name: key.split("||")[0], amount: data.amount, unit: data.unit })).sort((a, b) => a.name.localeCompare(b.name));
  });
  const monthlyProductions = computed(
    () => productionStore.productions.filter((p) => {
      const d = new Date(p.date);
      return d >= monthStart.value && d <= monthEnd.value;
    })
  );
  const dispositionByProduct = computed(() => {
    const map = /* @__PURE__ */ new Map();
    monthlyProductions.value.forEach((p) => {
      const bottle = bottleStore.getBottleById(p.bottle);
      if (!bottle) return;
      const abv = bottle.abv || 0;
      const wgPerBottle = bottleToWineGallons(bottle);
      const totalWG = wgPerBottle * (p.quantity || 0);
      const key = bottle._id;
      const existing = map.get(key) || {
        product: bottle.name,
        spiritType: bottle.class || bottle.type || "Unknown",
        bottles: 0,
        bottleSize: `${bottle.volume || 750}${bottle.volumeUnit || "mL"}`,
        wineGallons: 0,
        proofGallons: 0,
        abv
      };
      existing.bottles += p.quantity || 0;
      existing.wineGallons += totalWG;
      existing.proofGallons += calculateProofGallons(totalWG, "gallon", abv);
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.wineGallons - a.wineGallons);
  });
  const totalDispositionWG = computed(
    () => dispositionByProduct.value.reduce((s, d) => s + d.wineGallons, 0)
  );
  const totalDispositionBottles = computed(
    () => dispositionByProduct.value.reduce((s, d) => s + d.bottles, 0)
  );
  const barreledThisMonth = computed(
    () => batchStore.batches.filter((b) => {
      const d = b.stages?.barrelAging?.entry?.date ? new Date(b.stages.barrelAging.entry.date) : null;
      return d && d >= monthStart.value && d <= monthEnd.value;
    })
  );
  const barreledWG = computed(() => {
    let wg = 0;
    barreledThisMonth.value.forEach((b) => {
      const entry = b.stages?.barrelAging?.entry;
      if (entry) wg += toGallons(entry.volume || 0, entry.volumeUnit || "gal");
    });
    return wg;
  });
  const onHandBarrelWG = computed(() => {
    let wg = 0;
    vesselStore.barrels.filter((b) => b.contents?.length).forEach(
      (barrel) => barrel.contents?.forEach((c) => {
        wg += toGallons(c.volume || 0, c.volumeUnit || "gal");
      })
    );
    return wg;
  });
  const tabcTaxDue = computed(() => totalProductionWG.value * TABC_TAX_RATE);
  return {
    monthStart,
    monthEnd,
    monthLabel,
    dueDate,
    isOverdue,
    distilledBatches,
    productionByType,
    totalProductionWG,
    totalProductionPG,
    headsAndTails,
    materialsUsed,
    monthlyProductions,
    dispositionByProduct,
    totalDispositionWG,
    totalDispositionBottles,
    barreledThisMonth,
    barreledWG,
    onHandBarrelWG,
    tabcTaxDue,
    vesselStore
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportTABCMonthly",
  __ssrInlineRender: true,
  props: {
    month: {}
  },
  setup(__props) {
    const props = __props;
    const monthRef = computed(() => props.month);
    const {
      monthLabel,
      dueDate,
      isOverdue,
      distilledBatches,
      productionByType,
      totalProductionWG,
      totalProductionPG,
      headsAndTails,
      materialsUsed,
      dispositionByProduct,
      totalDispositionWG,
      totalDispositionBottles,
      barreledThisMonth,
      barreledWG,
      onHandBarrelWG,
      tabcTaxDue,
      vesselStore
    } = useTABCCalculations(monthRef);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300"><div class="flex items-center justify-between mb-2"><div><h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black"> TABC Monthly Production and Disposition Report </h2><p class="text-xs text-parchment/60 mt-0.5 print:text-gray-500"> Texas Alcoholic Beverage Commission — Distiller&#39;s and Rectifier&#39;s Permit </p></div><div class="text-right"><div class="text-xs text-parchment/60 print:text-gray-500">Reporting Period</div><div class="text-sm font-semibold text-parchment print:text-black">${ssrInterpolate(unref(monthLabel))}</div><div class="${ssrRenderClass([unref(isOverdue) ? "text-red-400" : "text-parchment/50 print:text-gray-500", "text-xs mt-1"])}"> Due: ${ssrInterpolate(unref(dueDate))}${ssrInterpolate(unref(isOverdue) ? " — OVERDUE" : "")}</div></div></div></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(distilledBatches).length)}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Batches Distilled</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(totalProductionWG).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Wine Gallons Produced</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(totalDispositionBottles).toLocaleString())}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Bottles Disposed</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-gold print:text-black">$${ssrInterpolate(unref(tabcTaxDue).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">TX Excise Tax (est.)</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black"> Section 1 — Spirits Produced </h3>`);
      if (unref(productionByType).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Batches</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gallons</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gallons</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(productionByType), (row) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">${ssrInterpolate(row.type)}</td><td class="py-2 px-3 text-right text-parchment/70 print:text-gray-700">${ssrInterpolate(row.batches)}</td><td class="py-2 px-3 text-right text-parchment print:text-black font-semibold">${ssrInterpolate(row.wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-parchment/70 print:text-gray-700">${ssrInterpolate(row.proofGallons.toFixed(2))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black">Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(productionByType).reduce((s, t) => s + t.batches, 0))}</td><td class="py-2 px-3 text-right text-gold print:text-black">${ssrInterpolate(unref(totalProductionWG).toFixed(2))}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalProductionPG).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No spirits produced in ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`<div class="mt-4 pt-4 border-t border-brown/20 print:border-gray-300"><p class="text-xs text-parchment/50 font-semibold uppercase tracking-wider mb-3 print:text-gray-600"> Non-Beverage Spirits (Heads &amp; Tails) </p><div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Heads (WG)</div><div class="text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).headsWG.toFixed(2))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Heads (PG)</div><div class="text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).headsPG.toFixed(2))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tails (WG)</div><div class="text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).tailsWG.toFixed(2))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tails (PG)</div><div class="text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).tailsPG.toFixed(2))}</div></div></div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black"> Section 2 — Raw Materials Used </h3>`);
      if (unref(materialsUsed).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Material</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Amount</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Unit</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(materialsUsed), (mat) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black">${ssrInterpolate(mat.name)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(mat.amount.toFixed(2))}</td><td class="py-2 px-3 text-parchment/60 print:text-gray-600">${ssrInterpolate(mat.unit)}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm">No materials data available</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black"> Section 3 — Disposition of Spirits (Removed for Sale/Consumption) </h3>`);
      if (unref(dispositionByProduct).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th><th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Bottles</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gallons</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(dispositionByProduct), (row) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">${ssrInterpolate(row.product)}</td><td class="py-2 px-3 text-parchment/60 print:text-gray-600">${ssrInterpolate(row.spiritType)}</td><td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">${ssrInterpolate(row.bottleSize)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(row.bottles.toLocaleString())}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">${ssrInterpolate(row.abv.toFixed(1))}%</td><td class="py-2 px-3 text-right text-parchment print:text-black font-semibold">${ssrInterpolate(row.wineGallons.toFixed(4))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black" colspan="3">Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalDispositionBottles).toLocaleString())}</td><td class="py-2 px-3"></td><td class="py-2 px-3 text-right text-gold print:text-black">${ssrInterpolate(unref(totalDispositionWG).toFixed(4))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No bottling/disposition records for ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`<div class="mt-4 pt-4 border-t border-brown/20 print:border-gray-300"><p class="text-xs text-parchment/50 print:text-gray-600"><strong class="text-parchment/60 print:text-gray-700">Direct-to-Consumer (Texas SB 1232):</strong> Direct sales to consumers are limited to 2 bottles (750mL or smaller) per person per 30-day period, for off-premises consumption only. Ensure DTC sales are tracked separately and do not exceed these limits. </p></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black"> Section 4 — Storage and Barrel Inventory </h3><div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500"> Entered Barrels This Month (WG) </div><div class="text-parchment print:text-black font-semibold text-base">${ssrInterpolate(unref(barreledWG).toFixed(2))}</div><div class="text-xs text-parchment/50 mt-0.5 print:text-gray-500">${ssrInterpolate(unref(barreledThisMonth).length)} barrel${ssrInterpolate(unref(barreledThisMonth).length !== 1 ? "s" : "")} filled </div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500"> Total Barrel Inventory On Hand (WG) </div><div class="text-parchment print:text-black font-semibold text-base">${ssrInterpolate(unref(onHandBarrelWG).toFixed(2))}</div><div class="text-xs text-parchment/50 mt-0.5 print:text-gray-500">${ssrInterpolate(unref(vesselStore).barrels.filter((b) => b.contents?.length).length)} filled barrels </div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500"> Estimated TX Excise Tax on Production </div><div class="text-gold print:text-black font-bold text-base">$${ssrInterpolate(unref(tabcTaxDue).toFixed(2))}</div><div class="text-xs text-parchment/50 mt-0.5 print:text-gray-500">${ssrInterpolate(unref(totalProductionWG).toFixed(2))} WG x $2.40/gal </div></div></div></div><div class="bg-brown/10 rounded-xl border border-brown/20 p-4 space-y-2 print:border-gray-300"><p class="text-xs font-semibold text-parchment/70 uppercase tracking-wider print:text-gray-700"> TABC Filing Checklist </p><ul class="text-xs text-parchment/50 space-y-1.5 list-none print:text-gray-600"><li class="flex items-start gap-2"><span class="text-green-400 shrink-0">[ ]</span> Production volumes verified against batch records </li><li class="flex items-start gap-2"><span class="text-green-400 shrink-0">[ ]</span> Disposition totals reconcile with production records and inventory </li><li class="flex items-start gap-2"><span class="text-green-400 shrink-0">[ ]</span> DTC sales within 2 bottles/person/30-day limit </li><li class="flex items-start gap-2"><span class="text-green-400 shrink-0">[ ]</span> Tasting room samples within 1 oz per product / 3 oz total per visit </li><li class="flex items-start gap-2"><span class="text-green-400 shrink-0">[ ]</span> Texas excise tax remittance prepared ($2.40/wine gallon produced) </li><li class="flex items-start gap-2"><span class="text-green-400 shrink-0">[ ]</span> Report submitted via TABC Compliance Portal by ${ssrInterpolate(unref(dueDate))}</li></ul></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportTABCMonthly.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "ReportTABCMonthly" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tabc-monthly",
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
      const _component_ReportTABCMonthly = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "TABC Monthly Report",
        subtitle: "Texas Monthly Production and Disposition Report — Distiller's & Rectifier's Permit",
        icon: "i-lucide-file-text"
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
      _push(ssrRenderComponent(_component_ReportTABCMonthly, { month: unref(selectedMonth) }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/tabc-monthly.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tabc-monthly-Bq8NzG9P.mjs.map

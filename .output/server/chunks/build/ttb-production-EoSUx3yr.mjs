import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, ref, computed, withCtx, createTextVNode, createVNode, unref, mergeProps, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { t as toGallons, c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
import { n as normalizeDistillingRuns } from './distillingMigration-D0KFnhrX.mjs';
import { a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
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
import './batchPipeline-br9pdPdU.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportTTBProduction",
  __ssrInlineRender: true,
  props: {
    month: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const itemStore = useItemStore();
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
    const distilledBatches = computed(() => {
      return batchStore.batches.filter((b) => {
        const distDate = b.stages?.distilling?.startedAt ? new Date(b.stages.distilling.startedAt) : null;
        if (!distDate) return false;
        return distDate >= monthStart.value && distDate <= monthEnd.value;
      });
    });
    const productionByType = computed(() => {
      const map = /* @__PURE__ */ new Map();
      distilledBatches.value.forEach((batch) => {
        const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null;
        const spiritType = recipe?.class || recipe?.type || "Unknown";
        const runs = normalizeDistillingRuns(batch.stages?.distilling);
        let heartsVol = 0;
        let heartsAbvWeighted = 0;
        for (const run of runs) {
          if (run.runType === "spirit" && run.collected?.hearts) {
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
      return Array.from(map.entries()).map(([type, data]) => ({ type, ...data })).sort((a, b) => b.proofGallons - a.proofGallons);
    });
    const totalWineGallons = computed(
      () => productionByType.value.reduce((sum, t) => sum + t.wineGallons, 0)
    );
    const totalProofGallons = computed(
      () => productionByType.value.reduce((sum, t) => sum + t.proofGallons, 0)
    );
    const totalBatchCount = computed(
      () => productionByType.value.reduce((sum, t) => sum + t.batches, 0)
    );
    const headsAndTails = computed(() => {
      let headsWG = 0, headsPG = 0, lateHeadsWG = 0, lateHeadsPG = 0, tailsWG = 0, tailsPG = 0;
      distilledBatches.value.forEach((batch) => {
        const runs = normalizeDistillingRuns(batch.stages?.distilling);
        for (const run of runs) {
          if (run.runType !== "spirit" || !run.collected) continue;
          const heads = run.collected.heads;
          const lateHeads = run.collected.lateHeads;
          const tails = run.collected.tails;
          if (heads) {
            const vol = toGallons(heads.volume || 0, heads.volumeUnit || "gallon");
            headsWG += vol;
            headsPG += calculateProofGallons(vol, "gallon", heads.abv || 0);
          }
          if (lateHeads) {
            const vol = toGallons(lateHeads.volume || 0, lateHeads.volumeUnit || "gallon");
            lateHeadsWG += vol;
            lateHeadsPG += calculateProofGallons(vol, "gallon", lateHeads.abv || 0);
          }
          if (tails) {
            const vol = toGallons(tails.volume || 0, tails.volumeUnit || "gallon");
            tailsWG += vol;
            tailsPG += calculateProofGallons(vol, "gallon", tails.abv || 0);
          }
        }
      });
      return { headsWG, headsPG, lateHeadsWG, lateHeadsPG, tailsWG, tailsPG };
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
      return Array.from(map.entries()).map(([key, data]) => ({
        name: key.split("||")[0],
        amount: data.amount,
        unit: data.unit
      })).sort((a, b) => a.name.localeCompare(b.name));
    });
    const batchDetails = computed(() => {
      return distilledBatches.value.map((batch) => {
        const recipe = batch.recipe ? recipeStore.getRecipeById(batch.recipe) : null;
        const runs = normalizeDistillingRuns(batch.stages?.distilling);
        let heartsVol = 0;
        let heartsAbvWeighted = 0;
        for (const run of runs) {
          if (run.runType === "spirit" && run.collected?.hearts) {
            const h = run.collected.hearts;
            const vol = toGallons(h.volume || 0, h.volumeUnit || "gallon");
            heartsVol += vol;
            heartsAbvWeighted += vol * (h.abv || 0);
          }
        }
        const abv = heartsVol > 0 ? heartsAbvWeighted / heartsVol : 0;
        return {
          _id: batch._id,
          recipeName: recipe?.name || "Unknown",
          spiritType: recipe?.class || recipe?.type || "Unknown",
          date: batch.stages?.distilling?.startedAt ? new Date(batch.stages.distilling.startedAt).toLocaleDateString() : "--",
          wineGallons: heartsVol,
          abv,
          proofGallons: calculateProofGallons(heartsVol, "gallon", abv),
          runCount: runs.length
        };
      }).sort((a, b) => a.date.localeCompare(b.date));
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300"><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black"> TTB Monthly Report of Production Operations </h2><span class="text-xs text-parchment/60 print:text-gray-500">Form 5110.11</span></div><p class="text-sm text-parchment/60 print:text-gray-600"> Reporting Period: ${ssrInterpolate(unref(monthLabel))}</p></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-gold print:text-black">${ssrInterpolate(unref(totalBatchCount))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Distillation Runs</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(totalWineGallons).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Wine Gallons</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-copper print:text-black">${ssrInterpolate(unref(totalProofGallons).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Proof Gallons</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(productionByType).length)}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Spirit Types</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Production by Spirit Type</h3>`);
      if (unref(productionByType).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Batches</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gallons</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gallons</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(productionByType), (row) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">${ssrInterpolate(row.type)}</td><td class="py-2 px-3 text-right text-parchment/70 print:text-gray-700">${ssrInterpolate(row.batches)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(row.wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold">${ssrInterpolate(row.proofGallons.toFixed(2))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black">Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalBatchCount))}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalWineGallons).toFixed(2))}</td><td class="py-2 px-3 text-right text-gold print:text-black">${ssrInterpolate(unref(totalProofGallons).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No production recorded for ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Non-Product Spirits (Heads, Late Heads &amp; Tails)</h3><div class="grid grid-cols-2 sm:grid-cols-3 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Heads (WG)</div><div class="text-sm text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).headsWG.toFixed(2))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Heads (PG)</div><div class="text-sm text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).headsPG.toFixed(2))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Late Heads (WG)</div><div class="text-sm text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).lateHeadsWG.toFixed(2))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Late Heads (PG)</div><div class="text-sm text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).lateHeadsPG.toFixed(2))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tails (WG)</div><div class="text-sm text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).tailsWG.toFixed(2))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1 print:text-gray-500">Tails (PG)</div><div class="text-sm text-parchment print:text-black">${ssrInterpolate(unref(headsAndTails).tailsPG.toFixed(2))}</div></div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Materials Used</h3>`);
      if (unref(materialsUsed).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Material</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Amount</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Unit</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(materialsUsed), (mat) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black">${ssrInterpolate(mat.name)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(mat.amount.toFixed(2))}</td><td class="py-2 px-3 text-parchment/60 print:text-gray-600">${ssrInterpolate(mat.unit)}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No materials data available </div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Batch Detail</h3>`);
      if (unref(batchDetails).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Recipe</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Runs</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(batchDetails), (b) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: b._id,
            to: `/admin/batch/${b._id}`,
            custom: ""
          }, {
            default: withCtx(({ navigate }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<tr class="border-b border-brown/10 hover:bg-brown/10 cursor-pointer print:border-gray-200"${_scopeId}><td class="py-2 px-3 text-parchment/70 print:text-gray-700"${_scopeId}>${ssrInterpolate(b.date)}</td><td class="py-2 px-3 text-parchment print:text-black"${_scopeId}>${ssrInterpolate(b.recipeName)}</td><td class="py-2 px-3 text-parchment/60 print:text-gray-600"${_scopeId}>${ssrInterpolate(b.spiritType)}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600"${_scopeId}>${ssrInterpolate(b.runCount)}</td><td class="py-2 px-3 text-right text-parchment print:text-black"${_scopeId}>${ssrInterpolate(b.wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600"${_scopeId}>${ssrInterpolate(b.abv.toFixed(1))}%</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold"${_scopeId}>${ssrInterpolate(b.proofGallons.toFixed(2))}</td></tr>`);
              } else {
                return [
                  createVNode("tr", {
                    class: "border-b border-brown/10 hover:bg-brown/10 cursor-pointer print:border-gray-200",
                    onClick: navigate
                  }, [
                    createVNode("td", { class: "py-2 px-3 text-parchment/70 print:text-gray-700" }, toDisplayString(b.date), 1),
                    createVNode("td", { class: "py-2 px-3 text-parchment print:text-black" }, toDisplayString(b.recipeName), 1),
                    createVNode("td", { class: "py-2 px-3 text-parchment/60 print:text-gray-600" }, toDisplayString(b.spiritType), 1),
                    createVNode("td", { class: "py-2 px-3 text-right text-parchment/60 print:text-gray-600" }, toDisplayString(b.runCount), 1),
                    createVNode("td", { class: "py-2 px-3 text-right text-parchment print:text-black" }, toDisplayString(b.wineGallons.toFixed(2)), 1),
                    createVNode("td", { class: "py-2 px-3 text-right text-parchment/60 print:text-gray-600" }, toDisplayString(b.abv.toFixed(1)) + "%", 1),
                    createVNode("td", { class: "py-2 px-3 text-right text-copper print:text-black font-semibold" }, toDisplayString(b.proofGallons.toFixed(2)), 1)
                  ], 8, ["onClick"])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No batches distilled in ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportTTBProduction.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "ReportTTBProduction" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ttb-production",
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
      const _component_ReportTTBProduction = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "TTB Production Report",
        subtitle: "Monthly Report of Production Operations (Form 5110.11)",
        icon: "i-lucide-flask-conical"
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
      _push(ssrRenderComponent(_component_ReportTTBProduction, { month: unref(selectedMonth) }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/ttb-production.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ttb-production-EoSUx3yr.mjs.map

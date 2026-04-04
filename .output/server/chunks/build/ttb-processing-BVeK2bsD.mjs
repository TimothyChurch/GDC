import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, ref, computed, withCtx, createTextVNode, createVNode, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { c as calculateProofGallons, t as toGallons } from './proofGallons--xmqBsFG.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { a as useBatchStore, u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
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
import './batchPipeline-br9pdPdU.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportTTBProcessing",
  __ssrInlineRender: true,
  props: {
    month: {}
  },
  setup(__props) {
    const props = __props;
    const productionStore = useProductionStore();
    const batchStore = useBatchStore();
    const bottleStore = useBottleStore();
    useVesselStore();
    const recipeStore = useRecipeStore();
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
    const monthlyProductions = computed(() => {
      return productionStore.productions.filter((p) => {
        const pDate = new Date(p.date);
        return pDate >= monthStart.value && pDate <= monthEnd.value;
      });
    });
    const bottledByProduct = computed(() => {
      const map = /* @__PURE__ */ new Map();
      monthlyProductions.value.forEach((p) => {
        const bottle = bottleStore.getBottleById(p.bottle);
        if (!bottle) return;
        const key = bottle._id;
        const abv = bottle.abv || 0;
        const wgPerBottle = bottleToWineGallons(bottle);
        const totalWG = wgPerBottle * (p.quantity || 0);
        const totalPG = calculateProofGallons(totalWG, "gallon", abv);
        const sizeLabel = `${bottle.volume || 750}${bottle.volumeUnit || "mL"}`;
        const existing = map.get(key) || {
          productName: bottle.name || "Unknown",
          spiritType: bottle.class || bottle.type || "Unknown",
          bottles: 0,
          bottleSize: sizeLabel,
          wineGallons: 0,
          proofGallons: 0,
          abv
        };
        existing.bottles += p.quantity || 0;
        existing.wineGallons += totalWG;
        existing.proofGallons += totalPG;
        map.set(key, existing);
      });
      return Array.from(map.values()).sort((a, b) => b.proofGallons - a.proofGallons);
    });
    const totalBottles = computed(
      () => bottledByProduct.value.reduce((sum, p) => sum + p.bottles, 0)
    );
    const totalWineGallons = computed(
      () => bottledByProduct.value.reduce((sum, p) => sum + p.wineGallons, 0)
    );
    const totalProofGallons = computed(
      () => bottledByProduct.value.reduce((sum, p) => sum + p.proofGallons, 0)
    );
    const dumpedFromBarrels = computed(() => {
      return batchStore.batches.filter((b) => {
        const exitDate = b.stages?.barrelAging?.exit?.date ? new Date(b.stages.barrelAging.exit.date) : null;
        if (!exitDate) return false;
        return exitDate >= monthStart.value && exitDate <= monthEnd.value;
      }).map((b) => {
        const recipe = b.recipe ? recipeStore.getRecipeById(b.recipe) : null;
        const exit = b.stages?.barrelAging?.exit;
        const vol = exit ? toGallons(exit.volume || 0, exit.volumeUnit || "gal") : 0;
        const abv = exit?.abv || 0;
        return {
          _id: b._id,
          recipe: recipe?.name || "Unknown",
          spiritType: recipe?.class || recipe?.type || "Unknown",
          date: exit?.date ? new Date(exit.date).toLocaleDateString() : "--",
          wineGallons: vol,
          abv,
          proofGallons: calculateProofGallons(vol, "gallon", abv)
        };
      });
    });
    const dumpedWG = computed(() => dumpedFromBarrels.value.reduce((s, d) => s + d.wineGallons, 0));
    const dumpedPG = computed(() => dumpedFromBarrels.value.reduce((s, d) => s + d.proofGallons, 0));
    const productionDetails = computed(() => {
      return monthlyProductions.value.map((p) => {
        const bottle = bottleStore.getBottleById(p.bottle);
        const abv = bottle?.abv || 0;
        const wgPerBottle = bottle ? bottleToWineGallons(bottle) : 0;
        const totalWG = wgPerBottle * (p.quantity || 0);
        return {
          _id: p._id,
          date: new Date(p.date).toLocaleDateString(),
          product: bottle?.name || "Unknown",
          quantity: p.quantity || 0,
          bottleSize: bottle ? `${bottle.volume || 750}${bottle.volumeUnit || "mL"}` : "--",
          wineGallons: totalWG,
          proofGallons: calculateProofGallons(totalWG, "gallon", abv),
          abv
        };
      }).sort((a, b) => a.date.localeCompare(b.date));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300"><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black"> TTB Monthly Report of Processing Operations </h2><span class="text-xs text-parchment/60 print:text-gray-500">Form 5110.28</span></div><p class="text-sm text-parchment/60 print:text-gray-600"> Reporting Period: ${ssrInterpolate(unref(monthLabel))}</p></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(monthlyProductions).length)}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Bottling Runs</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-gold print:text-black">${ssrInterpolate(unref(totalBottles).toLocaleString())}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Bottles Filled</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(totalWineGallons).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Wine Gallons Bottled</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-copper print:text-black">${ssrInterpolate(unref(totalProofGallons).toFixed(2))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Proof Gallons Bottled</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Spirits Bottled by Product</h3>`);
      if (unref(bottledByProduct).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit Type</th><th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Bottles</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(bottledByProduct), (row) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">${ssrInterpolate(row.productName)}</td><td class="py-2 px-3 text-parchment/60 print:text-gray-600">${ssrInterpolate(row.spiritType)}</td><td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">${ssrInterpolate(row.bottleSize)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(row.bottles)}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">${ssrInterpolate(row.abv.toFixed(1))}%</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(row.wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold">${ssrInterpolate(row.proofGallons.toFixed(2))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black" colspan="3">Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalBottles).toLocaleString())}</td><td class="py-2 px-3"></td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(totalWineGallons).toFixed(2))}</td><td class="py-2 px-3 text-right text-gold print:text-black">${ssrInterpolate(unref(totalProofGallons).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No bottling operations recorded for ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Dumped from Barrels</h3>`);
      if (unref(dumpedFromBarrels).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(dumpedFromBarrels), (dump) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment/70 print:text-gray-700">${ssrInterpolate(dump.date)}</td><td class="py-2 px-3 text-parchment print:text-black">${ssrInterpolate(dump.recipe)} (${ssrInterpolate(dump.spiritType)})</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(dump.wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">${ssrInterpolate(dump.abv.toFixed(1))}%</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold">${ssrInterpolate(dump.proofGallons.toFixed(2))}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black" colspan="2">Total</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(dumpedWG).toFixed(2))}</td><td class="py-2 px-3"></td><td class="py-2 px-3 text-right text-gold print:text-black">${ssrInterpolate(unref(dumpedPG).toFixed(2))}</td></tr></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No barrels dumped during ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Bottling Records</h3>`);
      if (unref(productionDetails).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Date</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Product</th><th class="text-center py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Size</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Qty</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(productionDetails), (p) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment/70 print:text-gray-700">${ssrInterpolate(p.date)}</td><td class="py-2 px-3 text-parchment print:text-black">${ssrInterpolate(p.product)}</td><td class="py-2 px-3 text-center text-parchment/60 print:text-gray-600">${ssrInterpolate(p.bottleSize)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(p.quantity)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(p.wineGallons.toFixed(4))}</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold">${ssrInterpolate(p.proofGallons.toFixed(4))}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No bottling records for ${ssrInterpolate(unref(monthLabel))}</div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportTTBProcessing.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "ReportTTBProcessing" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ttb-processing",
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
      const _component_ReportTTBProcessing = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "TTB Processing Report",
        subtitle: "Monthly Report of Processing Operations (Form 5110.28)",
        icon: "i-lucide-package-check"
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
      _push(ssrRenderComponent(_component_ReportTTBProcessing, { month: unref(selectedMonth) }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/ttb-processing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ttb-processing-BVeK2bsD.mjs.map

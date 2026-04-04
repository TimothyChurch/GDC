import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, ref, computed, withCtx, createTextVNode, createVNode, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { t as toGallons, c as calculateProofGallons } from './proofGallons--xmqBsFG.mjs';
import { a as useBatchStore, u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
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
import './batchPipeline-br9pdPdU.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ReportTTBStorage",
  __ssrInlineRender: true,
  props: {
    month: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
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
    const receivedIntoStorage = computed(() => {
      return batchStore.batches.filter((b) => {
        const entryDate = b.stages?.barrelAging?.entry?.date ? new Date(b.stages.barrelAging.entry.date) : null;
        if (!entryDate) return false;
        return entryDate >= monthStart.value && entryDate <= monthEnd.value;
      });
    });
    const removedFromStorage = computed(() => {
      return batchStore.batches.filter((b) => {
        const exitDate = b.stages?.barrelAging?.exit?.date ? new Date(b.stages.barrelAging.exit.date) : null;
        if (!exitDate) return false;
        return exitDate >= monthStart.value && exitDate <= monthEnd.value;
      });
    });
    const receivedTotals = computed(() => {
      let wg = 0, pg = 0;
      receivedIntoStorage.value.forEach((b) => {
        const entry = b.stages?.barrelAging?.entry;
        if (!entry) return;
        const vol = toGallons(entry.volume || 0, entry.volumeUnit || "gal");
        wg += vol;
        pg += calculateProofGallons(vol, "gallon", entry.abv || 0);
      });
      return { wineGallons: wg, proofGallons: pg, count: receivedIntoStorage.value.length };
    });
    const removedTotals = computed(() => {
      let wg = 0, pg = 0;
      removedFromStorage.value.forEach((b) => {
        const exit = b.stages?.barrelAging?.exit;
        if (!exit) return;
        const vol = toGallons(exit.volume || 0, exit.volumeUnit || "gal");
        wg += vol;
        pg += calculateProofGallons(vol, "gallon", exit.abv || 0);
      });
      return { wineGallons: wg, proofGallons: pg, count: removedFromStorage.value.length };
    });
    const onHandCurrent = computed(() => {
      let wg = 0, pg = 0;
      const barrels = vesselStore.barrels.filter((b) => b.contents && b.contents.length > 0);
      barrels.forEach((barrel) => {
        barrel.contents?.forEach((c) => {
          const vol = toGallons(c.volume || 0, c.volumeUnit || "gal");
          wg += vol;
          pg += calculateProofGallons(vol, "gallon", c.abv || 0);
        });
      });
      return { wineGallons: wg, proofGallons: pg, count: barrels.length };
    });
    const storageLosses = computed(() => {
      let lossWG = 0, lossPG = 0;
      batchStore.batches.forEach((b) => {
        const entryDate = b.stages?.barrelAging?.entry?.date ? new Date(b.stages.barrelAging.entry.date) : null;
        if (!entryDate || entryDate > monthEnd.value) return;
        const entry = b.stages?.barrelAging?.entry;
        if (!entry) return;
        const barrel = vesselStore.barrels.find(
          (v) => v.contents?.some((c) => c.batch === b._id)
        );
        if (!barrel) return;
        const content = barrel.contents?.find((c) => c.batch === b._id);
        if (!content) return;
        const entryVol = toGallons(entry.volume || 0, entry.volumeUnit || "gal");
        const currentVol = toGallons(content.volume || 0, content.volumeUnit || "gal");
        const loss = entryVol - currentVol;
        if (loss > 0) {
          lossWG += loss;
          lossPG += calculateProofGallons(loss, "gallon", entry.abv || 0);
        }
      });
      return { wineGallons: lossWG, proofGallons: lossPG };
    });
    const barrelInventory = computed(() => {
      return vesselStore.barrels.filter((barrel) => barrel.contents && barrel.contents.length > 0).map((barrel) => {
        const content = barrel.contents[0];
        const batch = batchStore.getBatchById(content.batch);
        const recipe = batch?.recipe ? recipeStore.getRecipeById(batch.recipe) : null;
        const entryDate = batch?.stages?.barrelAging?.entry?.date ? new Date((batch?.stages).barrelAging.entry.date) : null;
        const vol = toGallons(content.volume || 0, content.volumeUnit || "gal");
        const abv = content.abv || 0;
        const barrelEntry = batch?.stages?.barrelAging?.entry;
        const entryVol = barrelEntry ? toGallons(barrelEntry.volume || 0, barrelEntry.volumeUnit || "gal") : vol;
        const loss = entryVol - vol;
        return {
          barrelName: barrel.name,
          recipe: recipe?.name || "Unknown",
          spiritType: recipe?.class || recipe?.type || "Unknown",
          entryDate: entryDate ? entryDate.toLocaleDateString() : "--",
          wineGallons: vol,
          abv,
          proofGallons: calculateProofGallons(vol, "gallon", abv),
          loss: loss > 0 ? loss : 0
        };
      }).sort((a, b) => a.barrelName.localeCompare(b.barrelName));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:bg-white print:border-gray-300"><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-bold text-gold font-[Cormorant_Garamond] print:text-black"> TTB Storage Operations Report </h2><span class="text-xs text-parchment/60 print:text-gray-500">Form 5110.11 — Storage</span></div><p class="text-sm text-parchment/60 print:text-gray-600"> Reporting Period: ${ssrInterpolate(unref(monthLabel))}</p></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-4 print:text-black">Storage Account Summary</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Line</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Count</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gallons</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gallons</th></tr></thead><tbody><tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">Received into Storage</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(receivedTotals).count)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(receivedTotals).wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold">${ssrInterpolate(unref(receivedTotals).proofGallons.toFixed(2))}</td></tr><tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">Removed from Storage</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(removedTotals).count)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(removedTotals).wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold">${ssrInterpolate(unref(removedTotals).proofGallons.toFixed(2))}</td></tr><tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">Storage Losses (Angel&#39;s Share)</td><td class="py-2 px-3 text-right text-parchment/50 print:text-gray-500">--</td><td class="py-2 px-3 text-right text-red-400/70 print:text-black">${ssrInterpolate(unref(storageLosses).wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-red-400/70 print:text-black">${ssrInterpolate(unref(storageLosses).proofGallons.toFixed(2))}</td></tr><tr class="border-t-2 border-brown/30 font-bold print:border-gray-400"><td class="py-2 px-3 text-parchment print:text-black">On Hand (End of Period)</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(onHandCurrent).count)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(unref(onHandCurrent).wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-gold print:text-black">${ssrInterpolate(unref(onHandCurrent).proofGallons.toFixed(2))}</td></tr></tbody></table></div></div><div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-parchment print:text-black">${ssrInterpolate(unref(onHandCurrent).count)}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Filled Barrels</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-gold print:text-black">${ssrInterpolate(unref(onHandCurrent).proofGallons.toFixed(1))}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Proof Gal On Hand</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-green-400 print:text-black">${ssrInterpolate(unref(receivedTotals).count)}</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Received This Month</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center print:border-gray-300"><div class="text-2xl font-bold text-red-400/70 print:text-black">${ssrInterpolate(unref(storageLosses).wineGallons.toFixed(1))} gal</div><div class="text-xs text-parchment/60 mt-1 print:text-gray-500">Storage Losses</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5 print:border-gray-300"><h3 class="text-sm font-semibold text-parchment/70 mb-3 print:text-black">Barrel Inventory Detail</h3>`);
      if (unref(barrelInventory).length > 0) {
        _push(`<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20 print:border-gray-300"><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Barrel</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Spirit</th><th class="text-left py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Entry Date</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Wine Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">ABV</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Proof Gal</th><th class="text-right py-2 px-3 text-parchment/50 font-medium print:text-gray-600">Loss (WG)</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(barrelInventory), (barrel) => {
          _push(`<tr class="border-b border-brown/10 print:border-gray-200"><td class="py-2 px-3 text-parchment print:text-black font-medium">${ssrInterpolate(barrel.barrelName)}</td><td class="py-2 px-3 text-parchment/60 print:text-gray-600">${ssrInterpolate(barrel.spiritType)}</td><td class="py-2 px-3 text-parchment/70 print:text-gray-700">${ssrInterpolate(barrel.entryDate)}</td><td class="py-2 px-3 text-right text-parchment print:text-black">${ssrInterpolate(barrel.wineGallons.toFixed(2))}</td><td class="py-2 px-3 text-right text-parchment/60 print:text-gray-600">${ssrInterpolate(barrel.abv.toFixed(1))}%</td><td class="py-2 px-3 text-right text-copper print:text-black font-semibold">${ssrInterpolate(barrel.proofGallons.toFixed(2))}</td><td class="py-2 px-3 text-right">`);
          if (barrel.loss > 0) {
            _push(`<span class="text-red-400/70 print:text-black">${ssrInterpolate(barrel.loss.toFixed(2))}</span>`);
          } else {
            _push(`<span class="text-parchment/50 print:text-gray-400">--</span>`);
          }
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No barrels currently in storage </div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportTTBStorage.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "ReportTTBStorage" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ttb-storage",
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
      const _component_ReportTTBStorage = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "TTB Storage Report",
        subtitle: "Storage Operations (Form 5110.11)",
        icon: "i-lucide-warehouse"
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
      _push(ssrRenderComponent(_component_ReportTTBStorage, { month: unref(selectedMonth) }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/ttb-storage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ttb-storage-BI9wxBzN.mjs.map

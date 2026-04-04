import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, withCtx, createTextVNode, createVNode, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { Bar } from 'vue-chartjs';
import { differenceInDays } from 'date-fns';
import { u as useChartRegistration } from './useChartRegistration-vDVtbpQr.mjs';
import { u as useVesselStore, a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
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
import 'chart.js';
import './batchPipeline-br9pdPdU.mjs';
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
  __name: "ReportBarrelAging",
  __ssrInlineRender: true,
  setup(__props) {
    useChartRegistration();
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const barrelData = computed(() => {
      return vesselStore.barrels.map((barrel) => {
        const hasFill = barrel.contents && barrel.contents.length > 0;
        const batch = hasFill ? batchStore.getBatchById(barrel.contents[0].batch) : null;
        const recipe = batch?.recipe ? recipeStore.getRecipeById(batch.recipe) : null;
        const fillDate = batch?.stages?.barrelAging?.entry?.date ? new Date((batch?.stages).barrelAging.entry.date) : null;
        const ageDays = fillDate ? differenceInDays(/* @__PURE__ */ new Date(), fillDate) : 0;
        const entryVolume = batch?.stages?.barrelAging?.entry?.volume || barrel.current?.volume || 0;
        const currentVolume = barrel.current?.volume || 0;
        const angelsShare = entryVolume > 0 && currentVolume > 0 ? entryVolume - currentVolume : 0;
        const angelsSharePct = entryVolume > 0 ? angelsShare / entryVolume * 100 : 0;
        return {
          _id: barrel._id,
          name: barrel.name,
          contents: recipe?.name || (hasFill ? "Unknown" : "Empty"),
          isEmpty: !hasFill,
          fillDate,
          ageDays,
          ageDisplay: formatAge(ageDays),
          char: barrel.barrel?.char || "",
          cost: barrel.barrel?.cost || 0,
          size: barrel.barrel?.size || "",
          entryAbv: batch?.stages?.barrelAging?.entry?.abv || 0,
          currentAbv: barrel.current?.abv || 0,
          entryVolume,
          currentVolume,
          angelsShare,
          angelsSharePct,
          currentValue: barrel.current?.value || 0
        };
      }).sort((a, b) => b.ageDays - a.ageDays);
    });
    function formatAge(days) {
      if (days <= 0) return "--";
      if (days < 30) return `${days}d`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months}mo`;
      const years = Math.floor(months / 12);
      const rem = months % 12;
      return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
    }
    const filledBarrels = computed(() => barrelData.value.filter((b) => !b.isEmpty));
    const emptyBarrels = computed(() => barrelData.value.filter((b) => b.isEmpty));
    const totalBarrelValue = computed(
      () => barrelData.value.reduce((sum, b) => sum + b.currentValue, 0)
    );
    computed(
      () => barrelData.value.reduce((sum, b) => sum + b.cost, 0)
    );
    const avgAge = computed(() => {
      const filled = filledBarrels.value;
      if (filled.length === 0) return 0;
      return Math.round(filled.reduce((sum, b) => sum + b.ageDays, 0) / filled.length);
    });
    const totalAngelsShare = computed(
      () => filledBarrels.value.reduce((sum, b) => sum + b.angelsShare, 0)
    );
    const ageDistribution = computed(() => {
      const buckets = {
        "< 6 mo": 0,
        "6-12 mo": 0,
        "1-2 yr": 0,
        "2-3 yr": 0,
        "3+ yr": 0
      };
      filledBarrels.value.forEach((b) => {
        if (b.ageDays < 180) buckets["< 6 mo"]++;
        else if (b.ageDays < 365) buckets["6-12 mo"]++;
        else if (b.ageDays < 730) buckets["1-2 yr"]++;
        else if (b.ageDays < 1095) buckets["2-3 yr"]++;
        else buckets["3+ yr"]++;
      });
      return {
        labels: Object.keys(buckets),
        datasets: [{
          label: "Barrels",
          data: Object.values(buckets),
          backgroundColor: [
            "rgba(245, 158, 11, 0.4)",
            "rgba(245, 158, 11, 0.55)",
            "rgba(184, 115, 51, 0.6)",
            "rgba(184, 115, 51, 0.75)",
            "rgba(139, 69, 19, 0.8)"
          ],
          borderColor: [
            "rgba(245, 158, 11, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(184, 115, 51, 1)",
            "rgba(184, 115, 51, 1)",
            "rgba(139, 69, 19, 1)"
          ],
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
        y: { ticks: { color: "rgba(245, 245, 220, 0.5)", stepSize: 1 }, grid: { color: "rgba(139, 69, 19, 0.15)" }, beginAtZero: true }
      },
      plugins: {
        legend: { display: false }
      }
    };
    const charBreakdown = computed(() => {
      const map = /* @__PURE__ */ new Map();
      barrelData.value.forEach((b) => {
        const char = b.char || "Unknown";
        map.set(char, (map.get(char) || 0) + 1);
      });
      return Array.from(map.entries()).sort(([, a], [, b]) => b - a);
    });
    const sizeBreakdown = computed(() => {
      const map = /* @__PURE__ */ new Map();
      barrelData.value.forEach((b) => {
        const size = b.size || "Unknown";
        map.set(size, (map.get(size) || 0) + 1);
      });
      return Array.from(map.entries()).sort(([, a], [, b]) => b - a);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(barrelData).length)}</div><div class="text-xs text-parchment/60 mt-1">Total Barrels</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-copper">${ssrInterpolate(unref(filledBarrels).length)}</div><div class="text-xs text-parchment/60 mt-1">Filled</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-parchment/60">${ssrInterpolate(unref(emptyBarrels).length)}</div><div class="text-xs text-parchment/60 mt-1">Empty</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-gold">${ssrInterpolate(formatAge(unref(avgAge)))}</div><div class="text-xs text-parchment/60 mt-1">Avg Age</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-amber-400">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalBarrelValue)))}</div><div class="text-xs text-parchment/60 mt-1">Contents Value</div></div><div class="bg-charcoal rounded-lg border border-brown/30 p-4 text-center"><div class="text-2xl font-bold text-red-400/70">${ssrInterpolate(unref(totalAngelsShare).toFixed(1))} gal</div><div class="text-xs text-parchment/60 mt-1">Angel&#39;s Share</div></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-4"><div class="bg-charcoal rounded-xl border border-brown/30 p-4 lg:col-span-2"><h3 class="text-sm font-semibold text-parchment/70 mb-3">Age Distribution</h3>`);
      if (unref(filledBarrels).length === 0) {
        _push(`<div class="text-center py-8 text-parchment/50 text-sm"> No filled barrels </div>`);
      } else {
        _push(`<div class="h-56">`);
        _push(ssrRenderComponent(unref(Bar), {
          data: unref(ageDistribution),
          options: barOptions
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div><div class="space-y-4"><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">By Char Level</h3><div class="space-y-2"><!--[-->`);
      ssrRenderList(unref(charBreakdown), ([char, count]) => {
        _push(`<div class="flex justify-between items-center text-sm"><span class="text-parchment/60">${ssrInterpolate(char)}</span><span class="text-parchment font-semibold">${ssrInterpolate(count)}</span></div>`);
      });
      _push(`<!--]-->`);
      if (unref(charBreakdown).length === 0) {
        _push(`<div class="text-parchment/50 text-sm text-center py-2">No data</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">By Size</h3><div class="space-y-2"><!--[-->`);
      ssrRenderList(unref(sizeBreakdown), ([size, count]) => {
        _push(`<div class="flex justify-between items-center text-sm"><span class="text-parchment/60">${ssrInterpolate(size)}</span><span class="text-parchment font-semibold">${ssrInterpolate(count)}</span></div>`);
      });
      _push(`<!--]-->`);
      if (unref(sizeBreakdown).length === 0) {
        _push(`<div class="text-parchment/50 text-sm text-center py-2">No data</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4"><h3 class="text-sm font-semibold text-parchment/70 mb-3">All Barrels</h3><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-brown/20"><th class="text-left py-2 px-3 text-parchment/50 font-medium">Barrel</th><th class="text-left py-2 px-3 text-parchment/50 font-medium">Contents</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Age</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Fill Date</th><th class="text-center py-2 px-3 text-parchment/50 font-medium">Char</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Entry ABV</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Current Vol</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Angel&#39;s Share</th><th class="text-right py-2 px-3 text-parchment/50 font-medium">Value</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(barrelData), (barrel) => {
        _push(`<tr class="${ssrRenderClass([barrel.isEmpty ? "opacity-40" : "", "border-b border-brown/10 hover:bg-brown/10"])}"><td class="py-2 px-3 text-parchment font-medium">${ssrInterpolate(barrel.name)}</td><td class="py-2 px-3 text-parchment/70">${ssrInterpolate(barrel.contents)}</td><td class="py-2 px-3 text-right"><span class="${ssrRenderClass(barrel.ageDays >= 730 ? "text-gold font-semibold" : barrel.ageDays >= 365 ? "text-amber-400" : "text-parchment/60")}">${ssrInterpolate(barrel.ageDisplay)}</span></td><td class="py-2 px-3 text-right text-parchment/50">${ssrInterpolate(barrel.fillDate ? barrel.fillDate.toLocaleDateString() : "--")}</td><td class="py-2 px-3 text-center text-parchment/60">${ssrInterpolate(barrel.char || "--")}</td><td class="py-2 px-3 text-right text-parchment/60">${ssrInterpolate(barrel.entryAbv ? barrel.entryAbv + "%" : "--")}</td><td class="py-2 px-3 text-right text-parchment/70">${ssrInterpolate(barrel.currentVolume ? barrel.currentVolume + " gal" : "--")}</td><td class="py-2 px-3 text-right">`);
        if (barrel.angelsShare > 0) {
          _push(`<span class="text-red-400/70">${ssrInterpolate(barrel.angelsShare.toFixed(1))} gal (${ssrInterpolate(barrel.angelsSharePct.toFixed(1))}%) </span>`);
        } else {
          _push(`<span class="text-parchment/20">--</span>`);
        }
        _push(`</td><td class="py-2 px-3 text-right text-copper">${ssrInterpolate(barrel.currentValue > 0 ? ("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(barrel.currentValue) : "--")}</td></tr>`);
      });
      _push(`<!--]--></tbody></table>`);
      if (unref(barrelData).length === 0) {
        _push(`<div class="text-center py-6 text-parchment/50 text-sm"> No barrels found </div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Report/ReportBarrelAging.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "ReportBarrelAging" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "barrels",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_ReportBarrelAging = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Barrel Aging Report",
        subtitle: "Barrel inventory, aging progress, and warehouse analytics",
        icon: "i-lucide-cylinder"
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
      _push(ssrRenderComponent(_component_ReportBarrelAging, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/reports/barrels.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=barrels-D8gYTcSy.mjs.map

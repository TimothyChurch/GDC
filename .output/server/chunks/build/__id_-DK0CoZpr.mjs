import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$1 } from './Badge-BJMjvXJU.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, openBlock, createBlock, createCommentVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
import { g as getBarrelAgeDefault } from './definitions-C7fnFA_u.mjs';
import { differenceInDays } from 'date-fns';
import { u as useVesselStore, a as useBatchStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { c as convertUnitRatio } from './conversions-t0mnZFvt.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { L as LazyPanelVessel } from './PanelVessel-BfYg0Bff.mjs';
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
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './batchPipeline-Dr1IalWc.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const vesselStore = useVesselStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const toast = useToast();
    const vessel = computed(() => vesselStore.getVesselById(route.params._id));
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelVessel);
    const editVessel = () => {
      if (!vessel.value) return;
      vesselStore.setVessel(vessel.value._id);
      panel.open();
    };
    const typeIcon = computed(() => {
      switch (vessel.value?.type) {
        case "Mash Tun":
          return "i-lucide-flame";
        case "Fermenter":
          return "i-lucide-beaker";
        case "Still":
          return "i-lucide-flask-conical";
        case "Tank":
          return "i-lucide-cylinder";
        case "Barrel":
          return "i-lucide-cylinder";
        default:
          return "i-lucide-container";
      }
    });
    const fillPercent = computed(() => {
      const max = vessel.value?.stats?.volume;
      const maxUnit = vessel.value?.stats?.volumeUnit;
      const current = vessel.value?.current?.volume;
      const currentUnit = vessel.value?.current?.volumeUnit;
      if (!max || !current) return 0;
      const converted = current * convertUnitRatio(currentUnit || "", maxUnit || "");
      return Math.min(100, converted / max * 100);
    });
    const fillColor = computed(() => {
      if (fillPercent.value === 0) return "bg-brown/20";
      if (fillPercent.value < 30) return "bg-blue-500/60";
      if (fillPercent.value < 70) return "bg-copper/60";
      return "bg-gold/60";
    });
    const resolvedContents = computed(() => {
      if (!vessel.value?.contents?.length) return [];
      return vessel.value.contents.map((c) => {
        const batch = batchStore.getBatchById(c.batch);
        const recipe = batch?.recipe ? recipeStore.getRecipeById(batch.recipe) : null;
        return {
          batch: c.batch,
          batchName: recipe?.name || "Unknown",
          batchStatus: batch?.status || "Unknown",
          volume: c.volume,
          volumeUnit: c.volumeUnit,
          abv: c.abv,
          value: c.value
        };
      });
    });
    const fillDate = computed(() => {
      if (!vessel.value?.contents?.length) return null;
      const batch = batchStore.getBatchById(vessel.value.contents[0].batch);
      return batch?.stages?.barrelAging?.entry?.date ? new Date((batch?.stages).barrelAging.entry.date) : null;
    });
    const agingDuration = computed(() => {
      if (vessel.value?.type !== "Barrel" || !fillDate.value) return null;
      const days = differenceInDays(/* @__PURE__ */ new Date(), fillDate.value);
      if (days < 30) return `${days} days`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
      const years = Math.floor(months / 12);
      const rem = months % 12;
      return `${years} year${years > 1 ? "s" : ""}${rem ? `, ${rem} mo` : ""}`;
    });
    const effectiveTargetAge = computed(() => {
      if (!vessel.value || vessel.value.type !== "Barrel") return null;
      if (vessel.value.targetAge) return vessel.value.targetAge;
      return getBarrelAgeDefault(vessel.value.barrel?.size) || null;
    });
    const barrelAgeProgress = computed(() => {
      if (!vessel.value || vessel.value.type !== "Barrel" || !fillDate.value) return null;
      const target = effectiveTargetAge.value;
      if (!target) return null;
      const days = differenceInDays(/* @__PURE__ */ new Date(), fillDate.value);
      const months = parseFloat((days / 30.44).toFixed(1));
      const percent = Math.min(100, Math.round(months / target * 100));
      return { months, target, percent };
    });
    const barrelProgressColor = computed(() => {
      if (!barrelAgeProgress.value) return "bg-amber-500/60";
      const p = barrelAgeProgress.value.percent;
      if (p >= 100) return "bg-green-500/60";
      if (p >= 75) return "bg-amber-500/60";
      return "bg-blue-500/60";
    });
    const { confirm } = useDeleteConfirm();
    const handleEmpty = async () => {
      if (!vessel.value) return;
      const confirmed = await confirm("Vessel", vessel.value.name);
      if (confirmed) {
        vesselStore.emptyVessel(vessel.value._id);
      }
    };
    const deleteVessel = async () => {
      if (!vessel.value) return;
      const confirmed = await confirm("Vessel", vessel.value.name);
      if (!confirmed) return;
      await vesselStore.deleteVessel(vessel.value._id);
      toast.add({ title: "Vessel deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/vessels");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UBadge = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      if (!unref(vesselStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(vessel)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(vessel).name,
          subtitle: unref(vessel).type,
          icon: unref(typeIcon)
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(vessel).status === "Disposed") {
                _push2(ssrRenderComponent(_component_UBadge, {
                  color: "error",
                  variant: "subtle",
                  size: "lg"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Disposed `);
                    } else {
                      return [
                        createTextVNode(" Disposed ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/vessels")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Back `);
                  } else {
                    return [
                      createTextVNode(" Back ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-pencil",
                size: "sm",
                onClick: editVessel
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Edit `);
                  } else {
                    return [
                      createTextVNode(" Edit ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-trash-2",
                color: "error",
                variant: "soft",
                size: "sm",
                onClick: deleteVessel
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Delete `);
                  } else {
                    return [
                      createTextVNode(" Delete ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                unref(vessel).status === "Disposed" ? (openBlock(), createBlock(_component_UBadge, {
                  key: 0,
                  color: "error",
                  variant: "subtle",
                  size: "lg"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Disposed ")
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                createVNode(_component_UButton, {
                  icon: "i-lucide-arrow-left",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: ($event) => unref(router).push("/admin/vessels")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editVessel
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Edit ")
                  ]),
                  _: 1
                }),
                createVNode(_component_UButton, {
                  icon: "i-lucide-trash-2",
                  color: "error",
                  variant: "soft",
                  size: "sm",
                  onClick: deleteVessel
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Delete ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Vessel Info</h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Type</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vessel).type)}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Capacity</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vessel).stats?.volume || "N/A")}${ssrInterpolate(unref(vessel).stats?.volumeUnit ? ` ${unref(vessel).stats.volumeUnit}` : "")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Weight</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vessel).stats?.weight || "N/A")}${ssrInterpolate(unref(vessel).stats?.weightUnit ? ` ${unref(vessel).stats.weightUnit}` : "")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Location</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vessel).location || "N/A")}</div></div></div></div>`);
        if (unref(vessel).type === "Barrel") {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Barrel Details</h3>`);
          _push(ssrRenderComponent(_component_UBadge, {
            color: unref(vessel).isUsed ? "warning" : "success",
            variant: "subtle",
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(vessel).isUsed ? "Used" : "New")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(vessel).isUsed ? "Used" : "New"), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div class="grid grid-cols-2 sm:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Size</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vessel).barrel?.size || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Char Level</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vessel).barrel?.char || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Cost</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vessel).barrel?.cost ? ("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(vessel).barrel.cost) : "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Aging Duration</div><div class="text-sm text-parchment">${ssrInterpolate(unref(agingDuration) || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Target Age</div><div class="text-sm text-parchment">`);
          if (unref(effectiveTargetAge)) {
            _push(`<!--[-->${ssrInterpolate(unref(effectiveTargetAge))} months `);
            if (!unref(vessel).targetAge) {
              _push(`<span class="text-parchment/60 text-xs">(default)</span>`);
            } else {
              _push(`<span class="text-parchment/60 text-xs">(custom)</span>`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<!--[-->Not set<!--]-->`);
          }
          _push(`</div></div>`);
          if (unref(vessel).isUsed && unref(vessel).previousContents) {
            _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Previous Contents</div><div class="text-sm text-parchment">${ssrInterpolate(unref(vessel).previousContents)}</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (unref(barrelAgeProgress) && unref(vessel).current?.volume && unref(vessel).current.volume > 0) {
            _push(`<div class="mt-4"><div class="flex items-center justify-between mb-2"><div class="text-xs text-parchment/60 uppercase tracking-wider">Aging Progress</div><span class="${ssrRenderClass([unref(barrelAgeProgress).percent >= 100 ? "text-green-400" : "text-amber-400", "text-sm font-semibold"])}">${ssrInterpolate(unref(barrelAgeProgress).months)} / ${ssrInterpolate(unref(barrelAgeProgress).target)} months — ${ssrInterpolate(unref(barrelAgeProgress).percent)}% </span></div><div class="w-full h-3 rounded-full bg-brown/20 overflow-hidden"><div class="${ssrRenderClass([unref(barrelProgressColor), "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle({ width: `${unref(barrelAgeProgress).percent}%` })}"></div></div>`);
            if (unref(barrelAgeProgress).percent >= 100) {
              _push(`<div class="mt-1 text-xs text-green-400 font-medium"> Target age reached — ready to dump </div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Current Status</h3>`);
        if (unref(vessel).current?.volume && unref(vessel).current.volume > 0) {
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-droplets",
            variant: "outline",
            color: "neutral",
            size: "xs",
            onClick: handleEmpty
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Empty `);
              } else {
                return [
                  createTextVNode(" Empty ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Volume</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(unref(vessel).current?.volume || 0)}${ssrInterpolate(unref(vessel).current?.volumeUnit ? ` ${unref(vessel).current.volumeUnit}` : "")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">ABV</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(unref(vessel).current?.abv ? `${unref(vessel).current.abv.toFixed(1)}%` : "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Value</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(unref(vessel).current?.value ? ("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(vessel).current.value) : "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Fill</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(unref(fillPercent).toFixed(0))}%</div></div></div><div class="w-full h-3 rounded-full bg-brown/20 overflow-hidden"><div class="${ssrRenderClass([unref(fillColor), "h-full rounded-full transition-all duration-300"])}" style="${ssrRenderStyle({ width: `${unref(fillPercent)}%` })}"></div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Contents</h3>`);
        if (unref(resolvedContents).length > 0) {
          _push(`<div class="divide-y divide-brown/20"><div class="hidden sm:grid grid-cols-5 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider"><span>Batch / Recipe</span><span>Status</span><span>Volume</span><span>ABV</span><span class="text-right">Value</span></div><!--[-->`);
          ssrRenderList(unref(resolvedContents), (content, i) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: i,
              to: `/admin/batch/${content.batch}`,
              class: "grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 py-3 hover:bg-brown/10 -mx-2 px-2 rounded transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div${_scopeId}><span class="text-sm text-parchment"${_scopeId}>${ssrInterpolate(content.batchName)}</span></div><div class="sm:block"${_scopeId}><span class="text-sm text-parchment/60"${_scopeId}>${ssrInterpolate(content.batchStatus)}</span></div><div${_scopeId}><span class="text-sm text-parchment/60"${_scopeId}>${ssrInterpolate(content.volume)} ${ssrInterpolate(content.volumeUnit)}</span></div><div${_scopeId}><span class="text-sm text-parchment/60"${_scopeId}>${ssrInterpolate(content.abv)}%</span></div><div class="text-right"${_scopeId}><span class="text-sm text-parchment"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(content.value))}</span></div>`);
                } else {
                  return [
                    createVNode("div", null, [
                      createVNode("span", { class: "text-sm text-parchment" }, toDisplayString(content.batchName), 1)
                    ]),
                    createVNode("div", { class: "sm:block" }, [
                      createVNode("span", { class: "text-sm text-parchment/60" }, toDisplayString(content.batchStatus), 1)
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-sm text-parchment/60" }, toDisplayString(content.volume) + " " + toDisplayString(content.volumeUnit), 1)
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-sm text-parchment/60" }, toDisplayString(content.abv) + "%", 1)
                    ]),
                    createVNode("div", { class: "text-right" }, [
                      createVNode("span", { class: "text-sm text-parchment" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(content.value)), 1)
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-droplets",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">Vessel is empty</p></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Vessel not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/vessels")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Vessels `);
            } else {
              return [
                createTextVNode(" Back to Vessels ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/vessels/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-DK0CoZpr.mjs.map

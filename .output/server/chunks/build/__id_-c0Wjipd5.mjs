import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { L as LazyPanelProduction } from './PanelProduction-CicAwPD9.mjs';
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
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const productionStore = useProductionStore();
    const bottleStore = useBottleStore();
    const vesselStore = useVesselStore();
    const itemStore = useItemStore();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const production = computed(
      () => productionStore.productions.find((p) => p._id === route.params._id)
    );
    const bottleName = computed(() => {
      if (!production.value?.bottle) return "Unknown";
      return bottleStore.getName(production.value.bottle) || "Unknown";
    });
    const formattedDate = computed(() => {
      if (!production.value?.date) return "";
      return new Date(production.value.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    });
    const resolvedVessels = computed(() => {
      if (!production.value?.vessel) return [];
      return production.value.vessel.map((id) => vesselStore.getVesselById(id)).filter(Boolean);
    });
    const hasCostBreakdown = computed(() => {
      if (!production.value?.costs) return false;
      const c = production.value.costs;
      return (c.batch || 0) + (c.barrel || 0) + (c.bottling || 0) + (c.labor || 0) + (c.ttbTax || 0) + (c.tabcTax || 0) + (c.other || 0) > 0;
    });
    const costBreakdownLines = computed(() => {
      if (!production.value?.costs) return [];
      const c = production.value.costs;
      return [
        { label: "Batch / Spirit", value: c.batch || 0, icon: "i-lucide-flask-conical" },
        { label: "Barrel", value: c.barrel || 0, icon: "i-lucide-cylinder" },
        { label: "Bottling Materials", value: c.bottling || 0, icon: "i-lucide-package" },
        { label: "Labor", value: c.labor || 0, icon: "i-lucide-hard-hat" },
        { label: "TTB Federal Excise Tax", value: c.ttbTax || 0, icon: "i-lucide-landmark" },
        { label: "TABC Texas Excise Tax", value: c.tabcTax || 0, icon: "i-lucide-map-pin" },
        { label: "Other", value: c.other || 0, icon: "i-lucide-ellipsis" }
      ].filter((line) => line.value > 0);
    });
    const costPerBottle = computed(() => {
      if (!production.value?.quantity || production.value.quantity === 0) return 0;
      return (production.value.productionCost || 0) / production.value.quantity;
    });
    const resolveItemName = (id) => {
      if (!id) return "N/A";
      const item = itemStore.getItemById(id);
      return item?.name || id;
    };
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelProduction);
    const editProduction = () => {
      if (!production.value) return;
      productionStore.production = structuredClone(toRaw(production.value));
      panel.open();
    };
    const deleteProduction = async () => {
      if (!production.value) return;
      const confirmed = await confirm("Production", `${bottleName.value} - ${formattedDate.value}`);
      if (!confirmed) return;
      await productionStore.deleteProduction(production.value._id);
      toast.add({ title: "Production deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/production");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      if (!unref(productionStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(production)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(bottleName),
          subtitle: unref(formattedDate),
          icon: "i-lucide-factory"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/production")
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
                onClick: editProduction
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
                onClick: deleteProduction
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
                createVNode(_component_UButton, {
                  icon: "i-lucide-arrow-left",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: ($event) => unref(router).push("/admin/production")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editProduction
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
                  onClick: deleteProduction
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
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Production Info</h3><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(formattedDate))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Bottle</div>`);
        if (unref(production).bottle) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/bottles/${unref(production).bottle}`,
            class: "text-sm text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(bottleName))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(bottleName)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div class="text-sm text-parchment/60">N/A</div>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Quantity</div><div class="text-sm text-parchment">${ssrInterpolate(unref(production).quantity)}</div></div>`);
        if (unref(production).bottling?.glassware) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Glassware</div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/items/${unref(production).bottling.glassware}`,
            class: "text-sm text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(resolveItemName(unref(production).bottling.glassware))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(resolveItemName(unref(production).bottling.glassware)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(production).bottling?.cap) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Cap</div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/items/${unref(production).bottling.cap}`,
            class: "text-sm text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(resolveItemName(unref(production).bottling.cap))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(resolveItemName(unref(production).bottling.cap)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(production).bottling?.label) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Label</div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/items/${unref(production).bottling.label}`,
            class: "text-sm text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(resolveItemName(unref(production).bottling.label))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(resolveItemName(unref(production).bottling.label)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Source Vessels</h3>`);
        if (unref(resolvedVessels).length > 0) {
          _push(`<div class="divide-y divide-brown/20"><!--[-->`);
          ssrRenderList(unref(resolvedVessels), (vessel) => {
            _push(`<div class="flex items-center justify-between py-2 text-sm">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/vessels/${vessel._id}`,
              class: "text-gold hover:text-copper transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(vessel.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(vessel.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="text-parchment/50 text-xs">${ssrInterpolate(vessel.type)}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-container",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No source vessels</p></div>`);
        }
        _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Cost Breakdown</h3><div class="space-y-2">`);
        if (unref(hasCostBreakdown)) {
          _push(`<!--[-->`);
          ssrRenderList(unref(costBreakdownLines), (line) => {
            _push(`<div class="flex items-center justify-between text-sm"><div class="flex items-center gap-2">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: line.icon,
              class: "text-parchment/50 w-4 h-4"
            }, null, _parent));
            _push(`<span class="text-parchment/60">${ssrInterpolate(line.label)}</span></div><span class="text-parchment">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(line.value))}</span></div>`);
          });
          _push(`<!--]-->`);
        } else {
          _push(`<div class="flex justify-between text-sm"><span class="text-parchment/60">Production Cost</span><span class="text-parchment">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(production).productionCost || 0))}</span></div>`);
        }
        _push(`<div class="border-t border-brown/30 pt-2 flex justify-between text-sm font-semibold"><span class="text-parchment">Total Production Cost</span><span class="text-parchment">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(production).productionCost || 0))}</span></div>`);
        if (unref(production).quantity) {
          _push(`<div class="flex justify-between text-sm"><span class="text-parchment/60">Cost per Bottle</span><span class="text-copper font-medium">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(costPerBottle)))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Production not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/production")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Production `);
            } else {
              return [
                createTextVNode(" Back to Production ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/production/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-c0Wjipd5.mjs.map

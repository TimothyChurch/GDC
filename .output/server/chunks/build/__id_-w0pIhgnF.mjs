import { u as useRoute, h as useRouter, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$3 } from './SiteDatePicker-pVMyeD61.mjs';
import { _ as _sfc_main$4 } from './Input-Fd8Vd_4J.mjs';
import { _ as _sfc_main$5 } from './DropdownMenu-CzZGZl93.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { Line } from 'vue-chartjs';
import { u as useChartRegistration } from './useChartRegistration-vDVtbpQr.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { L as LazyPanelBottle, u as useBottleStock } from './PanelBottle-DYwBERoj.mjs';
import { L as LazyPanelInventory } from './PanelInventory-C5TLo_gj.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
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
import './Popover-BvOOk09Z.mjs';
import 'reka-ui/namespaced';
import './FieldGroup-bwPzB93U.mjs';
import 'v-calendar';
import 'date-fns';
import './Kbd-C22JBoFL.mjs';
import 'chart.js';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BottleInventorySection",
  __ssrInlineRender: true,
  props: {
    bottleId: {}
  },
  setup(__props) {
    useChartRegistration();
    const props = __props;
    const bottleStore = useBottleStore();
    const inventoryStore = useInventoryStore();
    const overlay = useOverlay();
    const inventoryPanel = overlay.create(LazyPanelInventory);
    const { confirm } = useDeleteConfirm();
    const { getStockStatus } = useBottleStock();
    const bottle = computed(() => bottleStore.getBottleById(props.bottleId));
    const inventory = computed(
      () => inventoryStore.getInventoriesByItem(props.bottleId)
    );
    const addInventory = ref(false);
    const showRecords = ref(false);
    const inventoryNewestFirst = computed(
      () => [...inventory.value].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
    const sortedInventory = computed(
      () => [...inventory.value].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );
    const currentStock = computed(() => {
      if (sortedInventory.value.length === 0) return 0;
      return sortedInventory.value[sortedInventory.value.length - 1]?.quantity ?? 0;
    });
    const stockStatus = computed(() => getStockStatus(props.bottleId));
    const avgMonthlyUsage = computed(() => stockStatus.value?.avgMonthlyUsage ?? 0);
    const monthsOfStockRemaining = computed(() => stockStatus.value?.monthsRemaining ?? Infinity);
    const isLowStock = computed(() => stockStatus.value?.isLowStock ?? false);
    const chartData = computed(() => ({
      labels: sortedInventory.value.map(
        (inv) => new Date(inv.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        })
      ),
      datasets: [
        {
          label: "Stock",
          data: sortedInventory.value.map((inv) => inv.quantity),
          borderColor: "#d4a574",
          backgroundColor: "rgba(212, 165, 116, 0.1)",
          tension: 0.3,
          fill: true
        }
      ]
    }));
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          ticks: { color: "rgba(255,255,255,0.4)" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        x: {
          ticks: { color: "rgba(255,255,255,0.4)" },
          grid: { color: "rgba(255,255,255,0.05)" }
        }
      }
    };
    const editRecord = (inv) => {
      inventoryStore.inventory = { ...inv };
      inventoryPanel.open();
    };
    const deleteRecord = async (id) => {
      const confirmed = await confirm("inventory record");
      if (!confirmed) return;
      await inventoryStore.deleteInventory(id);
      if (!bottle.value) return;
      const shouldBeInStock = currentStock.value > 0;
      if (bottle.value.inStock !== shouldBeInStock) {
        bottleStore.bottle = { ...bottle.value, inStock: shouldBeInStock };
        await bottleStore.updateBottle();
      }
    };
    const updateInventory = async () => {
      inventoryStore.inventory.item = props.bottleId;
      await inventoryStore.updateInventory();
      addInventory.value = false;
      if (!bottle.value) return;
      const shouldBeInStock = currentStock.value > 0;
      if (bottle.value.inStock !== shouldBeInStock) {
        bottleStore.bottle = { ...bottle.value, inStock: shouldBeInStock };
        await bottleStore.updateBottle();
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8;
      const _component_UIcon = _sfc_main$e;
      const _component_SiteDatePicker = _sfc_main$3;
      const _component_UInput = _sfc_main$4;
      const _component_UDropdownMenu = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"> Inventory </h3><p class="text-xs text-parchment/60 mt-0.5"> Current stock: ${ssrInterpolate(unref(currentStock))}</p></div><div class="flex items-center gap-2">`);
      if (unref(inventory).length > 0) {
        _push(ssrRenderComponent(_component_UButton, {
          icon: unref(showRecords) ? "i-lucide-eye-off" : "i-lucide-eye",
          size: "sm",
          variant: "ghost",
          color: "neutral",
          onClick: ($event) => showRecords.value = !unref(showRecords)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(showRecords) ? "Hide Records" : "View Records")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(showRecords) ? "Hide Records" : "View Records"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UButton, {
        icon: "i-lucide-plus",
        size: "sm",
        variant: "outline",
        onClick: ($event) => addInventory.value = !unref(addInventory)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Add Entry `);
          } else {
            return [
              createTextVNode(" Add Entry ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(avgMonthlyUsage) > 0) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"><div class="rounded-lg border border-brown/20 bg-brown/5 p-3"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Avg. Monthly Usage</div><div class="text-lg font-semibold text-parchment">${ssrInterpolate(unref(avgMonthlyUsage).toFixed(1))}</div></div><div class="rounded-lg border border-brown/20 bg-brown/5 p-3"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Months Remaining</div><div class="${ssrRenderClass(["text-lg font-semibold", unref(isLowStock) ? "text-red-400" : "text-parchment"])}">${ssrInterpolate(unref(monthsOfStockRemaining) === Infinity ? "--" : unref(monthsOfStockRemaining).toFixed(1))}</div></div>`);
        if (unref(isLowStock)) {
          _push(`<div class="col-span-2 sm:col-span-1 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 p-3">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-triangle-alert",
            class: "text-red-400 text-lg shrink-0"
          }, null, _parent));
          _push(`<div class="text-sm text-red-400 font-medium">Low stock — less than 1 month remaining</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(addInventory)) {
        _push(`<div class="mb-4 p-3 rounded-lg border border-brown/20 bg-brown/5"><div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"><div><div class="text-xs text-parchment/60 mb-1">Date</div>`);
        _push(ssrRenderComponent(_component_SiteDatePicker, {
          modelValue: unref(inventoryStore).inventory.date,
          "onUpdate:modelValue": ($event) => unref(inventoryStore).inventory.date = $event
        }, null, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 mb-1">Quantity</div>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(inventoryStore).inventory.quantity,
          "onUpdate:modelValue": ($event) => unref(inventoryStore).inventory.quantity = $event,
          type: "number",
          placeholder: "0"
        }, null, _parent));
        _push(`</div><div class="flex gap-2">`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: updateInventory,
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Add`);
            } else {
              return [
                createTextVNode("Add")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          color: "neutral",
          variant: "outline",
          size: "sm",
          onClick: ($event) => addInventory.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Cancel`);
            } else {
              return [
                createTextVNode("Cancel")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(sortedInventory).length > 1) {
        _push(`<div class="h-48">`);
        _push(ssrRenderComponent(unref(Line), {
          data: unref(chartData),
          options: chartOptions
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="text-center py-6">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-archive",
          class: "text-2xl text-parchment/20 mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">No inventory records</p></div>`);
      }
      if (unref(showRecords) && unref(inventoryNewestFirst).length > 0) {
        _push(`<div class="mt-4 space-y-2"><h4 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider mb-2"> Records (${ssrInterpolate(unref(inventoryNewestFirst).length)}) </h4><!--[-->`);
        ssrRenderList(unref(inventoryNewestFirst), (inv) => {
          _push(`<div class="flex items-center justify-between rounded-lg border border-brown/20 bg-brown/5 px-4 py-3"><div class="flex items-center gap-4"><span class="text-sm text-parchment">${ssrInterpolate(new Date(inv.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }))}</span><span class="text-sm font-semibold text-parchment">${ssrInterpolate(inv.quantity)} units</span></div>`);
          _push(ssrRenderComponent(_component_UDropdownMenu, {
            items: [
              { label: "Edit", icon: "i-lucide-pencil", onSelect: () => editRecord(inv) },
              { label: "Delete", icon: "i-lucide-trash-2", color: "error", onSelect: () => deleteRecord(inv._id) }
            ]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: "i-lucide-ellipsis-vertical",
                  size: "xs",
                  variant: "ghost",
                  color: "neutral"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UButton, {
                    icon: "i-lucide-ellipsis-vertical",
                    size: "xs",
                    variant: "ghost",
                    color: "neutral"
                  })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Bottle/BottleInventorySection.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$2, { __name: "BottleInventorySection" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BottleProductionHistory",
  __ssrInlineRender: true,
  props: {
    bottleId: {}
  },
  setup(__props) {
    const props = __props;
    useRouter();
    const productionStore = useProductionStore();
    const batchStore = useBatchStore();
    const vesselStore = useVesselStore();
    const bottleProductions = computed(
      () => productionStore.getProductionsByBottle(props.bottleId)
    );
    const totalProduced = computed(
      () => bottleProductions.value.reduce((sum, p) => sum + (p.quantity || 0), 0)
    );
    const getBatchForProduction = (productionId) => {
      return batchStore.batches.find(
        (b) => b.stages?.bottled?.productionRecord === productionId
      );
    };
    const getVesselNames = (vesselIds) => {
      return vesselIds.map((id) => vesselStore.getVesselById(id)?.name).filter(Boolean).join(", ");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_NuxtLink = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-5" }, _attrs))}><div class="flex items-center justify-between mb-4"><div><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]"> Production History </h3>`);
      if (unref(bottleProductions).length > 0) {
        _push(`<p class="text-xs text-parchment/60 mt-0.5">${ssrInterpolate(unref(bottleProductions).length)} production${ssrInterpolate(unref(bottleProductions).length !== 1 ? "s" : "")} · ${ssrInterpolate(unref(totalProduced))} bottles produced </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(bottleProductions).length > 0) {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(bottleProductions), (prod) => {
          _push(`<div class="rounded-lg border border-brown/20 bg-brown/5 p-4 cursor-pointer hover:border-copper/40 transition-colors"><div class="flex flex-col sm:flex-row sm:items-center gap-3"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1"><span class="text-sm font-medium text-parchment">${ssrInterpolate(new Date(prod.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</span>`);
          if (prod._id === unref(bottleProductions)[0]?._id) {
            _push(`<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-copper/15 text-copper border border-copper/25"> Latest </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-parchment/60">`);
          if (getVesselNames(prod.vessel)) {
            _push(`<span>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-container",
              class: "inline-block mr-0.5 align-text-bottom"
            }, null, _parent));
            _push(` ${ssrInterpolate(getVesselNames(prod.vessel))}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (getBatchForProduction(prod._id)) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/batch/${getBatchForProduction(prod._id)?._id}`,
              class: "text-copper hover:text-gold transition-colors",
              onClick: () => {
              }
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "i-lucide-flask-conical",
                    class: "inline-block mr-0.5 align-text-bottom"
                  }, null, _parent2, _scopeId));
                  _push2(` Batch #${ssrInterpolate(getBatchForProduction(prod._id)?.batchNumber || getBatchForProduction(prod._id)?._id?.slice(-6))}`);
                } else {
                  return [
                    createVNode(_component_UIcon, {
                      name: "i-lucide-flask-conical",
                      class: "inline-block mr-0.5 align-text-bottom"
                    }),
                    createTextVNode(" Batch #" + toDisplayString(getBatchForProduction(prod._id)?.batchNumber || getBatchForProduction(prod._id)?._id?.slice(-6)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex items-center gap-4 sm:gap-6 text-right"><div><div class="text-xs text-parchment/60 uppercase tracking-wider">Qty</div><div class="text-sm font-semibold text-parchment">${ssrInterpolate(prod.quantity)}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider">Cost/Bottle</div><div class="text-sm font-semibold text-copper">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(prod.bottleCost || 0))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider">Total Cost</div><div class="text-sm font-semibold text-parchment/70">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(prod.productionCost || 0))}</div></div>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-chevron-right",
            class: "text-parchment/50 shrink-0 hidden sm:block"
          }, null, _parent));
          _push(`</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="text-center py-6">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-factory",
          class: "text-2xl text-parchment/20 mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">No production records for this bottle</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Bottle/BottleProductionHistory.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$1, { __name: "BottleProductionHistory" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const bottleStore = useBottleStore();
    const recipeStore = useRecipeStore();
    const productionStore = useProductionStore();
    const bottle = computed(
      () => bottleStore.getBottleById(route.params._id)
    );
    const recipe = computed(
      () => bottle.value?.recipe ? recipeStore.getRecipeById(bottle.value.recipe) : void 0
    );
    const bottleProductions = computed(
      () => productionStore.getProductionsByBottle(route.params._id)
    );
    const latestBottleCost = computed(() => {
      if (bottleProductions.value.length === 0) return null;
      return bottleProductions.value[0].bottleCost;
    });
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelBottle);
    const editBottle = () => {
      if (!bottle.value) return;
      bottleStore.setBottle(bottle.value._id);
      panel.open();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_BottleInventorySection = __nuxt_component_4;
      const _component_BottleProductionHistory = __nuxt_component_5;
      if (!unref(bottleStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(bottle)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(bottle).name,
          subtitle: `${unref(bottle).class || ""}${unref(bottle).type ? " - " + unref(bottle).type : ""}`,
          icon: "i-lucide-wine"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/bottles")
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
                onClick: editBottle
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
            } else {
              return [
                createVNode(_component_UButton, {
                  icon: "i-lucide-arrow-left",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: ($event) => unref(router).push("/admin/bottles")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editBottle
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Edit ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"> Bottle Details </h3><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Recipe</div>`);
        if (unref(recipe)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/recipes/${unref(recipe)._id}`,
            class: "text-sm text-copper hover:text-gold transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(recipe).name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(recipe).name), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div class="text-sm text-parchment/60">N/A</div>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">ABV</div><div class="text-sm text-parchment">${ssrInterpolate(unref(bottle).abv || 0)}%</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Price</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(bottle).price || 0))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Cost / Bottle</div>`);
        if (unref(latestBottleCost) !== null) {
          _push(`<div class="text-sm text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(latestBottleCost)))} `);
          if (unref(bottle).price && unref(latestBottleCost) > 0) {
            _push(`<span class="text-xs font-normal text-parchment/50 ml-1"> (${ssrInterpolate(((1 - unref(latestBottleCost) / unref(bottle).price) * 100).toFixed(0))}% margin) </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="text-sm text-parchment/50">No production data</div>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Status</div><div class="flex items-center gap-1.5">`);
        if (unref(bottle).archived) {
          _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25"> Archived </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span class="${ssrRenderClass([
          "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
          unref(bottle).inStock ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"
        ])}">${ssrInterpolate(unref(bottle).inStock ? "In Stock" : "Out of Stock")}</span></div></div>`);
        if (unref(bottle).description) {
          _push(`<div class="col-span-2 sm:col-span-3 lg:col-span-6"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Description</div><div class="text-sm text-parchment/60">${ssrInterpolate(unref(bottle).description)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        _push(ssrRenderComponent(_component_BottleInventorySection, {
          "bottle-id": unref(route).params._id
        }, null, _parent));
        _push(ssrRenderComponent(_component_BottleProductionHistory, {
          "bottle-id": unref(route).params._id
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Bottle not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/bottles")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Bottles `);
            } else {
              return [
                createTextVNode(" Back to Bottles ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/bottles/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-w0pIhgnF.mjs.map

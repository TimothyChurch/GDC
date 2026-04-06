import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$1 } from './Badge-BJMjvXJU.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { f as formatWithUnits, a as formatInventoryQuantity } from './units-DWysHFem.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { u as useItemStore, b as usePurchaseOrderStore, g as getStockStatus, c as getStockStatusColor } from './useItemStore-Cpj9s1UF.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { u as useVesselStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { L as LazyPanelItem } from './PanelItem-vALhuSqS.mjs';
import { L as LazyPanelInventory } from './PanelInventory-D_YBEauK.mjs';
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
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './batchPipeline-Dr1IalWc.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const itemStore = useItemStore();
    const contactStore = useContactStore();
    const purchaseOrderStore = usePurchaseOrderStore();
    const inventoryStore = useInventoryStore();
    const vesselStore = useVesselStore();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const item = computed(() => itemStore.getItemById(route.params._id));
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelItem);
    const editItem = () => {
      if (!item.value) return;
      itemStore.setItem(item.value._id);
      panel.open();
    };
    const deleteItem = async () => {
      if (!item.value) return;
      const confirmed = await confirm("Item", item.value.name);
      if (!confirmed) return;
      await itemStore.deleteItem(item.value._id);
      toast.add({ title: "Item deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/items");
    };
    const inventoryPanel = overlay.create(LazyPanelInventory);
    const addInventoryRecord = () => {
      inventoryStore.resetInventory();
      inventoryStore.inventory.item = route.params._id;
      inventoryPanel.open();
    };
    const editInventoryRecord = (inv) => {
      inventoryStore.inventory = structuredClone(toRaw(inv));
      inventoryPanel.open();
    };
    const deleteInventoryRecord = async (inv) => {
      const confirmed = await confirm("Inventory Record");
      if (confirmed) {
        await inventoryStore.deleteInventory(inv._id);
      }
    };
    const vesselName = (locationId) => {
      if (!locationId) return null;
      const vessel = vesselStore.vessels.find((v) => v._id === locationId);
      return vessel?.name || null;
    };
    const latestVendorId = computed(() => {
      if (!item.value) return null;
      return itemStore.getVendorId(item.value._id);
    });
    const latestVendorName = computed(() => {
      if (!item.value) return "N/A";
      return itemStore.getVendorName(item.value._id) || "N/A";
    });
    const latestPricePerUnit = computed(() => {
      if (!item.value) return 0;
      return itemStore.latestPrice(item.value._id);
    });
    const purchaseOrders = computed(
      () => purchaseOrderStore.getPurchaseOrdersByItemId(route.params._id)
    );
    const getItemInPO = (po) => {
      return po.items.find((i) => i.item === route.params._id);
    };
    const inventoryRecords = computed(
      () => inventoryStore.getInventoriesByItem(route.params._id)
    );
    const currentStock = computed(() => {
      if (inventoryRecords.value.length === 0) return 0;
      const sorted = [...inventoryRecords.value].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return inventoryStore.getTotalQuantity(sorted[0]);
    });
    const stockStatus = computed(
      () => getStockStatus(currentStock.value, item.value?.reorderPoint || 0)
    );
    const stockStatusColor = computed(
      () => getStockStatusColor(stockStatus.value)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UBadge = _sfc_main$1;
      if (!unref(itemStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(item)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(item).name,
          icon: "i-lucide-package"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/items")
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
                onClick: editItem
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
                onClick: deleteItem
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
                  onClick: ($event) => unref(router).push("/admin/items")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editItem
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
                  onClick: deleteItem
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
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Item Details</h3><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div><div class="text-sm text-parchment">${ssrInterpolate(unref(item).name)}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Type</div><div class="text-sm text-parchment">${ssrInterpolate(unref(item).type || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vendor</div>`);
        if (unref(latestVendorId)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/contacts/${unref(latestVendorId)}`,
            class: "text-sm text-gold hover:text-copper transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(latestVendorName))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(latestVendorName)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div class="text-sm text-parchment">N/A</div>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Inventory Unit</div><div class="text-sm text-parchment">${ssrInterpolate(unref(item).inventoryUnit || "N/A")}</div></div>`);
        if (unref(item).unitSize && unref(item).unitLabel) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Packaging</div><div class="text-sm text-parchment">${ssrInterpolate(unref(item).unitSize)} ${ssrInterpolate(unref(item).inventoryUnit || "")} ${ssrInterpolate(unref(item).unitLabel)}s</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Latest Price/Unit</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(unref(latestPricePerUnit) > 0 ? `${("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(latestPricePerUnit))} / ${unref(item).inventoryUnit || ""}` : "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Category</div><div class="text-sm text-parchment">${ssrInterpolate(unref(item).category || "Other")}</div></div>`);
        if (unref(item).trackInventory !== false) {
          _push(`<!--[--><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Stock Status</div>`);
          _push(ssrRenderComponent(_component_UBadge, {
            color: unref(stockStatusColor),
            variant: "subtle",
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(stockStatus))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(stockStatus)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Current Stock</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(("formatWithUnits" in _ctx ? _ctx.formatWithUnits : unref(formatWithUnits))(unref(currentStock), unref(item)))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Reorder Point</div><div class="text-sm text-parchment">${ssrInterpolate(unref(item).reorderPoint || 0)} ${ssrInterpolate(unref(item).inventoryUnit || "")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Use / Month</div><div class="text-sm text-parchment">${ssrInterpolate(unref(item).usePerMonth ? `${unref(item).usePerMonth} ${unref(item).inventoryUnit || ""}` : "N/A")}</div></div><!--]-->`);
        } else {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Inventory Tracking</div>`);
          _push(ssrRenderComponent(_component_UBadge, {
            color: "neutral",
            variant: "subtle",
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Disabled`);
              } else {
                return [
                  createTextVNode("Disabled")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        }
        _push(`</div></div>`);
        if (unref(item).notes) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-3">Notes</h3><p class="text-sm text-parchment/80 whitespace-pre-wrap">${ssrInterpolate(unref(item).notes)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Purchase History</h3>`);
        if (unref(purchaseOrders).length > 0) {
          _push(`<div class="divide-y divide-brown/20"><div class="grid grid-cols-5 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid"><span>Date</span><span>Vendor</span><span>Status</span><span>Qty / Size</span><span class="text-right">Price</span></div><!--[-->`);
          ssrRenderList(unref(purchaseOrders), (po) => {
            _push(`<div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 py-2 text-sm"><span class="text-parchment">${ssrInterpolate(new Date(po.date).toLocaleDateString())}</span><span class="text-parchment/60">${ssrInterpolate(unref(contactStore).getContactById(po.vendor)?.businessName || "Unknown")}</span><span class="text-parchment/60 hidden sm:block">${ssrInterpolate(po.status)}</span><span class="text-parchment/60 hidden sm:block">${ssrInterpolate(getItemInPO(po)?.quantity || 0)} x ${ssrInterpolate(getItemInPO(po)?.size || 0)} ${ssrInterpolate(getItemInPO(po)?.sizeUnit)}</span><span class="text-parchment text-right">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(getItemInPO(po)?.price || 0))}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-receipt",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No purchase history</p></div>`);
        }
        _push(`</div>`);
        if (unref(item).trackInventory !== false) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Inventory History</h3>`);
          _push(ssrRenderComponent(_component_UButton, {
            icon: "i-lucide-plus",
            size: "sm",
            variant: "outline",
            onClick: addInventoryRecord
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Add Record `);
              } else {
                return [
                  createTextVNode(" Add Record ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
          if (unref(inventoryRecords).length > 0) {
            _push(`<div class="divide-y divide-brown/20"><div class="grid grid-cols-4 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid"><span>Date</span><span>Quantity</span><span>Location</span><span class="text-right">Actions</span></div><!--[-->`);
            ssrRenderList(unref(inventoryRecords), (inv) => {
              _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 py-2 text-sm group"><span class="text-parchment">${ssrInterpolate(new Date(inv.date).toLocaleDateString())}</span><span class="text-parchment">${ssrInterpolate(("formatInventoryQuantity" in _ctx ? _ctx.formatInventoryQuantity : unref(formatInventoryQuantity))(inv, unref(item)))}</span><span class="text-parchment/60 hidden sm:block">${ssrInterpolate(vesselName(inv.location || "") || "—")}</span><div class="flex items-center justify-end gap-1">`);
              _push(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-pencil",
                size: "xs",
                variant: "ghost",
                color: "neutral",
                onClick: ($event) => editInventoryRecord(inv)
              }, null, _parent));
              _push(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-trash-2",
                size: "xs",
                variant: "ghost",
                color: "error",
                onClick: ($event) => deleteInventoryRecord(inv)
              }, null, _parent));
              _push(`</div></div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<div class="text-center py-6">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-archive",
              class: "text-2xl text-parchment/20 mx-auto mb-2"
            }, null, _parent));
            _push(`<p class="text-sm text-parchment/50">No inventory records</p>`);
            _push(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              size: "sm",
              variant: "outline",
              class: "mt-3",
              onClick: addInventoryRecord
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Add First Record `);
                } else {
                  return [
                    createTextVNode(" Add First Record ")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Item not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/items")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Items `);
            } else {
              return [
                createTextVNode(" Back to Items ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/items/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-CAxbeedf.mjs.map

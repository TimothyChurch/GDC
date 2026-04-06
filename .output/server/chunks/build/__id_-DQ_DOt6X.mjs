import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, ref, unref, mergeProps, withCtx, createTextVNode, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { b as usePurchaseOrderStore, u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { L as LazyPanelPurchaseOrder } from './PanelPurchaseOrder-lL0nft8U.mjs';
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
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const purchaseOrderStore = usePurchaseOrderStore();
    const contactStore = useContactStore();
    const itemStore = useItemStore();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const po = computed(() => purchaseOrderStore.getPurchaseOrderById(route.params._id));
    const vendorName = computed(() => {
      if (!po.value?.vendor) return "Unknown";
      const contact = contactStore.getContactById(po.value.vendor);
      return contact?.businessName || `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() || "Unknown";
    });
    const formattedDate = computed(() => {
      if (!po.value?.date) return "";
      return new Date(po.value.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    });
    const taxRate = computed(() => po.value?.taxRate || 0);
    const shipping = computed(() => po.value?.shipping || 0);
    const resolvedItems = computed(() => {
      if (!po.value?.items) return [];
      return po.value.items.map((entry) => {
        const item = itemStore.getItemById(entry.item);
        const lineSubtotal = entry.price * entry.quantity;
        return {
          ...entry,
          name: item?.name || "Unknown",
          itemId: entry.item,
          lineTotal: lineSubtotal,
          brand: entry.brand || "",
          taxable: entry.taxable || false
        };
      });
    });
    const subtotal = computed(
      () => resolvedItems.value.reduce((sum, i) => sum + i.lineTotal, 0)
    );
    const totalTax = computed(
      () => resolvedItems.value.reduce((sum, i) => {
        if (!i.taxable) return sum;
        return sum + i.lineTotal * taxRate.value;
      }, 0)
    );
    const grandTotal = computed(() => subtotal.value + totalTax.value + shipping.value);
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelPurchaseOrder);
    const editPO = () => {
      if (!po.value) return;
      purchaseOrderStore.purchaseOrder = structuredClone(toRaw(po.value));
      panel.open();
    };
    const deletePO = async () => {
      if (!po.value) return;
      const confirmed = await confirm("Purchase Order", `${vendorName.value} - ${formattedDate.value}`);
      if (!confirmed) return;
      await purchaseOrderStore.deletePurchaseOrder(po.value._id);
      toast.add({ title: "Purchase order deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/purchaseOrders");
    };
    const canReceive = computed(() => {
      if (!po.value) return false;
      return po.value.status !== "Delivered" && po.value.status !== "Cancelled";
    });
    const receiving = ref(false);
    const markAsReceived = async () => {
      if (!po.value) return;
      receiving.value = true;
      try {
        purchaseOrderStore.purchaseOrder = structuredClone(toRaw(po.value));
        purchaseOrderStore.purchaseOrder.status = "Delivered";
        const result = await purchaseOrderStore.updatePurchaseOrder();
        result.items.forEach((item) => {
          const foundItem = itemStore.items.find((i) => i._id === item.item);
          if (foundItem && !foundItem.purchaseHistory?.includes(result._id)) {
            itemStore.item = foundItem;
            itemStore.item.purchaseHistory?.push(result._id);
            itemStore.updateItem();
          }
        });
        await purchaseOrderStore.receivePurchaseOrder(result._id);
      } finally {
        receiving.value = false;
      }
    };
    function statusColor(status) {
      switch (status) {
        case "Pending":
          return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
        case "Confirmed":
          return "bg-blue-500/15 text-blue-400 border-blue-500/25";
        case "Shipped":
          return "bg-purple-500/15 text-purple-400 border-purple-500/25";
        case "Received":
        case "Delivered":
          return "bg-green-500/15 text-green-400 border-green-500/25";
        case "Cancelled":
          return "bg-red-500/15 text-red-400 border-red-500/25";
        default:
          return "bg-brown/15 text-parchment/50 border-brown/25";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      if (!unref(purchaseOrderStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(po)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(vendorName),
          subtitle: unref(formattedDate),
          icon: "i-lucide-clipboard-list"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/purchaseOrders")
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
              if (unref(canReceive)) {
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: "i-lucide-package-check",
                  color: "success",
                  size: "sm",
                  loading: unref(receiving),
                  onClick: markAsReceived
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Mark as Received `);
                    } else {
                      return [
                        createTextVNode(" Mark as Received ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-pencil",
                size: "sm",
                onClick: editPO
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
                onClick: deletePO
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
                  onClick: ($event) => unref(router).push("/admin/purchaseOrders")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                unref(canReceive) ? (openBlock(), createBlock(_component_UButton, {
                  key: 0,
                  icon: "i-lucide-package-check",
                  color: "success",
                  size: "sm",
                  loading: unref(receiving),
                  onClick: markAsReceived
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Mark as Received ")
                  ]),
                  _: 1
                }, 8, ["loading"])) : createCommentVNode("", true),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editPO
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
                  onClick: deletePO
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
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Order Summary</h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Status</div><span class="${ssrRenderClass(["px-2 py-0.5 rounded-full text-[10px] font-semibold border", statusColor(unref(po).status)])}">${ssrInterpolate(unref(po).status)}</span></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Vendor</div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/admin/contacts/${unref(po).vendor}`,
          class: "text-sm text-copper hover:text-gold transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(vendorName))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(vendorName)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div><div class="text-sm text-parchment">${ssrInterpolate(unref(formattedDate))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Total</div><div class="text-sm text-parchment font-semibold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(grandTotal)))}</div></div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Order Items</h3>`);
        if (unref(resolvedItems).length > 0) {
          _push(`<div><div class="divide-y divide-brown/20"><div class="grid grid-cols-7 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid"><span>Item</span><span>Brand</span><span>Quantity</span><span>Size</span><span>Price</span><span class="text-center">Tax</span><span class="text-right">Line Total</span></div><!--[-->`);
          ssrRenderList(unref(resolvedItems), (item, i) => {
            _push(`<div class="grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-4 py-2 text-sm">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/items/${item.itemId}`,
              class: "text-copper hover:text-gold transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(item.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(item.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="text-parchment/50 hidden sm:block text-xs">${ssrInterpolate(item.brand || "-")}</span><span class="text-parchment/60">${ssrInterpolate(item.quantity)}</span><span class="text-parchment/60 hidden sm:block">${ssrInterpolate(item.size)} ${ssrInterpolate(item.sizeUnit)}</span><span class="text-parchment/60 hidden sm:block">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price))}</span><span class="text-center hidden sm:block">`);
            if (item.taxable) {
              _push(`<span class="text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full">TAX</span>`);
            } else {
              _push(`<span class="text-parchment/50">-</span>`);
            }
            _push(`</span><span class="text-parchment text-right font-medium">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.lineTotal))}</span></div>`);
          });
          _push(`<!--]--><div class="border-t border-brown/30 pt-3 space-y-1 text-sm"><div class="flex justify-between text-parchment/60"><span>Subtotal</span><span>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(subtotal)))}</span></div>`);
          if (unref(totalTax) > 0) {
            _push(`<div class="flex justify-between text-parchment/60"><span>Tax (${ssrInterpolate((unref(taxRate) * 100).toFixed(2))}%)</span><span>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(totalTax)))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(shipping) > 0) {
            _push(`<div class="flex justify-between text-parchment/60"><span>Shipping</span><span>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(shipping)))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex justify-between text-sm font-semibold text-parchment pt-1 border-t border-brown/20"><span>Grand Total</span><span>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(grandTotal)))}</span></div></div></div></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-package-open",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No items in this order</p></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Purchase order not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/purchaseOrders")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Purchase Orders `);
            } else {
              return [
                createTextVNode(" Back to Purchase Orders ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/purchaseOrders/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-DQ_DOt6X.mjs.map

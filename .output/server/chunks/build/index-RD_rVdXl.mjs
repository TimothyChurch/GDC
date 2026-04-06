import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, h as useRouter, g as useOverlay } from './server.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$2 } from './Table-BV7aBYOB.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, computed, unref, withCtx, createTextVNode, toDisplayString, createVNode, mergeProps, isRef, openBlock, createBlock, Fragment, renderList, createCommentVNode, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { b as usePurchaseOrderStore, u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, e as expandColumn, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
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
import './Input-Fd8Vd_4J.mjs';
import './FormField-DcXe0kwN.mjs';
import './Select-xxK8NqZT.mjs';
import '@tanstack/vue-virtual';
import './useSettingsStore-CJPFEN69.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TablePurchaseOrders",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    const router = useRouter();
    const purchaseOrderStore = usePurchaseOrderStore();
    const contactStore = useContactStore();
    const itemStore = useItemStore();
    const { confirm } = useDeleteConfirm();
    const tableData = computed(() => props.data ?? purchaseOrderStore.purchaseOrders);
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => tableData.value.length)
    );
    const columns = [
      expandColumn(),
      sortableColumn("status", "Status"),
      sortableColumn("vendor", "Vendor", {
        cell: ({ row }) => {
          const contact = contactStore.getContactById(row.original.vendor);
          if (contact?.firstName) return `${contact.firstName} ${contact.lastName}`;
          return contact?.businessName || "Unknown";
        }
      }),
      sortableColumn("total", "Total Amount", {
        cell: ({ row }) => Dollar.format(row.original.total)
      }),
      sortableColumn("date", "Date", {
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString()
      }),
      actionsColumn((row) => {
        const items = [
          {
            label: "View Details",
            onSelect() {
              router.push(`/admin/purchaseOrders/${row.original._id}`);
            }
          },
          {
            label: "Edit order",
            onSelect() {
              purchaseOrderStore.purchaseOrder = structuredClone(toRaw(row.original));
              openPanel();
            }
          }
        ];
        if (row.original.status !== "Delivered" && row.original.status !== "Cancelled") {
          items.push({
            label: "Mark as Received",
            async onSelect() {
              purchaseOrderStore.purchaseOrder = structuredClone(toRaw(row.original));
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
            }
          });
        }
        items.push({
          label: "Delete order",
          variant: "danger",
          async onClick() {
            const vendorName = contactStore.getContactById(row.original.vendor)?.businessName || "this order";
            const confirmed = await confirm("Purchase Order", vendorName);
            if (confirmed) {
              purchaseOrderStore.deletePurchaseOrder(row.original._id);
            }
          }
        });
        return items;
      })
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelPurchaseOrder);
    const openPanel = async () => await panel.open();
    const addPurchaseOrder = () => {
      purchaseOrderStore.resetCurrentPurchaseOrder();
      openPanel();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UButton = _sfc_main$8;
      const _component_UTable = _sfc_main$2;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(purchaseOrderStore).loading,
        "search-placeholder": "Search purchase orders..."
      }, _attrs), {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus-circle",
              size: "xl",
              onClick: addPurchaseOrder,
              variant: "ghost"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Order`);
                } else {
                  return [
                    createTextVNode("Add Order")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-plus-circle",
                size: "xl",
                onClick: addPurchaseOrder,
                variant: "ghost"
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Order")
                ]),
                _: 1
              })
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="hidden sm:block"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UTable, {
              ref_key: "tableRef",
              ref: tableRef,
              "global-filter": unref(search),
              "onUpdate:globalFilter": ($event) => isRef(search) ? search.value = $event : null,
              pagination: unref(pagination),
              "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
              "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
              data: unref(tableData),
              columns,
              loading: unref(purchaseOrderStore).loading,
              onSelect: (_e, row) => unref(router).push(`/admin/purchaseOrders/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-clipboard-list",
                    title: "No purchase orders found",
                    description: "Create purchase orders to track supplier orders",
                    "action-label": "Add Order",
                    onAction: addPurchaseOrder
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-clipboard-list",
                      title: "No purchase orders found",
                      description: "Create purchase orders to track supplier orders",
                      "action-label": "Add Order",
                      onAction: addPurchaseOrder
                    })
                  ];
                }
              }),
              expanded: withCtx(({ row }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="py-2 px-4"${_scopeId2}><table class="w-full text-sm"${_scopeId2}><thead${_scopeId2}><tr class="text-left text-parchment/60"${_scopeId2}><th class="pb-1"${_scopeId2}>Item</th><th class="pb-1"${_scopeId2}>Brand</th><th class="pb-1"${_scopeId2}>Quantity</th><th class="pb-1"${_scopeId2}>Size</th><th class="pb-1"${_scopeId2}>Price</th><th class="pb-1"${_scopeId2}>Tax</th><th class="pb-1"${_scopeId2}>Total</th></tr></thead><tbody${_scopeId2}><!--[-->`);
                  ssrRenderList(row.original.items, (item, idx) => {
                    _push3(`<tr${_scopeId2}><td${_scopeId2}>${ssrInterpolate(unref(itemStore).getItemById(item.item)?.name || "Unknown")}</td><td class="text-parchment/50"${_scopeId2}>${ssrInterpolate(item.brand || "-")}</td><td${_scopeId2}>${ssrInterpolate(item.quantity)}</td><td${_scopeId2}>${ssrInterpolate(item.size)} ${ssrInterpolate(item.sizeUnit)}</td><td${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price))}</td><td${_scopeId2}>`);
                    if (item.taxable) {
                      _push3(`<span class="text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full"${_scopeId2}>TAX</span>`);
                    } else {
                      _push3(`<span class="text-parchment/50"${_scopeId2}>-</span>`);
                    }
                    _push3(`</td><td${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price * item.quantity))}</td></tr>`);
                  });
                  _push3(`<!--]--></tbody>`);
                  if ((row.original.shipping || 0) > 0) {
                    _push3(`<tfoot${_scopeId2}><tr class="border-t border-brown/20 text-parchment/60"${_scopeId2}><td colspan="6" class="pt-1"${_scopeId2}>Shipping</td><td class="pt-1"${_scopeId2}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(row.original.shipping))}</td></tr></tfoot>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</table></div>`);
                } else {
                  return [
                    createVNode("div", { class: "py-2 px-4" }, [
                      createVNode("table", { class: "w-full text-sm" }, [
                        createVNode("thead", null, [
                          createVNode("tr", { class: "text-left text-parchment/60" }, [
                            createVNode("th", { class: "pb-1" }, "Item"),
                            createVNode("th", { class: "pb-1" }, "Brand"),
                            createVNode("th", { class: "pb-1" }, "Quantity"),
                            createVNode("th", { class: "pb-1" }, "Size"),
                            createVNode("th", { class: "pb-1" }, "Price"),
                            createVNode("th", { class: "pb-1" }, "Tax"),
                            createVNode("th", { class: "pb-1" }, "Total")
                          ])
                        ]),
                        createVNode("tbody", null, [
                          (openBlock(true), createBlock(Fragment, null, renderList(row.original.items, (item, idx) => {
                            return openBlock(), createBlock("tr", { key: idx }, [
                              createVNode("td", null, toDisplayString(unref(itemStore).getItemById(item.item)?.name || "Unknown"), 1),
                              createVNode("td", { class: "text-parchment/50" }, toDisplayString(item.brand || "-"), 1),
                              createVNode("td", null, toDisplayString(item.quantity), 1),
                              createVNode("td", null, toDisplayString(item.size) + " " + toDisplayString(item.sizeUnit), 1),
                              createVNode("td", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price)), 1),
                              createVNode("td", null, [
                                item.taxable ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full"
                                }, "TAX")) : (openBlock(), createBlock("span", {
                                  key: 1,
                                  class: "text-parchment/50"
                                }, "-"))
                              ]),
                              createVNode("td", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price * item.quantity)), 1)
                            ]);
                          }), 128))
                        ]),
                        (row.original.shipping || 0) > 0 ? (openBlock(), createBlock("tfoot", { key: 0 }, [
                          createVNode("tr", { class: "border-t border-brown/20 text-parchment/60" }, [
                            createVNode("td", {
                              colspan: "6",
                              class: "pt-1"
                            }, "Shipping"),
                            createVNode("td", { class: "pt-1" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(row.original.shipping)), 1)
                          ])
                        ])) : createCommentVNode("", true)
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(tableData).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter((p) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              const vendor = unref(contactStore).getContactById(p.vendor);
              const vendorName = vendor?.businessName || `${vendor?.firstName || ""} ${vendor?.lastName || ""}`.trim();
              return vendorName.toLowerCase().includes(term) || p.status.toLowerCase().includes(term);
            }), (po) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(unref(contactStore).getContactById(po.vendor)?.businessName || `${unref(contactStore).getContactById(po.vendor)?.firstName || ""} ${unref(contactStore).getContactById(po.vendor)?.lastName || ""}`.trim() || "Unknown")}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(new Date(po.date).toLocaleDateString())}</div></div><span class="${ssrRenderClass([{
                "bg-amber/15 text-amber border-amber/20": po.status === "Pending",
                "bg-blue-500/15 text-blue-400 border-blue-500/20": po.status === "Confirmed",
                "bg-purple-500/15 text-purple-400 border-purple-500/20": po.status === "Shipped",
                "bg-green-500/15 text-green-400 border-green-500/20": po.status === "Delivered",
                "bg-red-500/15 text-red-400 border-red-500/20": po.status === "Cancelled"
              }, "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}"${_scopeId}>${ssrInterpolate(po.status || "Pending")}</span></div><div class="grid grid-cols-2 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Items</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(po.items?.length || 0)} item${ssrInterpolate((po.items?.length || 0) !== 1 ? "s" : "")}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Total</span><div class="text-copper font-semibold"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(po.total || 0))}</div></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(tableData).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-clipboard-list",
                title: "No purchase orders found",
                description: "Create purchase orders to track supplier orders",
                "action-label": "Add Order",
                onAction: addPurchaseOrder
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "hidden sm:block" }, [
                createVNode(_component_UTable, {
                  ref_key: "tableRef",
                  ref: tableRef,
                  "global-filter": unref(search),
                  "onUpdate:globalFilter": ($event) => isRef(search) ? search.value = $event : null,
                  pagination: unref(pagination),
                  "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
                  "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
                  data: unref(tableData),
                  columns,
                  loading: unref(purchaseOrderStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/purchaseOrders/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-clipboard-list",
                      title: "No purchase orders found",
                      description: "Create purchase orders to track supplier orders",
                      "action-label": "Add Order",
                      onAction: addPurchaseOrder
                    })
                  ]),
                  expanded: withCtx(({ row }) => [
                    createVNode("div", { class: "py-2 px-4" }, [
                      createVNode("table", { class: "w-full text-sm" }, [
                        createVNode("thead", null, [
                          createVNode("tr", { class: "text-left text-parchment/60" }, [
                            createVNode("th", { class: "pb-1" }, "Item"),
                            createVNode("th", { class: "pb-1" }, "Brand"),
                            createVNode("th", { class: "pb-1" }, "Quantity"),
                            createVNode("th", { class: "pb-1" }, "Size"),
                            createVNode("th", { class: "pb-1" }, "Price"),
                            createVNode("th", { class: "pb-1" }, "Tax"),
                            createVNode("th", { class: "pb-1" }, "Total")
                          ])
                        ]),
                        createVNode("tbody", null, [
                          (openBlock(true), createBlock(Fragment, null, renderList(row.original.items, (item, idx) => {
                            return openBlock(), createBlock("tr", { key: idx }, [
                              createVNode("td", null, toDisplayString(unref(itemStore).getItemById(item.item)?.name || "Unknown"), 1),
                              createVNode("td", { class: "text-parchment/50" }, toDisplayString(item.brand || "-"), 1),
                              createVNode("td", null, toDisplayString(item.quantity), 1),
                              createVNode("td", null, toDisplayString(item.size) + " " + toDisplayString(item.sizeUnit), 1),
                              createVNode("td", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price)), 1),
                              createVNode("td", null, [
                                item.taxable ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-[10px] font-semibold text-amber bg-amber/15 border border-amber/25 px-1.5 py-0.5 rounded-full"
                                }, "TAX")) : (openBlock(), createBlock("span", {
                                  key: 1,
                                  class: "text-parchment/50"
                                }, "-"))
                              ]),
                              createVNode("td", null, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(item.price * item.quantity)), 1)
                            ]);
                          }), 128))
                        ]),
                        (row.original.shipping || 0) > 0 ? (openBlock(), createBlock("tfoot", { key: 0 }, [
                          createVNode("tr", { class: "border-t border-brown/20 text-parchment/60" }, [
                            createVNode("td", {
                              colspan: "6",
                              class: "pt-1"
                            }, "Shipping"),
                            createVNode("td", { class: "pt-1" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(row.original.shipping)), 1)
                          ])
                        ])) : createCommentVNode("", true)
                      ])
                    ])
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(tableData).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter((p) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  const vendor = unref(contactStore).getContactById(p.vendor);
                  const vendorName = vendor?.businessName || `${vendor?.firstName || ""} ${vendor?.lastName || ""}`.trim();
                  return vendorName.toLowerCase().includes(term) || p.status.toLowerCase().includes(term);
                }), (po) => {
                  return openBlock(), createBlock("div", {
                    key: po._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => unref(router).push(`/admin/purchaseOrders/${po._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(unref(contactStore).getContactById(po.vendor)?.businessName || `${unref(contactStore).getContactById(po.vendor)?.firstName || ""} ${unref(contactStore).getContactById(po.vendor)?.lastName || ""}`.trim() || "Unknown"), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(new Date(po.date).toLocaleDateString()), 1)
                      ]),
                      createVNode("span", {
                        class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", {
                          "bg-amber/15 text-amber border-amber/20": po.status === "Pending",
                          "bg-blue-500/15 text-blue-400 border-blue-500/20": po.status === "Confirmed",
                          "bg-purple-500/15 text-purple-400 border-purple-500/20": po.status === "Shipped",
                          "bg-green-500/15 text-green-400 border-green-500/20": po.status === "Delivered",
                          "bg-red-500/15 text-red-400 border-red-500/20": po.status === "Cancelled"
                        }]
                      }, toDisplayString(po.status || "Pending"), 3)
                    ]),
                    createVNode("div", { class: "grid grid-cols-2 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Items"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(po.items?.length || 0) + " item" + toDisplayString((po.items?.length || 0) !== 1 ? "s" : ""), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Total"),
                        createVNode("div", { class: "text-copper font-semibold" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(po.total || 0)), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(tableData).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-clipboard-list",
                  title: "No purchase orders found",
                  description: "Create purchase orders to track supplier orders",
                  "action-label": "Add Order",
                  onAction: addPurchaseOrder
                })) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TablePurchaseOrders.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "TablePurchaseOrders" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const purchaseOrderStore = usePurchaseOrderStore();
    const selectedStatus = ref("All");
    const PO_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    const statusTabs = computed(() => {
      const counts = { All: purchaseOrderStore.purchaseOrders.length };
      for (const status of PO_STATUSES) {
        counts[status] = purchaseOrderStore.purchaseOrders.filter((po) => po.status === status).length;
      }
      return [
        { name: "All", count: counts.All },
        ...PO_STATUSES.map((s) => ({ name: s, count: counts[s] || 0 }))
      ];
    });
    const filteredPOs = computed(() => {
      if (selectedStatus.value === "All") return void 0;
      return purchaseOrderStore.purchaseOrders.filter((po) => po.status === selectedStatus.value);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TablePurchaseOrders = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Purchase Orders",
        subtitle: "Track vendor orders and deliveries",
        icon: "i-lucide-clipboard-list"
      }, null, _parent));
      _push(`<div class="flex gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-hide"><!--[-->`);
      ssrRenderList(unref(statusTabs), (tab) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: tab.name,
          variant: "ghost",
          size: "xs",
          class: ["rounded-full border whitespace-nowrap", unref(selectedStatus) === tab.name ? "bg-gold/15 text-gold border-gold/20" : "text-parchment/50 border-brown/20 hover:text-parchment/70 hover:border-brown/30"],
          onClick: ($event) => selectedStatus.value = tab.name
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(tab.name)} <span class="${ssrRenderClass([unref(selectedStatus) === tab.name ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60", "px-1.5 py-0.5 rounded-full text-[10px] font-semibold"])}"${_scopeId}>${ssrInterpolate(tab.count)}</span>`);
            } else {
              return [
                createTextVNode(toDisplayString(tab.name) + " ", 1),
                createVNode("span", {
                  class: ["px-1.5 py-0.5 rounded-full text-[10px] font-semibold", unref(selectedStatus) === tab.name ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60"]
                }, toDisplayString(tab.count), 3)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div>`);
      _push(ssrRenderComponent(_component_TablePurchaseOrders, { data: unref(filteredPOs) }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/purchaseOrders/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-RD_rVdXl.mjs.map

import { _ as _sfc_main$2 } from './Badge-BJMjvXJU.mjs';
import { h as useRouter, e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$1 } from './Table-BV7aBYOB.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { f as formatWithUnits } from './units-DWysHFem.mjs';
import { defineComponent, ref, useTemplateRef, computed, withCtx, unref, createTextVNode, createVNode, isRef, toDisplayString, openBlock, createBlock, createCommentVNode, Fragment, renderList, h, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useItemStore, c as getStockStatusColor } from './useItemStore-Cpj9s1UF.mjs';
import 'reka-ui';
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
import './useContactStore-DKhOek2F.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "shopping-list",
  __ssrInlineRender: true,
  setup(__props) {
    const router = useRouter();
    const itemStore = useItemStore();
    const UBadge = _sfc_main$2;
    const UButton = _sfc_main$8;
    const columns = [
      {
        id: "name",
        accessorFn: (row) => row.item.name,
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return h(_sfc_main$8, {
            color: "neutral",
            variant: "ghost",
            label: "Item",
            icon: isSorted ? isSorted === "asc" ? "i-lucide-arrow-up-narrow-wide" : "i-lucide-arrow-down-wide-narrow" : "i-lucide-arrow-up-down",
            class: "-mx-2.5",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
          });
        },
        cell: ({ row }) => {
          return h(
            "span",
            { class: "text-parchment font-medium" },
            row.original.item.name
          );
        }
      },
      {
        id: "category",
        accessorFn: (row) => row.item.category || "Other",
        header: "Category",
        cell: ({ row }) => {
          return row.original.item.category || "Other";
        }
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const color = getStockStatusColor(status);
          return h(
            _sfc_main$2,
            {
              color,
              variant: "subtle",
              size: "sm"
            },
            () => status
          );
        }
      },
      {
        id: "currentStock",
        accessorFn: (row) => row.currentStock,
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return h(_sfc_main$8, {
            color: "neutral",
            variant: "ghost",
            label: "Current Stock",
            icon: isSorted ? isSorted === "asc" ? "i-lucide-arrow-up-narrow-wide" : "i-lucide-arrow-down-wide-narrow" : "i-lucide-arrow-up-down",
            class: "-mx-2.5",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
          });
        },
        cell: ({ row }) => {
          const stock = row.original.currentStock;
          const colorClass = stock <= 0 ? "text-red-400 font-bold" : "text-amber-400 font-semibold";
          return h("span", { class: colorClass }, formatWithUnits(stock, row.original.item));
        }
      },
      {
        id: "reorderPoint",
        accessorFn: (row) => row.reorderPoint,
        header: "Reorder Point",
        cell: ({ row }) => {
          const rp = row.original.reorderPoint;
          const unit = row.original.item.inventoryUnit || "units";
          return rp > 0 ? `${rp} ${unit}` : "--";
        }
      },
      {
        id: "usePerMonth",
        accessorFn: (row) => row.usePerMonth,
        header: "Use / Month",
        cell: ({ row }) => {
          const upm = row.original.usePerMonth;
          const unit = row.original.item.inventoryUnit || "units";
          return upm > 0 ? `${upm} ${unit}` : "--";
        }
      },
      {
        id: "suggestedOrderQty",
        accessorFn: (row) => row.suggestedOrderQty,
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return h(_sfc_main$8, {
            color: "neutral",
            variant: "ghost",
            label: "Suggested Qty",
            icon: isSorted ? isSorted === "asc" ? "i-lucide-arrow-up-narrow-wide" : "i-lucide-arrow-down-wide-narrow" : "i-lucide-arrow-up-down",
            class: "-mx-2.5",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
          });
        },
        cell: ({ row }) => {
          const qty = row.original.suggestedOrderQty;
          return h(
            "span",
            { class: "text-gold font-semibold" },
            formatWithUnits(qty, row.original.item)
          );
        }
      }
    ];
    const globalFilter = ref("");
    const pagination = ref({ pageIndex: 0, pageSize: 20 });
    const tableRef = useTemplateRef("tableRef");
    const filteredTotal = computed(
      () => tableRef.value?.tableApi?.getFilteredRowModel().rows.length ?? itemStore.shoppingListItems.length
    );
    const outOfStockCount = computed(
      () => itemStore.shoppingListItems.filter((i) => i.status === "Out of Stock").length
    );
    const lowStockCount = computed(
      () => itemStore.shoppingListItems.filter((i) => i.status === "Low Stock").length
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UIcon = _sfc_main$e;
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UTable = _sfc_main$1;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Shopping List",
        subtitle: "Items that need to be purchased based on inventory levels and usage",
        icon: "i-lucide-shopping-cart"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(UButton), {
              icon: "i-lucide-warehouse",
              variant: "outline",
              to: "/admin/inventory"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Inventory `);
                } else {
                  return [
                    createTextVNode(" Inventory ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(UButton), {
              icon: "i-lucide-receipt",
              to: "/admin/purchaseOrders"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Create Purchase Order `);
                } else {
                  return [
                    createTextVNode(" Create Purchase Order ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(UButton), {
                icon: "i-lucide-warehouse",
                variant: "outline",
                to: "/admin/inventory"
              }, {
                default: withCtx(() => [
                  createTextVNode(" Inventory ")
                ]),
                _: 1
              }),
              createVNode(unref(UButton), {
                icon: "i-lucide-receipt",
                to: "/admin/purchaseOrders"
              }, {
                default: withCtx(() => [
                  createTextVNode(" Create Purchase Order ")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(itemStore).shoppingListItems.length > 0) {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"><div class="bg-charcoal rounded-xl border border-brown/30 p-4 flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-alert-triangle",
          class: "text-xl text-red-400"
        }, null, _parent));
        _push(`</div><div><div class="text-2xl font-bold text-red-400">${ssrInterpolate(unref(outOfStockCount))}</div><div class="text-xs text-parchment/60">Out of Stock</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4 flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-triangle-alert",
          class: "text-xl text-amber-400"
        }, null, _parent));
        _push(`</div><div><div class="text-2xl font-bold text-amber-400">${ssrInterpolate(unref(lowStockCount))}</div><div class="text-xs text-parchment/60">Low Stock</div></div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-4 flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-shopping-cart",
          class: "text-xl text-gold"
        }, null, _parent));
        _push(`</div><div><div class="text-2xl font-bold text-gold">${ssrInterpolate(unref(itemStore).shoppingListItems.length)}</div><div class="text-xs text-parchment/60">Total Items</div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_TableWrapper, {
        search: unref(globalFilter),
        "onUpdate:search": ($event) => isRef(globalFilter) ? globalFilter.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(itemStore).loading,
        "search-placeholder": "Search shopping list...",
        "empty-icon": "i-lucide-package-check",
        "empty-label": "All stocked up! No items need purchasing."
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="hidden sm:block"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UTable, {
              ref_key: "tableRef",
              ref: tableRef,
              "global-filter": unref(globalFilter),
              "onUpdate:globalFilter": ($event) => isRef(globalFilter) ? globalFilter.value = $event : null,
              pagination: unref(pagination),
              "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
              "pagination-options": {
                getPaginationRowModel: unref(getPaginationRowModel)()
              },
              data: unref(itemStore).shoppingListItems,
              columns,
              loading: unref(itemStore).loading,
              ui: { tr: "cursor-pointer" },
              onSelect: (_e, row) => unref(router).push(`/admin/items/${row.original.item._id}`)
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-package-check",
                    title: "All stocked up!",
                    description: "No items need purchasing."
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-package-check",
                      title: "All stocked up!",
                      description: "No items need purchasing."
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}>`);
            if (unref(itemStore).shoppingListItems.length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-package-check",
                title: "All stocked up!",
                description: "No items need purchasing."
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList(unref(itemStore).shoppingListItems, (entry) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer hover:border-gold/30 transition-all duration-200"${_scopeId}><div class="flex items-start justify-between mb-3"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(entry.item.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(entry.item.category || "Other")}</div></div>`);
              _push2(ssrRenderComponent(unref(UBadge), {
                color: unref(getStockStatusColor)(entry.status),
                variant: "subtle",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(entry.status)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(entry.status), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div><div class="grid grid-cols-3 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Current</span><div class="${ssrRenderClass(
                entry.currentStock <= 0 ? "text-red-400 font-bold" : "text-amber-400 font-semibold"
              )}"${_scopeId}>${ssrInterpolate(("formatWithUnits" in _ctx ? _ctx.formatWithUnits : unref(formatWithUnits))(entry.currentStock, entry.item))}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Use/Mo</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(entry.usePerMonth > 0 ? `${entry.usePerMonth} ${entry.item.inventoryUnit || "units"}` : "--")}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Order Qty</span><div class="text-gold font-semibold"${_scopeId}>${ssrInterpolate(("formatWithUnits" in _ctx ? _ctx.formatWithUnits : unref(formatWithUnits))(entry.suggestedOrderQty, entry.item))}</div></div></div></div>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "hidden sm:block" }, [
                createVNode(_component_UTable, {
                  ref_key: "tableRef",
                  ref: tableRef,
                  "global-filter": unref(globalFilter),
                  "onUpdate:globalFilter": ($event) => isRef(globalFilter) ? globalFilter.value = $event : null,
                  pagination: unref(pagination),
                  "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
                  "pagination-options": {
                    getPaginationRowModel: unref(getPaginationRowModel)()
                  },
                  data: unref(itemStore).shoppingListItems,
                  columns,
                  loading: unref(itemStore).loading,
                  ui: { tr: "cursor-pointer" },
                  onSelect: (_e, row) => unref(router).push(`/admin/items/${row.original.item._id}`)
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-package-check",
                      title: "All stocked up!",
                      description: "No items need purchasing."
                    })
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                unref(itemStore).shoppingListItems.length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-package-check",
                  title: "All stocked up!",
                  description: "No items need purchasing."
                })) : createCommentVNode("", true),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(itemStore).shoppingListItems, (entry) => {
                  return openBlock(), createBlock("div", {
                    key: entry.item._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer hover:border-gold/30 transition-all duration-200",
                    onClick: ($event) => unref(router).push(`/admin/items/${entry.item._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-3" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(entry.item.name), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(entry.item.category || "Other"), 1)
                      ]),
                      createVNode(unref(UBadge), {
                        color: unref(getStockStatusColor)(entry.status),
                        variant: "subtle",
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(entry.status), 1)
                        ]),
                        _: 2
                      }, 1032, ["color"])
                    ]),
                    createVNode("div", { class: "grid grid-cols-3 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Current"),
                        createVNode("div", {
                          class: entry.currentStock <= 0 ? "text-red-400 font-bold" : "text-amber-400 font-semibold"
                        }, toDisplayString(("formatWithUnits" in _ctx ? _ctx.formatWithUnits : unref(formatWithUnits))(entry.currentStock, entry.item)), 3)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Use/Mo"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(entry.usePerMonth > 0 ? `${entry.usePerMonth} ${entry.item.inventoryUnit || "units"}` : "--"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Order Qty"),
                        createVNode("div", { class: "text-gold font-semibold" }, toDisplayString(("formatWithUnits" in _ctx ? _ctx.formatWithUnits : unref(formatWithUnits))(entry.suggestedOrderQty, entry.item)), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/inventory/shopping-list.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=shopping-list-B56cKGYk.mjs.map

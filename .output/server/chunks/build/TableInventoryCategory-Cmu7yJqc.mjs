import { _ as _sfc_main$1 } from './Badge-BJMjvXJU.mjs';
import { _ as __nuxt_component_4 } from './TableWrapper-DhLG7m1v.mjs';
import { _ as _sfc_main$3 } from './Switch-BH6j8VnQ.mjs';
import { h as useRouter, g as useOverlay, e as _sfc_main$8 } from './server.mjs';
import { _ as _sfc_main$2 } from './Table-HT3K8pYo.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { f as formatWithUnits } from './units-DWysHFem.mjs';
import { defineComponent, ref, computed, h, mergeProps, unref, isRef, withCtx, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useItemStore, c as getStockStatusColor, g as getStockStatus } from './useItemStore-Cpj9s1UF.mjs';
import { u as useInventoryStore } from './useInventoryStore-BPtbZ8hY.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelItem } from './PanelItem-B6mZ28UD.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "TableInventoryCategory",
  __ssrInlineRender: true,
  props: {
    category: {}
  },
  setup(__props) {
    const props = __props;
    const router = useRouter();
    const itemStore = useItemStore();
    const inventoryStore = useInventoryStore();
    const { confirm } = useDeleteConfirm();
    const UBadge = _sfc_main$1;
    const showOutOfStock = ref(false);
    const allCategoryItems = computed(() => itemStore.getItemsByCategory(props.category));
    function getLatestQuantity(itemId) {
      const records = inventoryStore.getInventoriesByItem(itemId);
      if (records.length === 0) return 0;
      const sorted = [...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return inventoryStore.getTotalQuantity(sorted[0]);
    }
    const outOfStockCount = computed(
      () => allCategoryItems.value.filter((item) => getLatestQuantity(item._id) <= 0).length
    );
    const categoryItems = computed(() => {
      if (showOutOfStock.value) return allCategoryItems.value;
      return allCategoryItems.value.filter((item) => getLatestQuantity(item._id) > 0);
    });
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => categoryItems.value.length)
    );
    const columns = [
      sortableColumn("name", "Name"),
      {
        accessorKey: "type",
        header: "Type"
      },
      {
        id: "inventory",
        header: "Inventory",
        cell: ({ row }) => {
          const qty = getLatestQuantity(row.original._id);
          return formatWithUnits(qty, row.original);
        }
      },
      {
        accessorKey: "usePerMonth",
        header: "Use/Month",
        cell: ({ row }) => {
          const val = row.original.usePerMonth || 0;
          if (val === 0) return "--";
          const unit = row.original.inventoryUnit || "";
          return `${val} ${unit}`;
        }
      },
      {
        id: "stockStatus",
        header: "Status",
        cell: ({ row }) => {
          const qty = getLatestQuantity(row.original._id);
          const reorder = row.original.reorderPoint || 0;
          const status = getStockStatus(qty, reorder);
          const color = getStockStatusColor(status);
          return h(_sfc_main$1, { color, variant: "subtle", size: "sm" }, () => status);
        }
      },
      actionsColumn((row) => [
        {
          label: "Edit item",
          onSelect() {
            itemStore.setItem(row.original._id.toString());
            openModal();
          }
        },
        {
          label: "Delete item",
          variant: "danger",
          async onClick() {
            const confirmed = await confirm("Item", row.original.name);
            if (confirmed) {
              itemStore.deleteItem(row.original._id.toString());
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const modal = overlay.create(LazyPanelItem);
    const newItem = () => {
      itemStore.resetItem();
      itemStore.item.category = props.category;
      openModal();
    };
    const openModal = async () => await modal.open();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_USwitch = _sfc_main$3;
      const _component_UButton = _sfc_main$8;
      const _component_UTable = _sfc_main$2;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(itemStore).loading,
        "search-placeholder": "Search items..."
      }, _attrs), {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<label class="flex items-center gap-2 cursor-pointer select-none"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_USwitch, {
              modelValue: unref(showOutOfStock),
              "onUpdate:modelValue": ($event) => isRef(showOutOfStock) ? showOutOfStock.value = $event : null
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-xs text-parchment/60"${_scopeId}> Show out-of-stock `);
            if (unref(outOfStockCount) > 0) {
              _push2(`<span class="text-red-400/70"${_scopeId}>(${ssrInterpolate(unref(outOfStockCount))})</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</span></label>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus-circle",
              size: "xl",
              onClick: newItem,
              variant: "ghost"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Add Item `);
                } else {
                  return [
                    createTextVNode(" Add Item ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("label", { class: "flex items-center gap-2 cursor-pointer select-none" }, [
                createVNode(_component_USwitch, {
                  modelValue: unref(showOutOfStock),
                  "onUpdate:modelValue": ($event) => isRef(showOutOfStock) ? showOutOfStock.value = $event : null
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode("span", { class: "text-xs text-parchment/60" }, [
                  createTextVNode(" Show out-of-stock "),
                  unref(outOfStockCount) > 0 ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-red-400/70"
                  }, "(" + toDisplayString(unref(outOfStockCount)) + ")", 1)) : createCommentVNode("", true)
                ])
              ]),
              createVNode(_component_UButton, {
                icon: "i-lucide-plus-circle",
                size: "xl",
                onClick: newItem,
                variant: "ghost"
              }, {
                default: withCtx(() => [
                  createTextVNode(" Add Item ")
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
              data: unref(categoryItems),
              columns,
              loading: unref(itemStore).loading,
              onSelect: (_e, row) => unref(router).push(`/admin/items/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-package",
                    title: "No items found",
                    description: "Add items to this category to track inventory",
                    "action-label": "Add Item",
                    onAction: newItem
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-package",
                      title: "No items found",
                      description: "Add items to this category to track inventory",
                      "action-label": "Add Item",
                      onAction: newItem
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(categoryItems).filter((i) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return i.name.toLowerCase().includes(term) || (i.type || "").toLowerCase().includes(term);
            }), (item) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(item.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(item.type || "No type")}</div></div>`);
              _push2(ssrRenderComponent(unref(UBadge), {
                color: unref(getStockStatusColor)(unref(getStockStatus)(getLatestQuantity(item._id), item.reorderPoint || 0)),
                variant: "subtle",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(getStockStatus)(getLatestQuantity(item._id), item.reorderPoint || 0))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(getStockStatus)(getLatestQuantity(item._id), item.reorderPoint || 0)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div><div class="grid grid-cols-2 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Stock</span><div class="text-parchment font-semibold"${_scopeId}>${ssrInterpolate(("formatWithUnits" in _ctx ? _ctx.formatWithUnits : unref(formatWithUnits))(getLatestQuantity(item._id), item))}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Use/Month</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(item.usePerMonth ? `${item.usePerMonth} ${item.inventoryUnit || ""}` : "--")}</div></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(categoryItems).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-package",
                title: "No items in this category",
                description: "Add items to this category to track inventory",
                "action-label": "Add Item",
                onAction: newItem
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
                  data: unref(categoryItems),
                  columns,
                  loading: unref(itemStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/items/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-package",
                      title: "No items found",
                      description: "Add items to this category to track inventory",
                      "action-label": "Add Item",
                      onAction: newItem
                    })
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(categoryItems).filter((i) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return i.name.toLowerCase().includes(term) || (i.type || "").toLowerCase().includes(term);
                }), (item) => {
                  return openBlock(), createBlock("div", {
                    key: item._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => unref(router).push(`/admin/items/${item._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(item.name), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(item.type || "No type"), 1)
                      ]),
                      createVNode(unref(UBadge), {
                        color: unref(getStockStatusColor)(unref(getStockStatus)(getLatestQuantity(item._id), item.reorderPoint || 0)),
                        variant: "subtle",
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(unref(getStockStatus)(getLatestQuantity(item._id), item.reorderPoint || 0)), 1)
                        ]),
                        _: 2
                      }, 1032, ["color"])
                    ]),
                    createVNode("div", { class: "grid grid-cols-2 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Stock"),
                        createVNode("div", { class: "text-parchment font-semibold" }, toDisplayString(("formatWithUnits" in _ctx ? _ctx.formatWithUnits : unref(formatWithUnits))(getLatestQuantity(item._id), item)), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Use/Month"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(item.usePerMonth ? `${item.usePerMonth} ${item.inventoryUnit || ""}` : "--"), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(categoryItems).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-package",
                  title: "No items in this category",
                  description: "Add items to this category to track inventory",
                  "action-label": "Add Item",
                  onAction: newItem
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
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableInventoryCategory.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main, { __name: "TableInventoryCategory" });

export { __nuxt_component_2 as _ };
//# sourceMappingURL=TableInventoryCategory-Cmu7yJqc.mjs.map

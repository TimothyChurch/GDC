import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, h as useRouter, g as useOverlay } from './server.mjs';
import { _ as __nuxt_component_4 } from './TableWrapper-DhLG7m1v.mjs';
import { _ as _sfc_main$2 } from './Table-HT3K8pYo.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, withCtx, unref, createTextVNode, createVNode, computed, mergeProps, isRef, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useItemCategories } from './useItemCategories-BhScY4G-.mjs';
import { u as useTableState, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelItem } from './PanelItem-B6mZ28UD.mjs';
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
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TableItems",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const router = useRouter();
    const itemStore = useItemStore();
    const { confirm } = useDeleteConfirm();
    const dynamicCategories = useItemCategories();
    const categories = computed(() => ["All", ...dynamicCategories.value]);
    const selectedCategory = ref("All");
    const filteredItems = computed(() => {
      if (selectedCategory.value === "All") return itemStore.items;
      return itemStore.items.filter(
        (i) => (i.category || "Other") === selectedCategory.value
      );
    });
    const categoryCounts = computed(() => {
      const counts = { All: itemStore.items.length };
      for (const cat of dynamicCategories.value) {
        counts[cat] = itemStore.items.filter(
          (i) => (i.category || "Other") === cat
        ).length;
      }
      return counts;
    });
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => filteredItems.value.length)
    );
    const selectCategory = (cat) => {
      selectedCategory.value = cat;
      pagination.value = { ...pagination.value, pageIndex: 0 };
    };
    const columns = [
      sortableColumn("name", "Name"),
      sortableColumn("type", "Type"),
      sortableColumn("category", "Category"),
      sortableColumn("vendor", "Vendor", {
        id: "vendor",
        accessorFn: (row) => itemStore.getVendorName(row._id) || "",
        cell: ({ row }) => {
          return itemStore.getVendorName(row.original._id) || "—";
        }
      }),
      sortableColumn("inventoryUnit", "Inventory Units"),
      sortableColumn("pricePerUnit", "Price per Unit", {
        id: "pricePerUnit",
        accessorFn: (row) => itemStore.latestPrice(row._id),
        cell: ({ row }) => {
          const price = itemStore.latestPrice(row.original._id);
          if (price > 0) {
            return Dollar.format(price) + " / " + (row.original.inventoryUnit || "");
          }
          return "Price not set";
        }
      }),
      actionsColumn((row) => [
        {
          label: "View Details",
          onSelect() {
            router.push(`/admin/items/${row.original._id}`);
          }
        },
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
      openModal();
    };
    const openModal = async () => await modal.open();
    __expose({ newItem });
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
        loading: unref(itemStore).loading,
        "search-placeholder": "Search items..."
      }, _attrs), {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-hide"${_scopeId}><!--[-->`);
            ssrRenderList(unref(categories), (cat) => {
              _push2(ssrRenderComponent(_component_UButton, {
                key: cat,
                variant: "ghost",
                size: "xs",
                class: [
                  "rounded-full border whitespace-nowrap",
                  unref(selectedCategory) === cat ? "bg-gold/15 text-gold border-gold/20" : "text-parchment/50 border-brown/20 hover:text-parchment/70 hover:border-brown/30"
                ],
                onClick: ($event) => selectCategory(cat)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(cat)} <span class="${ssrRenderClass([
                      unref(selectedCategory) === cat ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60",
                      "px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                    ])}"${_scopeId2}>${ssrInterpolate(unref(categoryCounts)[cat] || 0)}</span>`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(cat) + " ", 1),
                      createVNode("span", {
                        class: [
                          "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                          unref(selectedCategory) === cat ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60"
                        ]
                      }, toDisplayString(unref(categoryCounts)[cat] || 0), 3)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-hide" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(categories), (cat) => {
                  return openBlock(), createBlock(_component_UButton, {
                    key: cat,
                    variant: "ghost",
                    size: "xs",
                    class: [
                      "rounded-full border whitespace-nowrap",
                      unref(selectedCategory) === cat ? "bg-gold/15 text-gold border-gold/20" : "text-parchment/50 border-brown/20 hover:text-parchment/70 hover:border-brown/30"
                    ],
                    onClick: ($event) => selectCategory(cat)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(cat) + " ", 1),
                      createVNode("span", {
                        class: [
                          "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                          unref(selectedCategory) === cat ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60"
                        ]
                      }, toDisplayString(unref(categoryCounts)[cat] || 0), 3)
                    ]),
                    _: 2
                  }, 1032, ["class", "onClick"]);
                }), 128))
              ])
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
              data: unref(filteredItems),
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
                    description: "Add inventory items to track stock and costs",
                    "action-label": "Add Item",
                    onAction: newItem
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-package",
                      title: "No items found",
                      description: "Add inventory items to track stock and costs",
                      "action-label": "Add Item",
                      onAction: newItem
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(filteredItems).filter((i) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return i.name.toLowerCase().includes(term) || (i.type || "").toLowerCase().includes(term) || (i.category || "").toLowerCase().includes(term);
            }), (item) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(item.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(item.type || "No type")}</div></div><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brown/15 text-parchment/50 border border-brown/25"${_scopeId}>${ssrInterpolate(item.inventoryUnit || "N/A")}</span></div><div class="grid grid-cols-2 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Price</span><div class="text-copper font-semibold"${_scopeId}>${ssrInterpolate(unref(itemStore).latestPrice(item._id) > 0 ? `${("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(itemStore).latestPrice(item._id))} / ${item.inventoryUnit}` : "Not set")}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Vendor</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(unref(itemStore).getVendorName(item._id) || "—")}</div></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(filteredItems).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-package",
                title: "No items found",
                description: "Add inventory items to track stock and costs",
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
                  data: unref(filteredItems),
                  columns,
                  loading: unref(itemStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/items/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-package",
                      title: "No items found",
                      description: "Add inventory items to track stock and costs",
                      "action-label": "Add Item",
                      onAction: newItem
                    })
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredItems).filter((i) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return i.name.toLowerCase().includes(term) || (i.type || "").toLowerCase().includes(term) || (i.category || "").toLowerCase().includes(term);
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
                      createVNode("span", { class: "px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brown/15 text-parchment/50 border border-brown/25" }, toDisplayString(item.inventoryUnit || "N/A"), 1)
                    ]),
                    createVNode("div", { class: "grid grid-cols-2 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Price"),
                        createVNode("div", { class: "text-copper font-semibold" }, toDisplayString(unref(itemStore).latestPrice(item._id) > 0 ? `${("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(itemStore).latestPrice(item._id))} / ${item.inventoryUnit}` : "Not set"), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Vendor"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(unref(itemStore).getVendorName(item._id) || "—"), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(filteredItems).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-package",
                  title: "No items found",
                  description: "Add inventory items to track stock and costs",
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableItems.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "TableItems" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const tableRef = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableItems = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Items",
        subtitle: "Raw materials, ingredients, and supplies",
        icon: "i-lucide-package"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: ($event) => unref(tableRef)?.newItem()
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Item`);
                } else {
                  return [
                    createTextVNode("Add Item")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-plus",
                onClick: ($event) => unref(tableRef)?.newItem()
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Item")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TableItems, {
        ref_key: "tableRef",
        ref: tableRef
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/items/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BjyJnGRF.mjs.map

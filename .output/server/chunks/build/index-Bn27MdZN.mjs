import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, f as _sfc_main$e, h as useRouter, g as useOverlay } from './server.mjs';
import { _ as _sfc_main$4 } from './Select-xxK8NqZT.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, computed, withCtx, unref, createVNode, createTextVNode, isRef, mergeProps, h, toRaw, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useBottleStock, L as LazyPanelBottle } from './PanelBottle-DYwBERoj.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { _ as __nuxt_component_4$1 } from './TableWrapper-DhLG7m1v.mjs';
import { _ as _sfc_main$5 } from './Table-HT3K8pYo.mjs';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
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
import './useInventoryStore-BPtbZ8hY.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './Input-Fd8Vd_4J.mjs';
import './FormField-DcXe0kwN.mjs';
import '@tanstack/vue-virtual';

const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "BottleCard",
  __ssrInlineRender: true,
  props: {
    bottle: {}
  },
  setup(__props) {
    const props = __props;
    useRouter();
    const { isLowStock } = useBottleStock();
    const classIcon = computed(() => {
      const cls = props.bottle.class?.toLowerCase() || "";
      if (cls.includes("whisky") || cls.includes("whiskey") || cls.includes("bourbon")) return "i-lucide-glass-water";
      if (cls.includes("gin")) return "i-lucide-flower-2";
      if (cls.includes("rum")) return "i-lucide-waves";
      if (cls.includes("vodka")) return "i-lucide-droplets";
      if (cls.includes("brandy")) return "i-lucide-grape";
      if (cls.includes("liqueur") || cls.includes("cordial")) return "i-lucide-candy";
      return "i-lucide-wine";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-charcoal rounded-xl border border-brown/30 p-4 hover:border-brown/50 transition-colors cursor-pointer" }, _attrs))}><div class="flex items-start justify-between mb-3"><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: unref(classIcon),
        class: "text-lg text-copper"
      }, null, _parent));
      _push(`<div><div class="text-sm font-medium text-parchment">${ssrInterpolate(__props.bottle.name)}</div><div class="text-xs text-parchment/60">${ssrInterpolate(__props.bottle.class)} ${ssrInterpolate(__props.bottle.type ? `/ ${__props.bottle.type}` : "")}</div></div></div></div><div class="flex items-center gap-2 mb-2">`);
      if (__props.bottle.abv) {
        _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/15 text-blue-400 border-blue-500/25">${ssrInterpolate(__props.bottle.abv)}% ABV </span>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.bottle.price) {
        _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/20 text-parchment/60 border-brown/30">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.bottle.price))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center justify-end gap-1.5">`);
      if (__props.bottle.archived) {
        _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25"> Archived </span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(isLowStock)(__props.bottle._id)) {
        _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-orange-500/15 text-orange-400 border-orange-500/25"> Low Stock </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="${ssrRenderClass([__props.bottle.inStock !== false ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25", "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}">${ssrInterpolate(__props.bottle.inStock !== false ? "In Stock" : "Out of Stock")}</span></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Bottle/BottleCard.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$3, { __name: "BottleCard" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BottleCardGrid",
  __ssrInlineRender: true,
  props: {
    bottles: {}
  },
  setup(__props) {
    const props = __props;
    const bottleStore = useBottleStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_BottleCard = __nuxt_component_2;
      if (unref(bottleStore).loading) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "text-2xl text-parchment/50 animate-spin mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">Loading bottles...</p></div>`);
      } else if (props.bottles.length === 0) {
        _push(ssrRenderComponent(_component_BaseEmptyState, mergeProps({
          icon: "i-lucide-wine",
          title: "No bottles match the current filters",
          description: "Try adjusting your search or filters"
        }, _attrs), null, _parent));
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" }, _attrs))}><!--[-->`);
        ssrRenderList(props.bottles, (bottle) => {
          _push(ssrRenderComponent(_component_BottleCard, {
            key: bottle._id,
            bottle
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Bottle/BottleCardGrid.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$2, { __name: "BottleCardGrid" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TableBottles",
  __ssrInlineRender: true,
  props: {
    bottles: {}
  },
  setup(__props) {
    const props = __props;
    const router = useRouter();
    const bottleStore = useBottleStore();
    const { confirm } = useDeleteConfirm();
    const { isLowStock } = useBottleStock();
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => props.bottles.length)
    );
    const columns = [
      sortableColumn("name", "Name"),
      sortableColumn("classType", "Class / Type", {
        id: "classType",
        accessorFn: (row) => `${row.class || ""} ${row.type || ""}`.trim(),
        cell: ({ row }) => {
          const c = row.original.class || "";
          const t = row.original.type || "";
          return t ? `${c} - ${t}` : c || "N/A";
        }
      }),
      sortableColumn("abv", "ABV", {
        cell: ({ row }) => row.original.abv ? `${row.original.abv}%` : "N/A"
      }),
      sortableColumn("price", "Price", {
        cell: ({ row }) => Dollar.format(row.original.price || 0)
      }),
      sortableColumn("inStock", "Status", {
        cell: ({ row }) => {
          const badges = [];
          if (row.original.archived) {
            badges.push(
              h("span", {
                class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
                innerHTML: "Archived"
              })
            );
          }
          if (isLowStock(row.original._id)) {
            badges.push(
              h("span", {
                class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-orange-500/15 text-orange-400 border-orange-500/25",
                innerHTML: "Low Stock"
              })
            );
          }
          badges.push(
            h("span", {
              class: [
                "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                row.original.inStock ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"
              ],
              innerHTML: row.original.inStock ? "Yes" : "No"
            })
          );
          return h("div", { class: "flex items-center gap-1.5" }, badges);
        }
      }),
      actionsColumn((row) => [
        {
          label: "View Details",
          onSelect() {
            router.push(`/admin/bottles/${row.original._id}`);
          }
        },
        {
          label: "Edit bottle",
          onSelect() {
            bottleStore.bottle = structuredClone(toRaw(row.original));
            openPanel();
          }
        },
        {
          label: "Delete bottle",
          variant: "danger",
          async onClick() {
            const confirmed = await confirm("Bottle", row.original.name);
            if (confirmed) {
              bottleStore.deleteBottle(row.original._id);
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelBottle);
    const openPanel = async () => await panel.open();
    const newBottle = () => {
      bottleStore.resetBottle();
      openPanel();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4$1;
      const _component_UButton = _sfc_main$8;
      const _component_UTable = _sfc_main$5;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(bottleStore).loading,
        "search-placeholder": "Search bottles..."
      }, _attrs), {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus-circle",
              size: "xl",
              onClick: newBottle,
              variant: "ghost"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Bottle`);
                } else {
                  return [
                    createTextVNode("Add Bottle")
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
                onClick: newBottle,
                variant: "ghost"
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Bottle")
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
              data: props.bottles,
              columns,
              loading: unref(bottleStore).loading,
              onSelect: (_e, row) => unref(router).push(`/admin/bottles/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-wine",
                    title: "No bottles match the current filters",
                    description: "Try adjusting your search or filters"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-wine",
                      title: "No bottles match the current filters",
                      description: "Try adjusting your search or filters"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(props.bottles.filter((b) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return b.name.toLowerCase().includes(term) || (b.class || "").toLowerCase().includes(term) || (b.type || "").toLowerCase().includes(term);
            }), (bottle) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(bottle.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(bottle.class)}${ssrInterpolate(bottle.type ? ` - ${bottle.type}` : "")}</div></div><div class="flex items-center gap-1.5"${_scopeId}>`);
              if (bottle.archived) {
                _push2(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25"${_scopeId}> Archived </span>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(isLowStock)(bottle._id)) {
                _push2(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-orange-500/15 text-orange-400 border-orange-500/25"${_scopeId}> Low Stock </span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<span class="${ssrRenderClass([bottle.inStock ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25", "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}"${_scopeId}>${ssrInterpolate(bottle.inStock ? "In Stock" : "Out of Stock")}</span></div></div><div class="grid grid-cols-2 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Price</span><div class="text-copper font-semibold"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(bottle.price || 0))}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>ABV</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(bottle.abv ? `${bottle.abv}%` : "N/A")}</div></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (props.bottles.length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-wine",
                title: "No bottles match the current filters",
                description: "Try adjusting your search or filters"
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
                  data: props.bottles,
                  columns,
                  loading: unref(bottleStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/bottles/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-wine",
                      title: "No bottles match the current filters",
                      description: "Try adjusting your search or filters"
                    })
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(props.bottles.filter((b) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return b.name.toLowerCase().includes(term) || (b.class || "").toLowerCase().includes(term) || (b.type || "").toLowerCase().includes(term);
                }), (bottle) => {
                  return openBlock(), createBlock("div", {
                    key: bottle._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => unref(router).push(`/admin/bottles/${bottle._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(bottle.name), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(bottle.class) + toDisplayString(bottle.type ? ` - ${bottle.type}` : ""), 1)
                      ]),
                      createVNode("div", { class: "flex items-center gap-1.5" }, [
                        bottle.archived ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
                        }, " Archived ")) : createCommentVNode("", true),
                        unref(isLowStock)(bottle._id) ? (openBlock(), createBlock("span", {
                          key: 1,
                          class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-orange-500/15 text-orange-400 border-orange-500/25"
                        }, " Low Stock ")) : createCommentVNode("", true),
                        createVNode("span", {
                          class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", bottle.inStock ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"]
                        }, toDisplayString(bottle.inStock ? "In Stock" : "Out of Stock"), 3)
                      ])
                    ]),
                    createVNode("div", { class: "grid grid-cols-2 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Price"),
                        createVNode("div", { class: "text-copper font-semibold" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(bottle.price || 0)), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "ABV"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(bottle.abv ? `${bottle.abv}%` : "N/A"), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                props.bottles.length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-wine",
                  title: "No bottles match the current filters",
                  description: "Try adjusting your search or filters"
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableBottles.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$1, { __name: "TableBottles" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const bottleStore = useBottleStore();
    const { isLowStock } = useBottleStock();
    const viewMode = ref("grid");
    const statusFilter = ref("active");
    const stockFilter = ref("all");
    const stockOptions = [
      { label: "All", value: "all" },
      { label: "In Stock", value: "in-stock" },
      { label: "Low Stock", value: "low-stock" },
      { label: "Out of Stock", value: "out-of-stock" }
    ];
    const filteredBottles = computed(() => {
      return bottleStore.bottles.filter((b) => {
        if (statusFilter.value === "active" && b.archived) return false;
        if (statusFilter.value === "archived" && !b.archived) return false;
        if (stockFilter.value === "in-stock") return b.inStock !== false && !isLowStock(b._id);
        if (stockFilter.value === "low-stock") return isLowStock(b._id);
        if (stockFilter.value === "out-of-stock") return b.inStock === false;
        return true;
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_USelect = _sfc_main$4;
      const _component_BottleCardGrid = __nuxt_component_3;
      const _component_TableBottles = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Bottles",
        subtitle: "Manage bottle products and inventory",
        icon: "i-lucide-wine"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-1 bg-brown/15 rounded-lg p-0.5 border border-brown/20"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-layout-grid",
              size: "xs",
              variant: unref(viewMode) === "grid" ? "solid" : "ghost",
              color: unref(viewMode) === "grid" ? "primary" : "neutral",
              onClick: ($event) => viewMode.value = "grid",
              "aria-label": "Grid view"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-list",
              size: "xs",
              variant: unref(viewMode) === "table" ? "solid" : "ghost",
              color: unref(viewMode) === "table" ? "primary" : "neutral",
              onClick: ($event) => viewMode.value = "table",
              "aria-label": "Table view"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-1 bg-brown/15 rounded-lg p-0.5 border border-brown/20" }, [
                createVNode(_component_UButton, {
                  icon: "i-lucide-layout-grid",
                  size: "xs",
                  variant: unref(viewMode) === "grid" ? "solid" : "ghost",
                  color: unref(viewMode) === "grid" ? "primary" : "neutral",
                  onClick: ($event) => viewMode.value = "grid",
                  "aria-label": "Grid view"
                }, null, 8, ["variant", "color", "onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-list",
                  size: "xs",
                  variant: unref(viewMode) === "table" ? "solid" : "ghost",
                  color: unref(viewMode) === "table" ? "primary" : "neutral",
                  onClick: ($event) => viewMode.value = "table",
                  "aria-label": "Table view"
                }, null, 8, ["variant", "color", "onClick"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex flex-wrap items-center gap-3 mb-4"><div class="flex items-center gap-1 bg-brown/15 rounded-lg p-0.5 border border-brown/20">`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "xs",
        variant: unref(statusFilter) === "active" ? "solid" : "ghost",
        color: unref(statusFilter) === "active" ? "primary" : "neutral",
        onClick: ($event) => statusFilter.value = "active"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Active `);
          } else {
            return [
              createTextVNode(" Active ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        size: "xs",
        variant: unref(statusFilter) === "archived" ? "solid" : "ghost",
        color: unref(statusFilter) === "archived" ? "primary" : "neutral",
        onClick: ($event) => statusFilter.value = "archived"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Archived `);
          } else {
            return [
              createTextVNode(" Archived ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_USelect, {
        modelValue: unref(stockFilter),
        "onUpdate:modelValue": ($event) => isRef(stockFilter) ? stockFilter.value = $event : null,
        items: stockOptions,
        size: "xs",
        class: "w-36"
      }, null, _parent));
      _push(`</div>`);
      if (unref(viewMode) === "grid") {
        _push(ssrRenderComponent(_component_BottleCardGrid, { bottles: unref(filteredBottles) }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_TableBottles, { bottles: unref(filteredBottles) }, null, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/bottles/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bn27MdZN.mjs.map

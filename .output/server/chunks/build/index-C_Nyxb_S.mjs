import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, f as _sfc_main$e, n as navigateTo, g as useOverlay, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as _sfc_main$5 } from './Input-Fd8Vd_4J.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, computed, withCtx, unref, createVNode, createTextVNode, toDisplayString, isRef, createSlots, mergeProps, openBlock, createBlock, Fragment, renderList, createCommentVNode, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useCocktailStore, a as useIngredientResolver } from './useCocktailStore-CByyovs8.mjs';
import { _ as __nuxt_component_4$2 } from './TableWrapper-DhLG7m1v.mjs';
import { _ as _sfc_main$6 } from './Table-HT3K8pYo.mjs';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, e as expandColumn, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelCocktail } from './PanelCocktail-6ckGDRJ_.mjs';
import { u as useCocktailOptions } from './useCocktailOptions-VOIIdi_i.mjs';
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
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';
import './useBottleStore-NPRWrMTA.mjs';
import './FormField-DcXe0kwN.mjs';
import './Select-xxK8NqZT.mjs';
import '@tanstack/vue-virtual';

const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "CocktailCard",
  __ssrInlineRender: true,
  props: {
    cocktail: {}
  },
  setup(__props) {
    const props = __props;
    const cocktailStore = useCocktailStore();
    const cost = computed(() => cocktailStore.cocktailCost(props.cocktail));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UButton = _sfc_main$8;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: `/admin/cocktails/${__props.cocktail._id}`,
        class: "block bg-charcoal rounded-xl border border-brown/30 p-4 hover:border-brown/50 transition-colors cursor-pointer"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-start justify-between mb-3"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(__props.cocktail.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(__props.cocktail.glassware)}</div></div>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: __props.cocktail.visible ? "i-lucide-eye" : "i-lucide-eye-off",
              size: "xs",
              variant: "ghost",
              color: __props.cocktail.visible ? "neutral" : "error",
              onClick: ($event) => unref(cocktailStore).toggleVisibility(__props.cocktail._id),
              "aria-label": __props.cocktail.visible ? "Hide cocktail" : "Show cocktail"
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="flex items-center gap-2 mb-2"${_scopeId}><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/20 text-parchment/60 border-brown/30"${_scopeId}> Cost: ${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cost)))}</span>`);
            if (__props.cocktail.price) {
              _push2(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/20 text-parchment/60 border-brown/30"${_scopeId}> Price: ${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.cocktail.price))}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (__props.cocktail.menu) {
              _push2(`<div class="text-xs text-parchment/60 mb-2"${_scopeId}> Menu: ${ssrInterpolate(__props.cocktail.menu)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="text-right"${_scopeId}><span class="${ssrRenderClass([__props.cocktail.visible ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25", "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}"${_scopeId}>${ssrInterpolate(__props.cocktail.visible ? "On Menu" : "Hidden")}</span></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-start justify-between mb-3" }, [
                createVNode("div", null, [
                  createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(__props.cocktail.name), 1),
                  createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(__props.cocktail.glassware), 1)
                ]),
                createVNode(_component_UButton, {
                  icon: __props.cocktail.visible ? "i-lucide-eye" : "i-lucide-eye-off",
                  size: "xs",
                  variant: "ghost",
                  color: __props.cocktail.visible ? "neutral" : "error",
                  onClick: withModifiers(($event) => unref(cocktailStore).toggleVisibility(__props.cocktail._id), ["stop", "prevent"]),
                  "aria-label": __props.cocktail.visible ? "Hide cocktail" : "Show cocktail"
                }, null, 8, ["icon", "color", "onClick", "aria-label"])
              ]),
              createVNode("div", { class: "flex items-center gap-2 mb-2" }, [
                createVNode("span", { class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/20 text-parchment/60 border-brown/30" }, " Cost: " + toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cost))), 1),
                __props.cocktail.price ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-brown/20 text-parchment/60 border-brown/30"
                }, " Price: " + toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(__props.cocktail.price)), 1)) : createCommentVNode("", true)
              ]),
              __props.cocktail.menu ? (openBlock(), createBlock("div", {
                key: 0,
                class: "text-xs text-parchment/60 mb-2"
              }, " Menu: " + toDisplayString(__props.cocktail.menu), 1)) : createCommentVNode("", true),
              createVNode("div", { class: "text-right" }, [
                createVNode("span", {
                  class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", __props.cocktail.visible ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"]
                }, toDisplayString(__props.cocktail.visible ? "On Menu" : "Hidden"), 3)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Cocktail/CocktailCard.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$4, { __name: "CocktailCard" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "CocktailCardGrid",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    const cocktailStore = useCocktailStore();
    const cocktails = computed(() => props.data ?? cocktailStore.cocktails);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_CocktailCard = __nuxt_component_2;
      if (unref(cocktailStore).loading) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "text-2xl text-parchment/50 animate-spin mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">Loading cocktails...</p></div>`);
      } else if (unref(cocktails).length === 0) {
        _push(ssrRenderComponent(_component_BaseEmptyState, mergeProps({
          icon: "i-lucide-martini",
          title: "No cocktails found",
          description: "Add cocktails to build your menu"
        }, _attrs), null, _parent));
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" }, _attrs))}><!--[-->`);
        ssrRenderList(unref(cocktails), (cocktail) => {
          _push(ssrRenderComponent(_component_CocktailCard, {
            key: cocktail._id,
            cocktail
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Cocktail/CocktailCardGrid.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$3, { __name: "CocktailCardGrid" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "TableCocktailExpand",
  __ssrInlineRender: true,
  props: ["ingredients"],
  setup(__props) {
    const props = __props;
    const { getIngredientName, getIngredientCostPerUnit } = useIngredientResolver();
    const columns = [
      {
        accessorKey: "item",
        header: "Ingredient",
        cell: ({ row }) => {
          const name = getIngredientName(row.original);
          const tag = row.original.sourceType === "bottle" ? " (Bottle)" : "";
          return name + tag;
        }
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => row.original.amount + " " + row.original.unit
      },
      {
        header: "Cost Per Unit",
        cell: ({ row }) => Dollar.format(getIngredientCostPerUnit(row.original))
      },
      {
        header: "Total Cost",
        cell: ({ row }) => Dollar.format(getIngredientCostPerUnit(row.original) * row.original.amount)
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UTable = _sfc_main$6;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_UTable, {
        data: props.ingredients,
        columns
      }, {
        empty: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_BaseEmptyState, {
              icon: "i-lucide-list",
              title: "No ingredients"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_BaseEmptyState, {
                icon: "i-lucide-list",
                title: "No ingredients"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableCocktailExpand.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_4$1 = Object.assign(_sfc_main$2, { __name: "TableCocktailExpand" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TableCocktails",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    const cocktailStore = useCocktailStore();
    const { confirm } = useDeleteConfirm();
    const cocktails = computed(() => props.data ?? cocktailStore.cocktails);
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => cocktails.value.length)
    );
    const columns = [
      expandColumn(),
      sortableColumn("name", "Name"),
      sortableColumn("glassware", "Glassware"),
      sortableColumn("cost", "Cost", {
        id: "cost",
        accessorFn: (row) => cocktailStore.cocktailCost(row._id.toString()),
        cell: ({ row }) => Dollar.format(cocktailStore.cocktailCost(row.original._id.toString()))
      }),
      {
        header: "Approx Price",
        cell: ({ row }) => Dollar.format(
          (cocktailStore.cocktailCost(row.original._id.toString()) - 1.5) / 2.5 * 4 + 7
        )
      },
      sortableColumn("price", "Price", {
        cell: ({ row }) => Dollar.format(row.original.price)
      }),
      sortableColumn("visible", "Visible", {
        cell: ({ row }) => row.original.visible ? "Yes" : "No"
      }),
      actionsColumn((row) => [
        {
          label: "View Details",
          onSelect() {
            navigateTo(`/admin/cocktails/${row.original._id}`);
          }
        },
        {
          label: "Edit cocktail",
          onSelect() {
            cocktailStore.setCocktail(row.original._id.toString());
            openModal();
          }
        },
        {
          label: "Delete cocktail",
          variant: "danger",
          async onClick() {
            const confirmed = await confirm("Cocktail", row.original.name);
            if (confirmed) {
              cocktailStore.deleteCocktail(row.original._id.toString());
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const modal = overlay.create(LazyPanelCocktail);
    const newCocktail = () => {
      cocktailStore.resetCocktail();
      openModal();
    };
    const openModal = async () => await modal.open();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4$2;
      const _component_UButton = _sfc_main$8;
      const _component_UTable = _sfc_main$6;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_TableCocktailExpand = __nuxt_component_4$1;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(cocktailStore).loading,
        "search-placeholder": "Search cocktails..."
      }, _attrs), {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus-circle",
              size: "xl",
              onClick: newCocktail,
              variant: "ghost"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Cocktail`);
                } else {
                  return [
                    createTextVNode("Add Cocktail")
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
                onClick: newCocktail,
                variant: "ghost"
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Cocktail")
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
              sticky: "",
              "global-filter": unref(search),
              "onUpdate:globalFilter": ($event) => isRef(search) ? search.value = $event : null,
              pagination: unref(pagination),
              "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
              "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
              data: unref(cocktails),
              columns,
              loading: unref(cocktailStore).loading,
              class: "max-h-full",
              onSelect: (_e, row) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/admin/cocktails/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-martini",
                    title: "No cocktails found",
                    description: "Add cocktails to build your menu",
                    "action-label": "Add Cocktail",
                    onAction: newCocktail
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-martini",
                      title: "No cocktails found",
                      description: "Add cocktails to build your menu",
                      "action-label": "Add Cocktail",
                      onAction: newCocktail
                    })
                  ];
                }
              }),
              expanded: withCtx(({ row }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_TableCocktailExpand, {
                    ingredients: row.original.ingredients
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_TableCocktailExpand, {
                      ingredients: row.original.ingredients
                    }, null, 8, ["ingredients"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(cocktails).filter((c) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return c.name.toLowerCase().includes(term) || (c.glassware || "").toLowerCase().includes(term);
            }), (cocktail) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(cocktail.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(cocktail.glassware || "No glassware")}</div></div><span class="${ssrRenderClass([cocktail.visible ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25", "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}"${_scopeId}>${ssrInterpolate(cocktail.visible ? "Visible" : "Hidden")}</span></div><div class="grid grid-cols-3 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Cost</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cocktailStore).cocktailCost(cocktail._id.toString())))}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Price</span><div class="text-copper font-semibold"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(cocktail.price || 0))}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Ingredients</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(cocktail.ingredients?.length || 0)}</div></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(cocktails).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-martini",
                title: "No cocktails found",
                description: "Add cocktails to build your menu",
                "action-label": "Add Cocktail",
                onAction: newCocktail
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
                  sticky: "",
                  "global-filter": unref(search),
                  "onUpdate:globalFilter": ($event) => isRef(search) ? search.value = $event : null,
                  pagination: unref(pagination),
                  "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
                  "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
                  data: unref(cocktails),
                  columns,
                  loading: unref(cocktailStore).loading,
                  class: "max-h-full",
                  onSelect: (_e, row) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/admin/cocktails/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-martini",
                      title: "No cocktails found",
                      description: "Add cocktails to build your menu",
                      "action-label": "Add Cocktail",
                      onAction: newCocktail
                    })
                  ]),
                  expanded: withCtx(({ row }) => [
                    createVNode(_component_TableCocktailExpand, {
                      ingredients: row.original.ingredients
                    }, null, 8, ["ingredients"])
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(cocktails).filter((c) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return c.name.toLowerCase().includes(term) || (c.glassware || "").toLowerCase().includes(term);
                }), (cocktail) => {
                  return openBlock(), createBlock("div", {
                    key: cocktail._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/admin/cocktails/${cocktail._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(cocktail.name), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(cocktail.glassware || "No glassware"), 1)
                      ]),
                      createVNode("span", {
                        class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", cocktail.visible ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-red-500/15 text-red-400 border-red-500/25"]
                      }, toDisplayString(cocktail.visible ? "Visible" : "Hidden"), 3)
                    ]),
                    createVNode("div", { class: "grid grid-cols-3 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Cost"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(cocktailStore).cocktailCost(cocktail._id.toString()))), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Price"),
                        createVNode("div", { class: "text-copper font-semibold" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(cocktail.price || 0)), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Ingredients"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(cocktail.ingredients?.length || 0), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(cocktails).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-martini",
                  title: "No cocktails found",
                  description: "Add cocktails to build your menu",
                  "action-label": "Add Cocktail",
                  onAction: newCocktail
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableCocktails.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$1, { __name: "TableCocktails" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const cocktailStore = useCocktailStore();
    const { menuOptions } = useCocktailOptions();
    const viewMode = ref("grid");
    const selectedMenu = ref("All");
    const searchQuery = ref("");
    const visibilityFilter = ref("all");
    const capitalize = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
    const MENU_TABS = computed(() => [
      "All",
      ...menuOptions.value.map((m) => capitalize(m))
    ]);
    const menuTabs = computed(() => {
      const counts = { All: cocktailStore.cocktails.length };
      for (const menu of menuOptions.value) {
        const label = capitalize(menu);
        if (menu === "off menu") {
          counts[label] = cocktailStore.cocktails.filter((c) => !c.visible).length;
        } else {
          counts[label] = cocktailStore.cocktails.filter((c) => c.menu === menu).length;
        }
      }
      return MENU_TABS.value.map((name) => ({ name, count: counts[name] || 0 }));
    });
    const filteredCocktails = computed(() => {
      let result = cocktailStore.cocktails;
      if (selectedMenu.value === capitalize("off menu")) {
        result = result.filter((c) => !c.visible);
      } else if (selectedMenu.value !== "All") {
        const menuKey = selectedMenu.value.toLowerCase();
        result = result.filter((c) => c.menu === menuKey);
      }
      if (visibilityFilter.value === "visible") {
        result = result.filter((c) => c.visible);
      } else if (visibilityFilter.value === "hidden") {
        result = result.filter((c) => !c.visible);
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(
          (c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
        );
      }
      return result;
    });
    const activeFilterCount = computed(() => {
      let count = 0;
      if (searchQuery.value) count++;
      if (visibilityFilter.value !== "all") count++;
      return count;
    });
    const clearFilters = () => {
      searchQuery.value = "";
      visibilityFilter.value = "all";
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_UInput = _sfc_main$5;
      const _component_CocktailCardGrid = __nuxt_component_3;
      const _component_TableCocktails = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Cocktails",
        subtitle: "Manage cocktail menu and recipes",
        icon: "i-lucide-martini"
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
      _push(`<div class="flex gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-hide"><!--[-->`);
      ssrRenderList(unref(menuTabs), (tab) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: tab.name,
          size: "xs",
          variant: unref(selectedMenu) === tab.name ? "soft" : "ghost",
          color: unref(selectedMenu) === tab.name ? "primary" : "neutral",
          class: ["rounded-full whitespace-nowrap", unref(selectedMenu) === tab.name ? "bg-gold/15 text-gold border border-gold/20" : "text-parchment/50 border border-brown/20 hover:text-parchment/70 hover:border-brown/30"],
          onClick: ($event) => selectedMenu.value = tab.name
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(tab.name)} <span class="${ssrRenderClass([unref(selectedMenu) === tab.name ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60", "px-1.5 py-0.5 rounded-full text-[10px] font-semibold"])}"${_scopeId}>${ssrInterpolate(tab.count)}</span>`);
            } else {
              return [
                createTextVNode(toDisplayString(tab.name) + " ", 1),
                createVNode("span", {
                  class: ["px-1.5 py-0.5 rounded-full text-[10px] font-semibold", unref(selectedMenu) === tab.name ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60"]
                }, toDisplayString(tab.count), 3)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><div class="flex flex-col sm:flex-row gap-3 mb-4">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(searchQuery),
        "onUpdate:modelValue": ($event) => isRef(searchQuery) ? searchQuery.value = $event : null,
        placeholder: "Search cocktails...",
        icon: "i-lucide-search",
        class: "flex-1",
        size: "sm"
      }, createSlots({ _: 2 }, [
        unref(searchQuery) ? {
          name: "trailing",
          fn: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-x",
                variant: "ghost",
                size: "xs",
                color: "neutral",
                onClick: ($event) => searchQuery.value = ""
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  icon: "i-lucide-x",
                  variant: "ghost",
                  size: "xs",
                  color: "neutral",
                  onClick: ($event) => searchQuery.value = ""
                }, null, 8, ["onClick"])
              ];
            }
          }),
          key: "0"
        } : void 0
      ]), _parent));
      _push(`<div class="flex items-center gap-2"><div class="flex items-center gap-0.5 bg-brown/15 rounded-lg p-0.5 border border-brown/20"><!--[-->`);
      ssrRenderList([
        { label: "All", value: "all" },
        { label: "Visible", value: "visible" },
        { label: "Hidden", value: "hidden" }
      ], (opt) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: opt.value,
          size: "xs",
          variant: unref(visibilityFilter) === opt.value ? "solid" : "ghost",
          color: unref(visibilityFilter) === opt.value ? "primary" : "neutral",
          onClick: ($event) => visibilityFilter.value = opt.value
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(opt.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(opt.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div>`);
      if (unref(activeFilterCount) > 0) {
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          variant: "ghost",
          color: "neutral",
          icon: "i-lucide-x",
          onClick: clearFilters
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Clear `);
            } else {
              return [
                createTextVNode(" Clear ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(searchQuery) || unref(visibilityFilter) !== "all") {
        _push(`<p class="text-xs text-parchment/50 mb-3">${ssrInterpolate(unref(filteredCocktails).length)} cocktail${ssrInterpolate(unref(filteredCocktails).length !== 1 ? "s" : "")} found </p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(viewMode) === "grid") {
        _push(ssrRenderComponent(_component_CocktailCardGrid, { data: unref(filteredCocktails) }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_TableCocktails, { data: unref(filteredCocktails) }, null, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/cocktails/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C_Nyxb_S.mjs.map

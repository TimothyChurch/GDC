import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, h as useRouter, g as useOverlay } from './server.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$2 } from './Table-BV7aBYOB.mjs';
import { _ as _sfc_main$3 } from './Select-xxK8NqZT.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { defineComponent, ref, withCtx, unref, createTextVNode, createVNode, computed, mergeProps, isRef, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { getPaginationRowModel, getSortedRowModel } from '@tanstack/vue-table';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useItemStore } from './useItemStore-Cpj9s1UF.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, e as expandColumn, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelRecipe } from './PanelRecipe-xlyuVp0h.mjs';
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
import '@tanstack/vue-virtual';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TableRecipes",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const router = useRouter();
    const recipeStore = useRecipeStore();
    const itemStore = useItemStore();
    const { confirm } = useDeleteConfirm();
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => filteredRecipes.value.length)
    );
    const sorting = ref([{ id: "name", desc: false }]);
    const filterClass = ref("All");
    const classOptions = computed(() => {
      const classes = new Set(recipeStore.recipes.map((r) => r.class).filter(Boolean));
      return ["All", ...Array.from(classes).sort()];
    });
    const filteredRecipes = computed(() => {
      if (filterClass.value === "All") return recipeStore.recipes;
      return recipeStore.recipes.filter((r) => r.class === filterClass.value);
    });
    const columns = [
      expandColumn(),
      sortableColumn("name", "Name"),
      sortableColumn("class", "Class"),
      sortableColumn("type", "Type"),
      sortableColumn("volume", "Volume", {
        cell: ({ row }) => `${row.original.volume} ${row.original.volumeUnit}` || "N/A"
      }),
      actionsColumn((row) => [
        {
          label: "View Details",
          onSelect() {
            router.push(`/admin/recipes/${row.original._id}`);
          }
        },
        {
          label: "Edit recipe",
          onSelect() {
            recipeStore.setRecipe(row.original._id.toString());
            openModal();
          }
        },
        {
          label: "Delete recipe",
          variant: "danger",
          async onClick() {
            const confirmed = await confirm("Recipe", row.original.name);
            if (confirmed) {
              recipeStore.deleteRecipe(row.original._id.toString());
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const modal = overlay.create(LazyPanelRecipe);
    const newRecipe = () => {
      recipeStore.resetRecipe();
      openModal();
    };
    const openModal = async () => await modal.open();
    __expose({ newRecipe });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_USelect = _sfc_main$3;
      const _component_UTable = _sfc_main$2;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(recipeStore).loading,
        "search-placeholder": "Search recipes..."
      }, _attrs), {
        filters: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(filterClass),
              "onUpdate:modelValue": ($event) => isRef(filterClass) ? filterClass.value = $event : null,
              items: unref(classOptions),
              class: "min-w-48"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_USelect, {
                modelValue: unref(filterClass),
                "onUpdate:modelValue": ($event) => isRef(filterClass) ? filterClass.value = $event : null,
                items: unref(classOptions),
                class: "min-w-48"
              }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
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
              sorting: unref(sorting),
              "onUpdate:sorting": ($event) => isRef(sorting) ? sorting.value = $event : null,
              "sorting-options": { getSortedRowModel: unref(getSortedRowModel)() },
              "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
              data: unref(filteredRecipes),
              columns,
              loading: unref(recipeStore).loading,
              onSelect: (_e, row) => unref(router).push(`/admin/recipes/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-book-open",
                    title: "No recipes found",
                    description: "Create a recipe to define ingredient lists for your batches",
                    "action-label": "Add Recipe",
                    onAction: newRecipe
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-book-open",
                      title: "No recipes found",
                      description: "Create a recipe to define ingredient lists for your batches",
                      "action-label": "Add Recipe",
                      onAction: newRecipe
                    })
                  ];
                }
              }),
              expanded: withCtx(({ row }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="py-2 px-4 space-y-1"${_scopeId2}><!--[-->`);
                  ssrRenderList(row.original.items, (item) => {
                    _push3(`<div class="flex items-center gap-2 text-sm"${_scopeId2}><span class="text-parchment"${_scopeId2}>${ssrInterpolate(unref(itemStore).getItemById(item._id)?.name || item._id)}</span><span class="text-parchment/60"${_scopeId2}>${ssrInterpolate(item.amount)} ${ssrInterpolate(item.unit)}</span></div>`);
                  });
                  _push3(`<!--]-->`);
                  if (!row.original.items?.length) {
                    _push3(`<div class="text-sm text-parchment/50"${_scopeId2}>No ingredients</div>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "py-2 px-4 space-y-1" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(row.original.items, (item) => {
                        return openBlock(), createBlock("div", {
                          key: item._id,
                          class: "flex items-center gap-2 text-sm"
                        }, [
                          createVNode("span", { class: "text-parchment" }, toDisplayString(unref(itemStore).getItemById(item._id)?.name || item._id), 1),
                          createVNode("span", { class: "text-parchment/60" }, toDisplayString(item.amount) + " " + toDisplayString(item.unit), 1)
                        ]);
                      }), 128)),
                      !row.original.items?.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "text-sm text-parchment/50"
                      }, "No ingredients")) : createCommentVNode("", true)
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(filteredRecipes).filter((r) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return r.name.toLowerCase().includes(term) || (r.class || "").toLowerCase().includes(term) || (r.type || "").toLowerCase().includes(term);
            }).sort((a, b) => a.name.localeCompare(b.name)), (recipe) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(recipe.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(recipe.class)}${ssrInterpolate(recipe.type ? ` - ${recipe.type}` : "")}</div></div></div><div class="grid grid-cols-2 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Volume</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(recipe.volume)} ${ssrInterpolate(recipe.volumeUnit)}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Ingredients</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(recipe.items?.length || 0)} item${ssrInterpolate((recipe.items?.length || 0) !== 1 ? "s" : "")}</div></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(filteredRecipes).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-book-open",
                title: "No recipes found",
                description: "Create a recipe to define ingredient lists for your batches",
                "action-label": "Add Recipe",
                onAction: newRecipe
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
                  sorting: unref(sorting),
                  "onUpdate:sorting": ($event) => isRef(sorting) ? sorting.value = $event : null,
                  "sorting-options": { getSortedRowModel: unref(getSortedRowModel)() },
                  "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
                  data: unref(filteredRecipes),
                  columns,
                  loading: unref(recipeStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/recipes/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-book-open",
                      title: "No recipes found",
                      description: "Create a recipe to define ingredient lists for your batches",
                      "action-label": "Add Recipe",
                      onAction: newRecipe
                    })
                  ]),
                  expanded: withCtx(({ row }) => [
                    createVNode("div", { class: "py-2 px-4 space-y-1" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(row.original.items, (item) => {
                        return openBlock(), createBlock("div", {
                          key: item._id,
                          class: "flex items-center gap-2 text-sm"
                        }, [
                          createVNode("span", { class: "text-parchment" }, toDisplayString(unref(itemStore).getItemById(item._id)?.name || item._id), 1),
                          createVNode("span", { class: "text-parchment/60" }, toDisplayString(item.amount) + " " + toDisplayString(item.unit), 1)
                        ]);
                      }), 128)),
                      !row.original.items?.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "text-sm text-parchment/50"
                      }, "No ingredients")) : createCommentVNode("", true)
                    ])
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "sorting", "onUpdate:sorting", "sorting-options", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredRecipes).filter((r) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return r.name.toLowerCase().includes(term) || (r.class || "").toLowerCase().includes(term) || (r.type || "").toLowerCase().includes(term);
                }).sort((a, b) => a.name.localeCompare(b.name)), (recipe) => {
                  return openBlock(), createBlock("div", {
                    key: recipe._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => unref(router).push(`/admin/recipes/${recipe._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(recipe.name), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(recipe.class) + toDisplayString(recipe.type ? ` - ${recipe.type}` : ""), 1)
                      ])
                    ]),
                    createVNode("div", { class: "grid grid-cols-2 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Volume"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(recipe.volume) + " " + toDisplayString(recipe.volumeUnit), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Ingredients"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(recipe.items?.length || 0) + " item" + toDisplayString((recipe.items?.length || 0) !== 1 ? "s" : ""), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(filteredRecipes).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-book-open",
                  title: "No recipes found",
                  description: "Create a recipe to define ingredient lists for your batches",
                  "action-label": "Add Recipe",
                  onAction: newRecipe
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableRecipes.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "TableRecipes" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const tableRef = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableRecipes = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Recipes",
        subtitle: "Spirit recipes and ingredient formulas",
        icon: "i-lucide-book-open"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: ($event) => unref(tableRef)?.newRecipe()
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Recipe`);
                } else {
                  return [
                    createTextVNode("Add Recipe")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-plus",
                onClick: ($event) => unref(tableRef)?.newRecipe()
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Recipe")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TableRecipes, {
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/recipes/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BPDG7Jsd.mjs.map

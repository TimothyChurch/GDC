import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, h as useRouter, g as useOverlay } from './server.mjs';
import { _ as __nuxt_component_4 } from './TableWrapper-DhLG7m1v.mjs';
import { _ as _sfc_main$2 } from './Table-HT3K8pYo.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { ref, withCtx, unref, createTextVNode, createVNode, defineComponent, computed, toRaw, mergeProps, isRef, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useProductionStore } from './useProductionStore-SZxhegcf.mjs';
import { u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useBottleStore } from './useBottleStore-NPRWrMTA.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelProduction } from './PanelProduction-CicAwPD9.mjs';
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
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './conversions-t0mnZFvt.mjs';
import './useContactStore-DKhOek2F.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TableProductions",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const router = useRouter();
    const productionsStore = useProductionStore();
    const vesselStore = useVesselStore();
    const bottlestore = useBottleStore();
    const { confirm } = useDeleteConfirm();
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => productionsStore.productions.length)
    );
    const sorting = ref([{ id: "date", desc: true }]);
    const columns = [
      sortableColumn("date", "Date", {
        cell: ({ row }) => new Date(row.original.date).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      }),
      sortableColumn("vessel", "Vessel", {
        id: "vessel",
        accessorFn: (row) => vesselStore.vessels.filter((vessel) => row.vessel.includes(vessel._id)).map((vessel) => vessel.name).join(", ") || "N/A",
        cell: ({ row }) => vesselStore.vessels.filter((vessel) => row.original.vessel.includes(vessel._id)).map((vessel) => vessel.name).join(", ") || "N/A"
      }),
      sortableColumn("bottle", "Bottle", {
        id: "bottle",
        accessorFn: (row) => bottlestore.getName(row.bottle) || "Unknown",
        cell: ({ row }) => bottlestore.getName(row.original.bottle) || "Unknown"
      }),
      sortableColumn("quantity", "Quantity"),
      sortableColumn("productionCost", "Production Cost", {
        cell: ({ row }) => Dollar.format(row.original.productionCost)
      }),
      sortableColumn("bottleCost", "Bottle Cost", {
        cell: ({ row }) => Dollar.format(row.original.bottleCost)
      }),
      actionsColumn((row) => [
        {
          label: "View Details",
          onSelect() {
            router.push(`/admin/production/${row.original._id}`);
          }
        },
        {
          label: "Edit production",
          onSelect() {
            productionsStore.production = structuredClone(toRaw(row.original));
            openPanel();
          }
        },
        {
          label: "Delete production",
          variant: "danger",
          async onClick() {
            const confirmed = await confirm("Production", bottlestore.getName(row.original.bottle));
            if (confirmed) {
              await productionsStore.deleteProduction(row.original._id);
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelProduction);
    const openPanel = async () => await panel.open();
    const newItem = () => {
      productionsStore.resetProduction();
      openPanel();
    };
    __expose({ newItem });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UTable = _sfc_main$2;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(productionsStore).loading,
        "search-placeholder": "Search productions..."
      }, _attrs), {
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
              sorting: unref(sorting),
              "onUpdate:sorting": ($event) => isRef(sorting) ? sorting.value = $event : null,
              data: unref(productionsStore).productions,
              columns,
              loading: unref(productionsStore).loading,
              onSelect: (_e, row) => unref(router).push(`/admin/production/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-factory",
                    title: "No productions found",
                    description: "Record a bottling run to track production output",
                    "action-label": "Add Production",
                    onAction: newItem
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-factory",
                      title: "No productions found",
                      description: "Record a bottling run to track production output",
                      "action-label": "Add Production",
                      onAction: newItem
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(productionsStore).productions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter((p) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              const bottleName = unref(bottlestore).getName(p.bottle) || "";
              return bottleName.toLowerCase().includes(term);
            }), (prod) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(unref(bottlestore).getName(prod.bottle) || "Unknown")}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(new Date(prod.date).toLocaleDateString())}</div></div><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/15 text-gold border border-gold/20"${_scopeId}>${ssrInterpolate(prod.quantity)} bottles </span></div><div class="grid grid-cols-2 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Total Cost</span><div class="text-copper font-semibold"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(prod.productionCost || 0))}</div></div><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Per Bottle</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(prod.bottleCost || 0))}</div></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(productionsStore).productions.length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-factory",
                title: "No productions found",
                description: "Record a bottling run to track production output",
                "action-label": "Add Production",
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
                  sorting: unref(sorting),
                  "onUpdate:sorting": ($event) => isRef(sorting) ? sorting.value = $event : null,
                  data: unref(productionsStore).productions,
                  columns,
                  loading: unref(productionsStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/production/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-factory",
                      title: "No productions found",
                      description: "Record a bottling run to track production output",
                      "action-label": "Add Production",
                      onAction: newItem
                    })
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "sorting", "onUpdate:sorting", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(productionsStore).productions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter((p) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  const bottleName = unref(bottlestore).getName(p.bottle) || "";
                  return bottleName.toLowerCase().includes(term);
                }), (prod) => {
                  return openBlock(), createBlock("div", {
                    key: prod._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => unref(router).push(`/admin/production/${prod._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(unref(bottlestore).getName(prod.bottle) || "Unknown"), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(new Date(prod.date).toLocaleDateString()), 1)
                      ]),
                      createVNode("span", { class: "px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold/15 text-gold border border-gold/20" }, toDisplayString(prod.quantity) + " bottles ", 1)
                    ]),
                    createVNode("div", { class: "grid grid-cols-2 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Total Cost"),
                        createVNode("div", { class: "text-copper font-semibold" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(prod.productionCost || 0)), 1)
                      ]),
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Per Bottle"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(prod.bottleCost || 0)), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(productionsStore).productions.length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-factory",
                  title: "No productions found",
                  description: "Record a bottling run to track production output",
                  "action-label": "Add Production",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableProductions.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "TableProductions" });
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const tableRef = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableProductions = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Production",
        subtitle: "Track bottling runs and production records",
        icon: "i-lucide-factory"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: ($event) => unref(tableRef)?.newItem()
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Production`);
                } else {
                  return [
                    createTextVNode("Add Production")
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
                  createTextVNode("Add Production")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TableProductions, {
        ref_key: "tableRef",
        ref: tableRef
      }, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/production/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-D_X5mBdu.mjs.map

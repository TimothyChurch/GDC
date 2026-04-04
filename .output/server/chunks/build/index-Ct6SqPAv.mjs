import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { g as useOverlay, e as _sfc_main$8, f as _sfc_main$e, n as navigateTo } from './server.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { _ as __nuxt_component_2$1 } from './VesselCard-DfVt2H43.mjs';
import { defineComponent, ref, withCtx, createTextVNode, unref, createVNode, defineAsyncComponent, computed, mergeProps, toRaw, isRef, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useVesselStore } from './useBatchStore-C5x8JeHz.mjs';
import { _ as __nuxt_component_4 } from './TableWrapper-DhLG7m1v.mjs';
import { _ as _sfc_main$3 } from './Table-HT3K8pYo.mjs';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelVessel } from './PanelVessel-CIuRdDy7.mjs';
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
import './formatting-DpuwJPOk.mjs';
import './conversions-t0mnZFvt.mjs';
import './useRecipeStore-CZDmzH1f.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './batchPipeline-br9pdPdU.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';
import './Input-Fd8Vd_4J.mjs';
import './FormField-DcXe0kwN.mjs';
import './Select-xxK8NqZT.mjs';
import '@tanstack/vue-virtual';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "VesselGrid",
  __ssrInlineRender: true,
  setup(__props) {
    const vesselStore = useVesselStore();
    const nonBarrelVessels = computed(
      () => vesselStore.vessels.filter((v) => v.type !== "Barrel")
    );
    const typeGroups = computed(() => {
      const types = ["Mash Tun", "Fermenter", "Still", "Tank"];
      const typeIcons = {
        "Mash Tun": "i-lucide-flame",
        "Fermenter": "i-lucide-beaker",
        "Still": "i-lucide-flask-conical",
        "Tank": "i-lucide-cylinder"
      };
      return types.map((type) => ({
        type,
        icon: typeIcons[type],
        vessels: nonBarrelVessels.value.filter((v) => v.type === type)
      })).filter((g) => g.vessels.length > 0);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_VesselCard = __nuxt_component_2$1;
      if (unref(vesselStore).loading) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "text-2xl text-parchment/50 animate-spin mx-auto mb-2"
        }, null, _parent));
        _push(`<p class="text-sm text-parchment/50">Loading vessels...</p></div>`);
      } else if (unref(nonBarrelVessels).length === 0) {
        _push(ssrRenderComponent(_component_BaseEmptyState, mergeProps({
          icon: "i-lucide-container",
          title: "No vessels found",
          description: "Add vessels to track your equipment"
        }, _attrs), null, _parent));
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><!--[-->`);
        ssrRenderList(unref(typeGroups), (group) => {
          _push(`<div><div class="flex items-center gap-2 mb-3">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: group.icon,
            class: "text-copper"
          }, null, _parent));
          _push(`<h3 class="text-sm font-semibold text-parchment/70 uppercase tracking-wider">${ssrInterpolate(group.type)}s </h3><span class="text-xs text-parchment/50">(${ssrInterpolate(group.vessels.length)})</span></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"><!--[-->`);
          ssrRenderList(group.vessels, (vessel) => {
            _push(ssrRenderComponent(_component_VesselCard, {
              key: vessel._id,
              vessel
            }, null, _parent));
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Vessel/VesselGrid.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$2, { __name: "VesselGrid" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TableVessels",
  __ssrInlineRender: true,
  setup(__props) {
    const vesselStore = useVesselStore();
    const { confirm } = useDeleteConfirm();
    const nonBarrelVessels = computed(
      () => vesselStore.vessels.filter((v) => v.type !== "Barrel")
    );
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => nonBarrelVessels.value.length)
    );
    const columns = [
      sortableColumn("name", "Name"),
      sortableColumn("type", "Type"),
      sortableColumn("current", "Current", {
        id: "current",
        accessorFn: (row) => row.current?.volume || 0,
        cell: ({ row }) => {
          const v = row.original.current;
          if (!v?.volume || v.volume <= 0) return "Empty";
          return `${v.volume} ${v.volumeUnit || "gal"}${v.abv ? ` @ ${v.abv}%` : ""}`;
        }
      }),
      actionsColumn((row) => [
        {
          label: "View Details",
          onSelect() {
            navigateTo(`/admin/vessels/${row.original._id}`);
          }
        },
        {
          label: "Empty Vessel",
          async onClick() {
            const confirmed = await confirm("Vessel", row.original.name);
            if (confirmed) {
              vesselStore.emptyVessel(row.original._id);
            }
          }
        },
        {
          label: "Edit vessel",
          onSelect() {
            vesselStore.vessel = structuredClone(toRaw(row.original));
            openPanel();
          }
        },
        {
          label: "Delete vessel",
          variant: "danger",
          async onClick() {
            const confirmed = await confirm("Vessel", row.original.name);
            if (confirmed) {
              vesselStore.deleteVessel(row.original._id);
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelVessel);
    const openPanel = async () => await panel.open();
    const addVessel = () => {
      vesselStore.resetVessel();
      openPanel();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UButton = _sfc_main$8;
      const _component_UTable = _sfc_main$3;
      const _component_BaseEmptyState = __nuxt_component_6;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(vesselStore).loading,
        "search-placeholder": "Search vessels..."
      }, _attrs), {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus-circle",
              size: "xl",
              onClick: addVessel,
              variant: "ghost"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Vessel`);
                } else {
                  return [
                    createTextVNode("Add Vessel")
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
                onClick: addVessel,
                variant: "ghost"
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Vessel")
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
              data: unref(nonBarrelVessels),
              columns,
              loading: unref(vesselStore).loading,
              onSelect: (_e, row) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/admin/vessels/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-container",
                    title: "No vessels found",
                    description: "Add vessels to track your equipment",
                    "action-label": "Add Vessel",
                    onAction: addVessel
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-container",
                      title: "No vessels found",
                      description: "Add vessels to track your equipment",
                      "action-label": "Add Vessel",
                      onAction: addVessel
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(nonBarrelVessels).filter((v) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return v.name.toLowerCase().includes(term) || (v.type || "").toLowerCase().includes(term);
            }), (vessel) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(vessel.name)}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(vessel.type || "Unknown type")}</div></div><span class="${ssrRenderClass([vessel.current ? "bg-amber/15 text-amber border-amber/25" : "bg-brown/15 text-parchment/60 border-brown/25", "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}"${_scopeId}>${ssrInterpolate(vessel.current ? "In Use" : "Empty")}</span></div>`);
              if (vessel.current) {
                _push2(`<div class="text-xs"${_scopeId}><span class="text-parchment/60"${_scopeId}>Contents: </span><span class="text-parchment/70"${_scopeId}>${ssrInterpolate(vessel.current)}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            });
            _push2(`<!--]-->`);
            if (unref(nonBarrelVessels).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-container",
                title: "No vessels found",
                description: "Add vessels to track your equipment",
                "action-label": "Add Vessel",
                onAction: addVessel
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
                  data: unref(nonBarrelVessels),
                  columns,
                  loading: unref(vesselStore).loading,
                  onSelect: (_e, row) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/admin/vessels/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-container",
                      title: "No vessels found",
                      description: "Add vessels to track your equipment",
                      "action-label": "Add Vessel",
                      onAction: addVessel
                    })
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(nonBarrelVessels).filter((v) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return v.name.toLowerCase().includes(term) || (v.type || "").toLowerCase().includes(term);
                }), (vessel) => {
                  return openBlock(), createBlock("div", {
                    key: vessel._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/admin/vessels/${vessel._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(vessel.name), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(vessel.type || "Unknown type"), 1)
                      ]),
                      createVNode("span", {
                        class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", vessel.current ? "bg-amber/15 text-amber border-amber/25" : "bg-brown/15 text-parchment/60 border-brown/25"]
                      }, toDisplayString(vessel.current ? "In Use" : "Empty"), 3)
                    ]),
                    vessel.current ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-xs"
                    }, [
                      createVNode("span", { class: "text-parchment/60" }, "Contents: "),
                      createVNode("span", { class: "text-parchment/70" }, toDisplayString(vessel.current), 1)
                    ])) : createCommentVNode("", true)
                  ], 8, ["onClick"]);
                }), 128)),
                unref(nonBarrelVessels).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-container",
                  title: "No vessels found",
                  description: "Add vessels to track your equipment",
                  "action-label": "Add Vessel",
                  onAction: addVessel
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableVessels.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "TableVessels" });
const LazyPanelVesselTransfer = defineAsyncComponent(() => import('./PanelVesselTransfer-SvNqi2Ip.mjs').then((r) => r["default"] || r.default || r));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const vesselStore = useVesselStore();
    const viewMode = ref("grid");
    const overlay = useOverlay();
    const transferPanel = overlay.create(LazyPanelVesselTransfer);
    const openTransfer = async () => await transferPanel.open();
    const vesselPanel = overlay.create(LazyPanelVessel);
    const addVessel = () => {
      vesselStore.resetVessel();
      vesselPanel.open();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_VesselGrid = __nuxt_component_2;
      const _component_TableVessels = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Vessels",
        subtitle: "Fermenters, stills, and tanks",
        icon: "i-lucide-container"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: addVessel
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Vessel`);
                } else {
                  return [
                    createTextVNode("Add Vessel")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              variant: "outline",
              icon: "i-lucide-arrow-right-left",
              onClick: openTransfer
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Transfer`);
                } else {
                  return [
                    createTextVNode("Transfer")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
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
              createVNode(_component_UButton, {
                icon: "i-lucide-plus",
                onClick: addVessel
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Vessel")
                ]),
                _: 1
              }),
              createVNode(_component_UButton, {
                variant: "outline",
                icon: "i-lucide-arrow-right-left",
                onClick: openTransfer
              }, {
                default: withCtx(() => [
                  createTextVNode("Transfer")
                ]),
                _: 1
              }),
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
      if (unref(viewMode) === "grid") {
        _push(ssrRenderComponent(_component_VesselGrid, null, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_TableVessels, null, null, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/vessels/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Ct6SqPAv.mjs.map

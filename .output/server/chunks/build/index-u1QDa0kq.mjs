import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { o as useLocalStorage, e as _sfc_main$8, h as useRouter, g as useOverlay, f as _sfc_main$e } from './server.mjs';
import { _ as __nuxt_component_4 } from './TableWrapper-DhLG7m1v.mjs';
import { _ as _sfc_main$3 } from './Table-HT3K8pYo.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, ref, computed, withCtx, unref, createVNode, createTextVNode, toDisplayString, h, toRaw, mergeProps, isRef, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { A as ALL_STAGES, h as hasStageVolumes, g as getActiveStages, d as getStageVolume, c as STAGE_DISPLAY, i as isStageActive, e as stageTextColor, s as stageBgColor } from './batchPipeline-br9pdPdU.mjs';
import { a as useBatchStore } from './useBatchStore-C5x8JeHz.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelBatch } from './PanelBatch-C1RtjSaY.mjs';
import { _ as __nuxt_component_1 } from './BatchRecipeLegend-DPlKPDfc.mjs';
import { _ as __nuxt_component_7 } from './DashboardBatchCard-BwWomVhh.mjs';
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
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useBulkSpiritStore-Bx2u4RsR.mjs';
import './proofGallons--xmqBsFG.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';
import './useRecipeColors-C1dzeggx.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "TableBatches",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    const router = useRouter();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const { confirm } = useDeleteConfirm();
    const tableData = computed(() => {
      const data = props.data ?? batchStore.batches;
      return props.data ? data : data.filter((b) => b.currentStage !== "Barreled");
    });
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => tableData.value.length)
    );
    function stageColor(stage) {
      const display = STAGE_DISPLAY[stage];
      if (!display) return "bg-brown/15 text-parchment/50 border-brown/25";
      return stageBgColor(display.color) + " " + stageTextColor(display.color);
    }
    function statusBadgeColor(status) {
      switch (status) {
        case "active":
          return "bg-blue-500/15 text-blue-400 border-blue-500/25";
        case "completed":
          return "bg-green-500/15 text-green-400 border-green-500/25";
        case "cancelled":
          return "bg-red-500/15 text-red-400 border-red-500/25";
        default:
          return "bg-brown/15 text-parchment/50 border-brown/25";
      }
    }
    const columns = [
      sortableColumn("recipe", "Recipe", {
        cell: ({ row }) => recipeStore.getRecipeById(row.original.recipe)?.name || "Unknown"
      }),
      sortableColumn("batchCost", "Batch Cost", {
        cell: ({ row }) => Dollar.format(row.original.batchCost || 0)
      }),
      sortableColumn("batchSize", "Size", {
        cell: ({ row }) => `${row.original.batchSize || 0} ${row.original.batchSizeUnit || ""}`.trim()
      }),
      sortableColumn("currentStage", "Stage", {
        cell: ({ row }) => {
          const batch = row.original;
          const badges = [];
          if (hasStageVolumes(batch) && getActiveStages(batch).length > 1) {
            const unit = (batch.batchSizeUnit || "gallon").replace(/gallon/i, "g").replace(/liter/i, "L");
            for (const stage of getActiveStages(batch)) {
              const vol = getStageVolume(batch, stage);
              badges.push(
                h("span", {
                  class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", stageColor(stage)]
                }, `${stage} ${vol}${unit}`)
              );
            }
          } else {
            badges.push(
              h("span", {
                class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", stageColor(batch.currentStage || "")]
              }, batch.currentStage || "Unknown")
            );
          }
          if (batch.status !== "active") {
            badges.push(
              h("span", {
                class: ["px-1.5 py-0.5 rounded-full text-[10px] font-semibold border", statusBadgeColor(batch.status || "")]
              }, batch.status)
            );
          }
          return h("div", { class: "flex items-center gap-1.5 flex-wrap" }, badges);
        }
      }),
      actionsColumn((row) => [
        {
          label: "Details",
          onSelect() {
            router.push(`/admin/batch/${row.original._id}`);
          }
        },
        {
          label: "Edit batch",
          onSelect() {
            batchStore.batch = structuredClone(toRaw(row.original));
            openPanel();
          }
        },
        {
          label: "Delete batch",
          variant: "danger",
          async onClick() {
            const confirmed = await confirm("Batch", recipeStore.getRecipeById(row.original.recipe)?.name);
            if (confirmed) {
              batchStore.deleteBatch(row.original._id.toString());
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelBatch);
    const openPanel = async () => await panel.open();
    const addItem = () => {
      batchStore.resetBatch();
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
        loading: unref(batchStore).loading,
        "search-placeholder": "Search batches..."
      }, _attrs), {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus-circle",
              size: "xl",
              onClick: addItem,
              variant: "ghost"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Batch`);
                } else {
                  return [
                    createTextVNode("Add Batch")
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
                onClick: addItem,
                variant: "ghost"
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Batch")
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
              loading: unref(batchStore).loading,
              onSelect: (_e, row) => unref(router).push(`/admin/batch/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-beer",
                    title: "No batches found",
                    description: "Create your first batch to get started",
                    "action-label": "Add Batch",
                    onAction: addItem
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-beer",
                      title: "No batches found",
                      description: "Create your first batch to get started",
                      "action-label": "Add Batch",
                      onAction: addItem
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(tableData).filter((b) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              const recipeName = unref(recipeStore).getRecipeById(b.recipe)?.name || "";
              return recipeName.toLowerCase().includes(term) || (b.currentStage || "").toLowerCase().includes(term);
            }), (batch) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(unref(recipeStore).getRecipeById(batch.recipe)?.name || "Unknown")}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(batch.batchSize)} ${ssrInterpolate(batch.batchSizeUnit)}</div></div><div class="flex flex-wrap gap-1"${_scopeId}>`);
              if (unref(hasStageVolumes)(batch) && unref(getActiveStages)(batch).length > 1) {
                _push2(`<!--[-->`);
                ssrRenderList(unref(getActiveStages)(batch), (stage) => {
                  _push2(`<span class="${ssrRenderClass([stageColor(stage), "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}"${_scopeId}>${ssrInterpolate(stage)} ${ssrInterpolate(unref(getStageVolume)(batch, stage))}${ssrInterpolate((batch.batchSizeUnit || "gallon").replace(/gallon/i, "g").replace(/liter/i, "L"))}</span>`);
                });
                _push2(`<!--]-->`);
              } else {
                _push2(`<span class="${ssrRenderClass([stageColor(batch.currentStage || ""), "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}"${_scopeId}>${ssrInterpolate(batch.currentStage || "Unknown")}</span>`);
              }
              _push2(`</div></div><div class="grid grid-cols-2 gap-2 text-xs"${_scopeId}><div${_scopeId}><span class="text-parchment/60"${_scopeId}>Batch Cost</span><div class="text-copper font-semibold"${_scopeId}>${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(batch.batchCost || 0))}</div></div>`);
              if (batch.createdAt) {
                _push2(`<div${_scopeId}><span class="text-parchment/60"${_scopeId}>Created</span><div class="text-parchment/70"${_scopeId}>${ssrInterpolate(new Date(batch.createdAt).toLocaleDateString())}</div></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(tableData).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-beer",
                title: "No batches found",
                description: "Create your first batch to get started",
                "action-label": "Add Batch",
                onAction: addItem
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
                  loading: unref(batchStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/batch/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-beer",
                      title: "No batches found",
                      description: "Create your first batch to get started",
                      "action-label": "Add Batch",
                      onAction: addItem
                    })
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(tableData).filter((b) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  const recipeName = unref(recipeStore).getRecipeById(b.recipe)?.name || "";
                  return recipeName.toLowerCase().includes(term) || (b.currentStage || "").toLowerCase().includes(term);
                }), (batch) => {
                  return openBlock(), createBlock("div", {
                    key: batch._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => unref(router).push(`/admin/batch/${batch._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(unref(recipeStore).getRecipeById(batch.recipe)?.name || "Unknown"), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(batch.batchSize) + " " + toDisplayString(batch.batchSizeUnit), 1)
                      ]),
                      createVNode("div", { class: "flex flex-wrap gap-1" }, [
                        unref(hasStageVolumes)(batch) && unref(getActiveStages)(batch).length > 1 ? (openBlock(true), createBlock(Fragment, { key: 0 }, renderList(unref(getActiveStages)(batch), (stage) => {
                          return openBlock(), createBlock("span", {
                            key: stage,
                            class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", stageColor(stage)]
                          }, toDisplayString(stage) + " " + toDisplayString(unref(getStageVolume)(batch, stage)) + toDisplayString((batch.batchSizeUnit || "gallon").replace(/gallon/i, "g").replace(/liter/i, "L")), 3);
                        }), 128)) : (openBlock(), createBlock("span", {
                          key: 1,
                          class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", stageColor(batch.currentStage || "")]
                        }, toDisplayString(batch.currentStage || "Unknown"), 3))
                      ])
                    ]),
                    createVNode("div", { class: "grid grid-cols-2 gap-2 text-xs" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-parchment/60" }, "Batch Cost"),
                        createVNode("div", { class: "text-copper font-semibold" }, toDisplayString(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(batch.batchCost || 0)), 1)
                      ]),
                      batch.createdAt ? (openBlock(), createBlock("div", { key: 0 }, [
                        createVNode("span", { class: "text-parchment/60" }, "Created"),
                        createVNode("div", { class: "text-parchment/70" }, toDisplayString(new Date(batch.createdAt).toLocaleDateString()), 1)
                      ])) : createCommentVNode("", true)
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(tableData).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-beer",
                  title: "No batches found",
                  description: "Create your first batch to get started",
                  "action-label": "Add Batch",
                  onAction: addItem
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
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableBatches.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$2, { __name: "TableBatches" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BatchKanban",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const props = __props;
    const batchStore = useBatchStore();
    const batchesSource = computed(() => props.data ?? batchStore.batches);
    const allColumns = computed(
      () => ALL_STAGES.map((stage) => {
        const display = STAGE_DISPLAY[stage] || { icon: "i-lucide-circle", color: "neutral" };
        const batches = batchesSource.value.filter((b) => {
          if (hasStageVolumes(b)) return isStageActive(b, stage);
          return b.currentStage === stage;
        });
        return { stage, display, batches };
      })
    );
    const columns = computed(
      () => allColumns.value.filter((col) => col.batches.length > 0)
    );
    const BORDER_TOP_MAP = {
      blue: "border-t-blue-500",
      orange: "border-t-orange-500",
      yellow: "border-t-yellow-500",
      copper: "border-t-amber-700",
      emerald: "border-t-emerald-500",
      sky: "border-t-sky-500",
      amber: "border-t-amber-500",
      purple: "border-t-purple-500",
      pink: "border-t-pink-500",
      cyan: "border-t-cyan-500",
      green: "border-t-green-500"
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_BatchRecipeLegend = __nuxt_component_1;
      const _component_DashboardBatchCard = __nuxt_component_7;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(columns).length === 0) {
        _push(`<div class="text-center py-12 text-parchment/60">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-kanban",
          class: "text-3xl mb-2"
        }, null, _parent));
        _push(`<p class="text-sm">No batches to display</p></div>`);
      } else {
        _push(`<div>`);
        _push(ssrRenderComponent(_component_BatchRecipeLegend, { batches: unref(batchesSource) }, null, _parent));
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"><!--[-->`);
        ssrRenderList(unref(columns), (col) => {
          _push(`<div class="${ssrRenderClass([BORDER_TOP_MAP[col.display.color] || "border-t-brown/40", "rounded-lg border border-brown/20 bg-charcoal/50 border-t-2"])}"><div class="flex items-center gap-2 px-3 py-2.5 border-b border-brown/15">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: col.display.icon,
            class: [unref(stageTextColor)(col.display.color), "text-base"]
          }, null, _parent));
          _push(`<span class="text-xs font-semibold text-parchment/80 truncate">${ssrInterpolate(col.stage)}</span>`);
          if (col.batches.length) {
            _push(`<span class="${ssrRenderClass([unref(stageBgColor)(col.display.color), "ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold"])}">${ssrInterpolate(col.batches.length)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="p-2 space-y-2"><!--[-->`);
          ssrRenderList(col.batches, (batch) => {
            _push(ssrRenderComponent(_component_DashboardBatchCard, {
              key: batch._id,
              "batch-id": batch._id
            }, null, _parent));
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Batch/BatchKanban.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "BatchKanban" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const batchStore = useBatchStore();
    const viewMode = useLocalStorage("batch-view-mode", "table");
    const selectedFilter = ref("All");
    const filterTabs = computed(() => {
      const tabs = [
        { name: "All", count: batchStore.batches.length, type: "status" },
        { name: "Active", count: batchStore.batches.filter((b) => b.status === "active").length, type: "status" },
        { name: "Completed", count: batchStore.batches.filter((b) => b.status === "completed").length, type: "status" }
      ];
      for (const stage of ALL_STAGES) {
        const count = batchStore.getBatchesInStage(stage).length;
        if (count > 0) {
          tabs.push({ name: stage, count, type: "stage" });
        }
      }
      return tabs;
    });
    const filteredBatches = computed(() => {
      if (selectedFilter.value === "All") return void 0;
      if (selectedFilter.value === "Active") return batchStore.batches.filter((b) => b.status === "active");
      if (selectedFilter.value === "Completed") return batchStore.batches.filter((b) => b.status === "completed");
      return batchStore.getBatchesInStage(selectedFilter.value);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableBatches = __nuxt_component_2;
      const _component_BatchKanban = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Batches",
        subtitle: "Manage batch lifecycle from mashing to bottling",
        icon: "i-lucide-flask-conical"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-1 rounded-lg border border-brown/20 p-0.5"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-table-2",
              size: "xs",
              square: "",
              variant: unref(viewMode) === "table" ? "soft" : "ghost",
              color: unref(viewMode) === "table" ? "primary" : "neutral",
              class: unref(viewMode) === "table" ? "bg-brown/30 text-gold" : "text-parchment/60 hover:text-parchment/70",
              title: "Table view",
              onClick: ($event) => viewMode.value = "table"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-kanban",
              size: "xs",
              square: "",
              variant: unref(viewMode) === "board" ? "soft" : "ghost",
              color: unref(viewMode) === "board" ? "primary" : "neutral",
              class: unref(viewMode) === "board" ? "bg-brown/30 text-gold" : "text-parchment/60 hover:text-parchment/70",
              title: "Board view",
              onClick: ($event) => viewMode.value = "board"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-1 rounded-lg border border-brown/20 p-0.5" }, [
                createVNode(_component_UButton, {
                  icon: "i-lucide-table-2",
                  size: "xs",
                  square: "",
                  variant: unref(viewMode) === "table" ? "soft" : "ghost",
                  color: unref(viewMode) === "table" ? "primary" : "neutral",
                  class: unref(viewMode) === "table" ? "bg-brown/30 text-gold" : "text-parchment/60 hover:text-parchment/70",
                  title: "Table view",
                  onClick: ($event) => viewMode.value = "table"
                }, null, 8, ["variant", "color", "class", "onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-kanban",
                  size: "xs",
                  square: "",
                  variant: unref(viewMode) === "board" ? "soft" : "ghost",
                  color: unref(viewMode) === "board" ? "primary" : "neutral",
                  class: unref(viewMode) === "board" ? "bg-brown/30 text-gold" : "text-parchment/60 hover:text-parchment/70",
                  title: "Board view",
                  onClick: ($event) => viewMode.value = "board"
                }, null, 8, ["variant", "color", "class", "onClick"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex gap-1.5 overflow-x-auto pb-3 mb-1 scrollbar-hide"><!--[-->`);
      ssrRenderList(unref(filterTabs), (tab) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: tab.name,
          size: "xs",
          variant: unref(selectedFilter) === tab.name ? "soft" : "ghost",
          color: unref(selectedFilter) === tab.name ? "primary" : "neutral",
          class: ["rounded-full whitespace-nowrap", unref(selectedFilter) === tab.name ? "bg-gold/15 text-gold border border-gold/20" : "text-parchment/50 border border-brown/20 hover:text-parchment/70 hover:border-brown/30"],
          onClick: ($event) => selectedFilter.value = tab.name
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(tab.name)} <span class="${ssrRenderClass([unref(selectedFilter) === tab.name ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60", "px-1.5 py-0.5 rounded-full text-[10px] font-semibold"])}"${_scopeId}>${ssrInterpolate(tab.count)}</span>`);
            } else {
              return [
                createTextVNode(toDisplayString(tab.name) + " ", 1),
                createVNode("span", {
                  class: ["px-1.5 py-0.5 rounded-full text-[10px] font-semibold", unref(selectedFilter) === tab.name ? "bg-gold/20 text-gold" : "bg-brown/20 text-parchment/60"]
                }, toDisplayString(tab.count), 3)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div>`);
      if (unref(viewMode) === "table") {
        _push(ssrRenderComponent(_component_TableBatches, { data: unref(filteredBatches) }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_BatchKanban, { data: unref(filteredBatches) }, null, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/batch/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-u1QDa0kq.mjs.map

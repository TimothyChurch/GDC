import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { g as useOverlay, e as _sfc_main$8, f as _sfc_main$e } from './server.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$2 } from './Table-BV7aBYOB.mjs';
import { _ as _sfc_main$4 } from './Badge-BJMjvXJU.mjs';
import { _ as _sfc_main$3 } from './DropdownMenu-BSi8OIhb.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { D as Dollar } from './formatting-DpuwJPOk.mjs';
import { defineComponent, computed, ref, withCtx, createTextVNode, createVNode, unref, isRef, toDisplayString, defineAsyncComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useBulkSpiritStore } from './useBulkSpiritStore-Bx2u4RsR.mjs';
import { u as useVesselStore, a as useBatchStore } from './useBatchStore-D8asmAQ6.mjs';
import { u as useRecipeStore } from './useRecipeStore-CZDmzH1f.mjs';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState } from './useTableHelpers-DFWtCr-k.mjs';
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
import 'reka-ui/namespaced';
import './Kbd-C22JBoFL.mjs';
import './proofGallons--xmqBsFG.mjs';
import './conversions-t0mnZFvt.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';
import './batchPipeline-Dr1IalWc.mjs';
import './useAuth-DX6ojG3V.mjs';
import './useItemStore-Cpj9s1UF.mjs';
import './useSettingsStore-CJPFEN69.mjs';
import './definitions-C7fnFA_u.mjs';
import './useInventoryStore-BPtbZ8hY.mjs';
import './useContactStore-DKhOek2F.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BulkSpiritLedger",
  __ssrInlineRender: true,
  props: {
    bulkSpiritId: {}
  },
  setup(__props) {
    const props = __props;
    const bulkSpiritStore = useBulkSpiritStore();
    const batchStore = useBatchStore();
    const recipeStore = useRecipeStore();
    const bs = computed(() => bulkSpiritStore.getBulkSpiritById(props.bulkSpiritId));
    function batchLabel(batchId) {
      const batch = batchStore.getBatchById(batchId);
      if (!batch) return batchId;
      const recipe = recipeStore.getRecipeById(batch.recipe);
      return recipe?.name ? `${recipe.name} #${batch.batchNumber || batch._id.slice(-4)}` : `Batch #${batch.batchNumber || batch._id.slice(-4)}`;
    }
    function shortUnit(unit) {
      return unit.replace(/gallon/i, "gal").replace(/liter/i, "L");
    }
    function formatDate(d) {
      return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    const ledgerEntries = computed(() => {
      if (!bs.value) return [];
      const entries = [];
      for (const d of bs.value.deposits || []) {
        entries.push({ type: "deposit", ...d });
      }
      for (const w of bs.value.withdrawals || []) {
        entries.push({ type: "withdrawal", ...w });
      }
      return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      if (unref(bs)) {
        _push(`<div${ssrRenderAttrs(_attrs)}><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-3">${ssrInterpolate(unref(bs).name)} — Ledger </h3>`);
        if (unref(ledgerEntries).length === 0) {
          _push(`<div class="text-sm text-parchment/50"> No transactions yet. </div>`);
        } else {
          _push(`<div class="space-y-1.5"><!--[-->`);
          ssrRenderList(unref(ledgerEntries), (entry, idx) => {
            _push(`<div class="${ssrRenderClass([entry.type === "deposit" ? "border-green-500/20 bg-green-500/5" : "border-orange-500/20 bg-orange-500/5", "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"])}">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: entry.type === "deposit" ? "i-lucide-arrow-down-to-line" : "i-lucide-arrow-up-from-line",
              class: entry.type === "deposit" ? "text-green-400" : "text-orange-400"
            }, null, _parent));
            _push(`<span class="text-parchment/50 w-24 shrink-0">${ssrInterpolate(formatDate(entry.date))}</span><span class="text-parchment truncate flex-1">${ssrInterpolate(batchLabel(entry.batch))}</span><span class="text-parchment/70 w-24 text-right">${ssrInterpolate(entry.type === "deposit" ? "+" : "-")}${ssrInterpolate(entry.volume.toFixed(1))} ${ssrInterpolate(shortUnit(entry.volumeUnit))}</span><span class="text-parchment/70 w-20 text-right">${ssrInterpolate(entry.proofGallons.toFixed(2))} PG</span><span class="${ssrRenderClass([entry.type === "deposit" ? "text-green-400" : "text-orange-400", "w-24 text-right"])}">${ssrInterpolate(entry.type === "deposit" ? "+" : "-")}${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(entry.value))}</span></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BulkSpirit/BulkSpiritLedger.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_7 = Object.assign(_sfc_main$1, { __name: "BulkSpiritLedger" });
const LazyPanelBulkSpirit = defineAsyncComponent(() => import('./PanelBulkSpirit-DORng-js.mjs').then((r) => r["default"] || r.default || r));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "bulk-spirits",
  __ssrInlineRender: true,
  setup(__props) {
    const bulkSpiritStore = useBulkSpiritStore();
    const vesselStore = useVesselStore();
    const { confirm } = useDeleteConfirm();
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelBulkSpirit);
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => bulkSpiritStore.bulkSpirits.length)
    );
    function vesselName(id) {
      if (!id) return "-";
      return vesselStore.getVesselById(id)?.name || "-";
    }
    const columns = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "spiritClass", header: "Class" },
      {
        accessorKey: "volume",
        header: "Volume",
        cell: ({ row }) => `${row.original.volume.toFixed(1)} ${row.original.volumeUnit === "gallon" ? "gal" : row.original.volumeUnit}`
      },
      {
        accessorKey: "abv",
        header: "ABV",
        cell: ({ row }) => `${row.original.abv.toFixed(1)}%`
      },
      {
        accessorKey: "proofGallons",
        header: "Proof Gallons",
        cell: ({ row }) => row.original.proofGallons.toFixed(2)
      },
      {
        accessorKey: "costPerProofGallon",
        header: "$/PG",
        cell: ({ row }) => Dollar.format(row.original.costPerProofGallon)
      },
      {
        accessorKey: "totalValue",
        header: "Total Value",
        cell: ({ row }) => Dollar.format(row.original.totalValue)
      },
      {
        id: "vessel",
        header: "Vessel",
        cell: ({ row }) => vesselName(row.original.vessel)
      },
      {
        id: "status",
        header: "Status"
      },
      {
        id: "actions"
      }
    ];
    const showLedger = ref(null);
    function newBulkSpirit() {
      bulkSpiritStore.resetBulkSpirit();
      panel.open();
    }
    function editBulkSpirit(id) {
      bulkSpiritStore.setBulkSpirit(id);
      panel.open();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UTable = _sfc_main$2;
      const _component_UBadge = _sfc_main$4;
      const _component_UDropdownMenu = _sfc_main$3;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_BulkSpiritLedger = __nuxt_component_7;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Bulk Spirits",
        subtitle: "Manage stored base spirits for blending and production",
        icon: "i-lucide-archive"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: newBulkSpirit
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` New Bulk Spirit `);
                } else {
                  return [
                    createTextVNode(" New Bulk Spirit ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-plus",
                onClick: newBulkSpirit
              }, {
                default: withCtx(() => [
                  createTextVNode(" New Bulk Spirit ")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"><div class="rounded-xl border border-brown/30 bg-charcoal p-4"><div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Active Spirits</div><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(bulkSpiritStore).activeBulkSpirits.length)}</div></div><div class="rounded-xl border border-brown/30 bg-charcoal p-4"><div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Volume</div><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(bulkSpiritStore).activeBulkSpirits.reduce((sum, bs) => sum + bs.volume, 0).toFixed(1))} gal </div></div><div class="rounded-xl border border-brown/30 bg-charcoal p-4"><div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Proof Gallons</div><div class="text-2xl font-bold text-parchment">${ssrInterpolate(unref(bulkSpiritStore).activeBulkSpirits.reduce((sum, bs) => sum + bs.proofGallons, 0).toFixed(2))}</div></div><div class="rounded-xl border border-brown/30 bg-charcoal p-4"><div class="text-xs text-parchment/50 uppercase tracking-wider mb-1">Total Value</div><div class="text-2xl font-bold text-gold">${ssrInterpolate(("Dollar" in _ctx ? _ctx.Dollar : unref(Dollar)).format(unref(bulkSpiritStore).activeBulkSpirits.reduce((sum, bs) => sum + bs.totalValue, 0)))}</div></div></div>`);
      _push(ssrRenderComponent(_component_TableWrapper, {
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(bulkSpiritStore).loading,
        "search-placeholder": "Search bulk spirits..."
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UTable, {
              ref_key: "tableRef",
              ref: tableRef,
              "global-filter": unref(search),
              "onUpdate:globalFilter": ($event) => isRef(search) ? search.value = $event : null,
              pagination: unref(pagination),
              "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
              "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
              data: unref(bulkSpiritStore).bulkSpirits,
              columns,
              loading: unref(bulkSpiritStore).loading,
              class: "w-full"
            }, {
              "status-cell": withCtx(({ row }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UBadge, {
                    color: row.original.status === "active" ? "success" : "neutral",
                    variant: "subtle"
                  }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(row.original.status)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(row.original.status), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UBadge, {
                      color: row.original.status === "active" ? "success" : "neutral",
                      variant: "subtle"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(row.original.status), 1)
                      ]),
                      _: 2
                    }, 1032, ["color"])
                  ];
                }
              }),
              "actions-cell": withCtx(({ row }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="text-right"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UDropdownMenu, {
                    content: { align: "end" },
                    items: [
                      { label: "View Ledger", icon: "i-lucide-scroll-text", onSelect() {
                        showLedger.value = unref(showLedger) === row.original._id ? null : row.original._id;
                      } },
                      { label: "Edit", icon: "i-lucide-pencil", onSelect() {
                        editBulkSpirit(row.original._id);
                      } },
                      { label: "Delete", variant: "danger", async onClick() {
                        if (await unref(confirm)("Bulk Spirit", row.original.name)) await unref(bulkSpiritStore).deleteBulkSpirit(row.original._id);
                      } }
                    ]
                  }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_UButton, {
                          icon: "i-lucide-ellipsis-vertical",
                          color: "neutral",
                          variant: "ghost"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_UButton, {
                            icon: "i-lucide-ellipsis-vertical",
                            color: "neutral",
                            variant: "ghost"
                          })
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "text-right" }, [
                      createVNode(_component_UDropdownMenu, {
                        content: { align: "end" },
                        items: [
                          { label: "View Ledger", icon: "i-lucide-scroll-text", onSelect() {
                            showLedger.value = unref(showLedger) === row.original._id ? null : row.original._id;
                          } },
                          { label: "Edit", icon: "i-lucide-pencil", onSelect() {
                            editBulkSpirit(row.original._id);
                          } },
                          { label: "Delete", variant: "danger", async onClick() {
                            if (await unref(confirm)("Bulk Spirit", row.original.name)) await unref(bulkSpiritStore).deleteBulkSpirit(row.original._id);
                          } }
                        ]
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_UButton, {
                            icon: "i-lucide-ellipsis-vertical",
                            color: "neutral",
                            variant: "ghost"
                          })
                        ]),
                        _: 1
                      }, 8, ["items"])
                    ])
                  ];
                }
              }),
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-archive",
                    title: "No bulk spirits",
                    description: "Create a bulk spirit entry to start tracking stored spirits",
                    "action-label": "New Bulk Spirit",
                    onAction: newBulkSpirit
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-archive",
                      title: "No bulk spirits",
                      description: "Create a bulk spirit entry to start tracking stored spirits",
                      "action-label": "New Bulk Spirit",
                      onAction: newBulkSpirit
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UTable, {
                ref_key: "tableRef",
                ref: tableRef,
                "global-filter": unref(search),
                "onUpdate:globalFilter": ($event) => isRef(search) ? search.value = $event : null,
                pagination: unref(pagination),
                "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
                "pagination-options": { getPaginationRowModel: unref(getPaginationRowModel)() },
                data: unref(bulkSpiritStore).bulkSpirits,
                columns,
                loading: unref(bulkSpiritStore).loading,
                class: "w-full"
              }, {
                "status-cell": withCtx(({ row }) => [
                  createVNode(_component_UBadge, {
                    color: row.original.status === "active" ? "success" : "neutral",
                    variant: "subtle"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(row.original.status), 1)
                    ]),
                    _: 2
                  }, 1032, ["color"])
                ]),
                "actions-cell": withCtx(({ row }) => [
                  createVNode("div", { class: "text-right" }, [
                    createVNode(_component_UDropdownMenu, {
                      content: { align: "end" },
                      items: [
                        { label: "View Ledger", icon: "i-lucide-scroll-text", onSelect() {
                          showLedger.value = unref(showLedger) === row.original._id ? null : row.original._id;
                        } },
                        { label: "Edit", icon: "i-lucide-pencil", onSelect() {
                          editBulkSpirit(row.original._id);
                        } },
                        { label: "Delete", variant: "danger", async onClick() {
                          if (await unref(confirm)("Bulk Spirit", row.original.name)) await unref(bulkSpiritStore).deleteBulkSpirit(row.original._id);
                        } }
                      ]
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UButton, {
                          icon: "i-lucide-ellipsis-vertical",
                          color: "neutral",
                          variant: "ghost"
                        })
                      ]),
                      _: 1
                    }, 8, ["items"])
                  ])
                ]),
                empty: withCtx(() => [
                  createVNode(_component_BaseEmptyState, {
                    icon: "i-lucide-archive",
                    title: "No bulk spirits",
                    description: "Create a bulk spirit entry to start tracking stored spirits",
                    "action-label": "New Bulk Spirit",
                    onAction: newBulkSpirit
                  })
                ]),
                _: 1
              }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(showLedger)) {
        _push(`<div class="mt-6 rounded-xl border border-brown/30 bg-charcoal p-4">`);
        _push(ssrRenderComponent(_component_BulkSpiritLedger, { "bulk-spirit-id": unref(showLedger) }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/bulk-spirits.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=bulk-spirits--Je44AWM.mjs.map

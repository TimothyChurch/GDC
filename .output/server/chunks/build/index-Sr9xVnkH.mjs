import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, h as useRouter, g as useOverlay, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$2 } from './Badge-BJMjvXJU.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$3 } from './Table-BV7aBYOB.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { _ as _sfc_main$4 } from './FormField-DcXe0kwN.mjs';
import { ref, withCtx, unref, createTextVNode, createVNode, defineComponent, computed, h, mergeProps, isRef, toDisplayString, openBlock, createBlock, Fragment, renderList, createCommentVNode, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useEventStore } from './useEventStore-LoZhbbHY.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, e as expandColumn, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelEvent } from './PanelEvent-BUlKmvCB.mjs';
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
import './Select-xxK8NqZT.mjs';
import '@tanstack/vue-virtual';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "TableEvents",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const eventStore = useEventStore();
    const router = useRouter();
    const { confirm } = useDeleteConfirm();
    const UBadge = _sfc_main$2;
    const statusFilter = ref("All");
    const filteredEvents = computed(() => {
      if (statusFilter.value === "All") return eventStore.events;
      return eventStore.events.filter((e) => e.status === statusFilter.value);
    });
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => filteredEvents.value.length)
    );
    const statusColors = {
      Pending: "warning",
      Confirmed: "success",
      Completed: "info",
      Cancelled: "error"
    };
    function formatDate(val) {
      if (!val) return "—";
      return new Date(val).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    function getContactName(row) {
      const c = row.contact;
      if (!c || typeof c === "string") return "—";
      return c.businessName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—";
    }
    function getContactEmail(row) {
      const c = row.contact;
      if (!c || typeof c === "string") return "";
      return c.email || "";
    }
    function getContactPhone(row) {
      const c = row.contact;
      if (!c || typeof c === "string") return "";
      return c.phone || "";
    }
    const columns = [
      expandColumn(),
      sortableColumn("date", "Date", {
        id: "date",
        accessorFn: (row) => row.date,
        cell: ({ getValue }) => formatDate(getValue())
      }),
      sortableColumn("contact", "Contact", {
        id: "contact",
        accessorFn: (row) => getContactName(row)
      }),
      sortableColumn("type", "Type"),
      sortableColumn("status", "Status", {
        cell: ({ getValue }) => {
          const status = getValue();
          return h(_sfc_main$2, {
            color: statusColors[status] || "neutral",
            variant: "subtle",
            size: "sm"
          }, () => status);
        }
      }),
      {
        id: "isPublic",
        header: "Visibility",
        accessorFn: (row) => row.isPublic ? "Public" : "Private",
        cell: ({ row }) => {
          return h(_sfc_main$2, {
            color: row.original.isPublic ? "success" : "neutral",
            variant: "subtle",
            size: "sm"
          }, () => row.original.isPublic ? "Public" : "Private");
        }
      },
      actionsColumn((row) => [
        {
          label: "View details",
          onSelect() {
            router.push(`/admin/events/${row.original._id}`);
          }
        },
        {
          label: "Edit event",
          onSelect() {
            const raw = toRaw(row.original);
            const contactId = raw.contact && typeof raw.contact === "object" ? raw.contact._id : raw.contact;
            eventStore.setItem(raw._id);
            eventStore.event.contact = contactId;
            openPanel();
          }
        },
        {
          label: "Delete event",
          variant: "danger",
          async onClick() {
            const name = `${row.original.type} on ${formatDate(row.original.date)}`;
            const confirmed = await confirm("Event", name);
            if (confirmed) {
              eventStore.deleteEvent(row.original._id);
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelEvent);
    const openPanel = async () => await panel.open();
    const addItem = () => {
      eventStore.resetEvent();
      openPanel();
    };
    __expose({ addItem });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UButton = _sfc_main$8;
      const _component_UTable = _sfc_main$3;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_UFormField = _sfc_main$4;
      const _component_UIcon = _sfc_main$e;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(eventStore).loading,
        "search-placeholder": "Search events..."
      }, _attrs), {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2 flex-wrap"${_scopeId}><!--[-->`);
            ssrRenderList(["All", "Pending", "Confirmed"], (status) => {
              _push2(ssrRenderComponent(_component_UButton, {
                key: status,
                variant: unref(statusFilter) === status ? "solid" : "outline",
                color: unref(statusFilter) === status ? status === "Pending" ? "warning" : status === "Confirmed" ? "success" : "primary" : "neutral",
                size: "sm",
                onClick: ($event) => {
                  statusFilter.value = status;
                  unref(pagination).pageIndex = 0;
                }
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(status)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(status), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2 flex-wrap" }, [
                (openBlock(), createBlock(Fragment, null, renderList(["All", "Pending", "Confirmed"], (status) => {
                  return createVNode(_component_UButton, {
                    key: status,
                    variant: unref(statusFilter) === status ? "solid" : "outline",
                    color: unref(statusFilter) === status ? status === "Pending" ? "warning" : status === "Confirmed" ? "success" : "primary" : "neutral",
                    size: "sm",
                    onClick: ($event) => {
                      statusFilter.value = status;
                      unref(pagination).pageIndex = 0;
                    }
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(status), 1)
                    ]),
                    _: 2
                  }, 1032, ["variant", "color", "onClick"]);
                }), 64))
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
              data: unref(filteredEvents),
              columns,
              loading: unref(eventStore).loading,
              onSelect: (_e, row) => unref(router).push(`/admin/events/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-calendar",
                    title: "No events found",
                    description: "Schedule tastings, tours, and private events",
                    "action-label": "Add Event",
                    onAction: addItem
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-calendar",
                      title: "No events found",
                      description: "Schedule tastings, tours, and private events",
                      "action-label": "Add Event",
                      onAction: addItem
                    })
                  ];
                }
              }),
              expanded: withCtx(({ row }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex gap-6 flex-wrap py-2 px-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Group Size" }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span${_scopeId3}>${ssrInterpolate(row.original.groupSize)}</span>`);
                      } else {
                        return [
                          createVNode("span", null, toDisplayString(row.original.groupSize), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Email" }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (getContactEmail(row.original)) {
                          _push4(`<span${_scopeId3}>${ssrInterpolate(getContactEmail(row.original))}</span>`);
                        } else {
                          _push4(`<span class="text-parchment/60"${_scopeId3}>N/A</span>`);
                        }
                      } else {
                        return [
                          getContactEmail(row.original) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(getContactEmail(row.original)), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Phone" }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (getContactPhone(row.original)) {
                          _push4(`<span${_scopeId3}>${ssrInterpolate(getContactPhone(row.original))}</span>`);
                        } else {
                          _push4(`<span class="text-parchment/60"${_scopeId3}>N/A</span>`);
                        }
                      } else {
                        return [
                          getContactPhone(row.original) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(getContactPhone(row.original)), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Notes" }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.original.notes) {
                          _push4(`<span${_scopeId3}>${ssrInterpolate(row.original.notes)}</span>`);
                        } else {
                          _push4(`<span class="text-parchment/60"${_scopeId3}>N/A</span>`);
                        }
                      } else {
                        return [
                          row.original.notes ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.notes), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex gap-6 flex-wrap py-2 px-4" }, [
                      createVNode(_component_UFormField, { label: "Group Size" }, {
                        default: withCtx(() => [
                          createVNode("span", null, toDisplayString(row.original.groupSize), 1)
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Email" }, {
                        default: withCtx(() => [
                          getContactEmail(row.original) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(getContactEmail(row.original)), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Phone" }, {
                        default: withCtx(() => [
                          getContactPhone(row.original) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(getContactPhone(row.original)), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Notes" }, {
                        default: withCtx(() => [
                          row.original.notes ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.notes), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024)
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div><div class="sm:hidden space-y-3"${_scopeId}><!--[-->`);
            ssrRenderList(unref(filteredEvents).filter((e) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return getContactName(e).toLowerCase().includes(term) || e.type.toLowerCase().includes(term) || e.status.toLowerCase().includes(term);
            }), (evt) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div${_scopeId}><div class="text-sm font-medium text-parchment"${_scopeId}>${ssrInterpolate(getContactName(evt))}</div><div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(evt.type)}</div></div><div class="flex items-center gap-1.5"${_scopeId}>`);
              if (evt.isPublic) {
                _push2(ssrRenderComponent(unref(UBadge), {
                  color: "success",
                  variant: "subtle",
                  size: "xs"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Public`);
                    } else {
                      return [
                        createTextVNode("Public")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(unref(UBadge), {
                color: statusColors[evt.status] || "neutral",
                variant: "subtle",
                size: "xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(evt.status)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(evt.status), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div></div><div class="space-y-1 text-xs"${_scopeId}><div class="flex items-center gap-1.5 text-parchment/50"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-calendar",
                class: "text-sm shrink-0"
              }, null, _parent2, _scopeId));
              _push2(`<span${_scopeId}>${ssrInterpolate(formatDate(evt.date))}</span></div><div class="flex items-center gap-1.5 text-parchment/50"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-users",
                class: "text-sm shrink-0"
              }, null, _parent2, _scopeId));
              _push2(`<span${_scopeId}>Group of ${ssrInterpolate(evt.groupSize)}</span></div></div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(filteredEvents).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-calendar",
                title: "No events found",
                description: "Schedule tastings, tours, and private events",
                "action-label": "Add Event",
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
                  data: unref(filteredEvents),
                  columns,
                  loading: unref(eventStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/events/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-calendar",
                      title: "No events found",
                      description: "Schedule tastings, tours, and private events",
                      "action-label": "Add Event",
                      onAction: addItem
                    })
                  ]),
                  expanded: withCtx(({ row }) => [
                    createVNode("div", { class: "flex gap-6 flex-wrap py-2 px-4" }, [
                      createVNode(_component_UFormField, { label: "Group Size" }, {
                        default: withCtx(() => [
                          createVNode("span", null, toDisplayString(row.original.groupSize), 1)
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Email" }, {
                        default: withCtx(() => [
                          getContactEmail(row.original) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(getContactEmail(row.original)), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Phone" }, {
                        default: withCtx(() => [
                          getContactPhone(row.original) ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(getContactPhone(row.original)), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Notes" }, {
                        default: withCtx(() => [
                          row.original.notes ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.notes), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024)
                    ])
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading", "onSelect"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredEvents).filter((e) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return getContactName(e).toLowerCase().includes(term) || e.type.toLowerCase().includes(term) || e.status.toLowerCase().includes(term);
                }), (evt) => {
                  return openBlock(), createBlock("div", {
                    key: evt._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4",
                    onClick: ($event) => unref(router).push(`/admin/events/${evt._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "text-sm font-medium text-parchment" }, toDisplayString(getContactName(evt)), 1),
                        createVNode("div", { class: "text-xs text-parchment/60" }, toDisplayString(evt.type), 1)
                      ]),
                      createVNode("div", { class: "flex items-center gap-1.5" }, [
                        evt.isPublic ? (openBlock(), createBlock(unref(UBadge), {
                          key: 0,
                          color: "success",
                          variant: "subtle",
                          size: "xs"
                        }, {
                          default: withCtx(() => [
                            createTextVNode("Public")
                          ]),
                          _: 1
                        })) : createCommentVNode("", true),
                        createVNode(unref(UBadge), {
                          color: statusColors[evt.status] || "neutral",
                          variant: "subtle",
                          size: "xs"
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(evt.status), 1)
                          ]),
                          _: 2
                        }, 1032, ["color"])
                      ])
                    ]),
                    createVNode("div", { class: "space-y-1 text-xs" }, [
                      createVNode("div", { class: "flex items-center gap-1.5 text-parchment/50" }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-calendar",
                          class: "text-sm shrink-0"
                        }),
                        createVNode("span", null, toDisplayString(formatDate(evt.date)), 1)
                      ]),
                      createVNode("div", { class: "flex items-center gap-1.5 text-parchment/50" }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-users",
                          class: "text-sm shrink-0"
                        }),
                        createVNode("span", null, "Group of " + toDisplayString(evt.groupSize), 1)
                      ])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(filteredEvents).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-calendar",
                  title: "No events found",
                  description: "Schedule tastings, tours, and private events",
                  "action-label": "Add Event",
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableEvents.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "TableEvents" });
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const tableRef = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableEvents = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Events",
        subtitle: "Manage private classes, events, and tastings",
        icon: "i-lucide-calendar"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: ($event) => unref(tableRef)?.addItem()
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Event`);
                } else {
                  return [
                    createTextVNode("Add Event")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-plus",
                onClick: ($event) => unref(tableRef)?.addItem()
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Event")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TableEvents, {
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/events/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Sr9xVnkH.mjs.map

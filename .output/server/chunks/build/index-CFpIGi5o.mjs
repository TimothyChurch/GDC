import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { g as useOverlay, e as _sfc_main$8, h as useRouter, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$2 } from './Badge-BJMjvXJU.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$3 } from './Table-BV7aBYOB.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { _ as _sfc_main$4 } from './FormField-DcXe0kwN.mjs';
import { ref, withCtx, createTextVNode, unref, createVNode, defineComponent, computed, h, toRaw, mergeProps, isRef, openBlock, createBlock, toDisplayString, Fragment, renderList, createCommentVNode, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useEventStore } from './useEventStore-LoZhbbHY.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, e as expandColumn, s as sortableColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelContact } from './PanelContact-BSAHu9XO.mjs';
import { L as LazyModalMergeCustomers } from './ModalMergeCustomers-BfDyFFv2.mjs';
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
  __name: "TableCustomers",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const router = useRouter();
    const contactStore = useContactStore();
    const eventStore = useEventStore();
    contactStore.ensureLoaded();
    const { confirm } = useDeleteConfirm();
    const UBadge = _sfc_main$2;
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => customers.value.length)
    );
    const customers = computed(() => contactStore.getCustomers());
    function eventCount(contactId) {
      return eventStore.getEventsByContact(contactId).length;
    }
    const columns = [
      expandColumn(),
      sortableColumn("name", "Name", {
        id: "name",
        accessorFn: (row) => row.businessName || `${row.firstName || ""} ${row.lastName || ""}`.trim(),
        cell: ({ row, getValue }) => {
          const name = getValue();
          const badges = [];
          if (row.original.newsletter) {
            badges.push(
              h(_sfc_main$2, { color: "success", variant: "subtle", size: "sm" }, () => "Newsletter")
            );
          }
          if (badges.length) {
            return h("div", { class: "flex items-center gap-2" }, [name, ...badges]);
          }
          return name;
        }
      }),
      {
        id: "email",
        header: "Email",
        accessorKey: "email",
        cell: ({ getValue }) => {
          const email = getValue();
          if (!email) return "—";
          return h("a", { href: `mailto:${email}`, class: "text-copper hover:text-gold transition-colors", onClick: (e) => e.stopPropagation() }, email);
        }
      },
      {
        id: "phone",
        header: "Phone",
        accessorKey: "phone",
        cell: ({ getValue }) => {
          const phone = getValue();
          return phone || "—";
        }
      },
      {
        id: "events",
        header: "Events",
        accessorFn: (row) => eventCount(row._id),
        cell: ({ getValue }) => {
          const count = getValue();
          if (count > 0) {
            return h(_sfc_main$2, { color: "warning", variant: "subtle", size: "sm" }, () => `${count}`);
          }
          return h("span", { class: "text-parchment/50" }, "0");
        }
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          return h("div", { class: "flex items-center justify-end gap-1" }, [
            h(_sfc_main$8, {
              icon: "i-lucide-eye",
              color: "neutral",
              variant: "ghost",
              size: "xs",
              "aria-label": "View details",
              onClick: () => router.push(`/admin/customers/${row.original._id}`)
            }),
            h(_sfc_main$8, {
              icon: "i-lucide-pencil",
              color: "neutral",
              variant: "ghost",
              size: "xs",
              "aria-label": "Edit customer",
              onClick: () => {
                contactStore.contact = structuredClone(toRaw(row.original));
                openPanel();
              }
            }),
            h(_sfc_main$8, {
              icon: "i-lucide-trash-2",
              color: "error",
              variant: "ghost",
              size: "xs",
              "aria-label": "Delete customer",
              onClick: async () => {
                const name = row.original.businessName || `${row.original.firstName} ${row.original.lastName}`;
                const confirmed = await confirm("Customer", name);
                if (confirmed) {
                  contactStore.deleteContact(row.original._id);
                }
              }
            })
          ]);
        }
      }
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelContact);
    const openPanel = async () => await panel.open();
    const addCustomer = () => {
      contactStore.contact = {
        _id: "",
        firstName: "",
        lastName: "",
        businessName: "",
        type: "Customer",
        website: "",
        address: "",
        email: "",
        phone: "",
        newsletter: false
      };
      openPanel();
    };
    __expose({ addCustomer });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UTable = _sfc_main$3;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_UFormField = _sfc_main$4;
      const _component_UIcon = _sfc_main$e;
      const _component_UButton = _sfc_main$8;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(contactStore).loading,
        "search-placeholder": "Search customers..."
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
              data: unref(customers),
              columns,
              loading: unref(contactStore).loading
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-building-2",
                    title: "No customers found",
                    description: "Add customers to track events and relationships",
                    "action-label": "Add Customer",
                    onAction: addCustomer
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-building-2",
                      title: "No customers found",
                      description: "Add customers to track events and relationships",
                      "action-label": "Add Customer",
                      onAction: addCustomer
                    })
                  ];
                }
              }),
              expanded: withCtx(({ row }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex gap-6 flex-wrap py-2 px-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Address" }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.original.address) {
                          _push4(`<span${_scopeId3}>${ssrInterpolate(row.original.address)}</span>`);
                        } else {
                          _push4(`<span class="text-parchment/60"${_scopeId3}>N/A</span>`);
                        }
                      } else {
                        return [
                          row.original.address ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.address), 1)) : (openBlock(), createBlock("span", {
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
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Created" }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.original.createdAt) {
                          _push4(`<span${_scopeId3}>${ssrInterpolate(new Date(row.original.createdAt).toLocaleDateString())}</span>`);
                        } else {
                          _push4(`<span class="text-parchment/60"${_scopeId3}>N/A</span>`);
                        }
                      } else {
                        return [
                          row.original.createdAt ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(new Date(row.original.createdAt).toLocaleDateString()), 1)) : (openBlock(), createBlock("span", {
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
                      createVNode(_component_UFormField, { label: "Address" }, {
                        default: withCtx(() => [
                          row.original.address ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.address), 1)) : (openBlock(), createBlock("span", {
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
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Created" }, {
                        default: withCtx(() => [
                          row.original.createdAt ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(new Date(row.original.createdAt).toLocaleDateString()), 1)) : (openBlock(), createBlock("span", {
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
            ssrRenderList(unref(customers).filter((c) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return c.businessName?.toLowerCase().includes(term) || `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term);
            }), (customer) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><div class="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper"${_scopeId}>${ssrInterpolate((customer.firstName?.[0] || customer.businessName?.[0] || "?").toUpperCase())}</div><div${_scopeId}><div class="text-sm font-medium text-parchment flex items-center gap-2"${_scopeId}>${ssrInterpolate(customer.businessName || `${customer.firstName} ${customer.lastName}`)} `);
              if (customer.newsletter) {
                _push2(ssrRenderComponent(unref(UBadge), {
                  color: "success",
                  variant: "subtle",
                  size: "xs"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Newsletter`);
                    } else {
                      return [
                        createTextVNode("Newsletter")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div></div>`);
              if (eventCount(customer._id) > 0) {
                _push2(ssrRenderComponent(unref(UBadge), {
                  color: "warning",
                  variant: "subtle",
                  size: "xs"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(eventCount(customer._id))} event${ssrInterpolate(eventCount(customer._id) !== 1 ? "s" : "")}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(eventCount(customer._id)) + " event" + toDisplayString(eventCount(customer._id) !== 1 ? "s" : ""), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="space-y-1 text-xs"${_scopeId}>`);
              if (customer.email) {
                _push2(`<div class="flex items-center gap-1.5 text-parchment/50"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-mail",
                  class: "text-sm shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`<a${ssrRenderAttr("href", `mailto:${customer.email}`)} class="text-gold hover:underline truncate"${_scopeId}>${ssrInterpolate(customer.email)}</a></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (customer.phone) {
                _push2(`<div class="flex items-center gap-1.5 text-parchment/50"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-phone",
                  class: "text-sm shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`<a${ssrRenderAttr("href", `tel:${customer.phone}`)} class="text-parchment/70"${_scopeId}>${ssrInterpolate(customer.phone)}</a></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-brown/20"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-pencil",
                color: "neutral",
                variant: "ghost",
                size: "xs",
                onClick: () => {
                  unref(contactStore).contact = _ctx.structuredClone(("toRaw" in _ctx ? _ctx.toRaw : unref(toRaw))(customer));
                  openPanel();
                }
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Edit `);
                  } else {
                    return [
                      createTextVNode(" Edit ")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-trash-2",
                color: "error",
                variant: "ghost",
                size: "xs",
                onClick: async () => {
                  const name = customer.businessName || `${customer.firstName} ${customer.lastName}`;
                  const confirmed = await unref(confirm)("Customer", name);
                  if (confirmed) unref(contactStore).deleteContact(customer._id);
                }
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Delete `);
                  } else {
                    return [
                      createTextVNode(" Delete ")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(`</div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(customers).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-building-2",
                title: "No customers found",
                description: "Add customers to track events and relationships",
                "action-label": "Add Customer",
                onAction: addCustomer
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
                  data: unref(customers),
                  columns,
                  loading: unref(contactStore).loading
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-building-2",
                      title: "No customers found",
                      description: "Add customers to track events and relationships",
                      "action-label": "Add Customer",
                      onAction: addCustomer
                    })
                  ]),
                  expanded: withCtx(({ row }) => [
                    createVNode("div", { class: "flex gap-6 flex-wrap py-2 px-4" }, [
                      createVNode(_component_UFormField, { label: "Address" }, {
                        default: withCtx(() => [
                          row.original.address ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.address), 1)) : (openBlock(), createBlock("span", {
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
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Created" }, {
                        default: withCtx(() => [
                          row.original.createdAt ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(new Date(row.original.createdAt).toLocaleDateString()), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024)
                    ])
                  ]),
                  _: 1
                }, 8, ["global-filter", "onUpdate:globalFilter", "pagination", "onUpdate:pagination", "pagination-options", "data", "loading"])
              ]),
              createVNode("div", { class: "sm:hidden space-y-3" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(customers).filter((c) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return c.businessName?.toLowerCase().includes(term) || `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) || c.email?.toLowerCase().includes(term);
                }), (customer) => {
                  return openBlock(), createBlock("div", {
                    key: customer._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4",
                    onClick: ($event) => unref(router).push(`/admin/customers/${customer._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode("div", { class: "w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper" }, toDisplayString((customer.firstName?.[0] || customer.businessName?.[0] || "?").toUpperCase()), 1),
                        createVNode("div", null, [
                          createVNode("div", { class: "text-sm font-medium text-parchment flex items-center gap-2" }, [
                            createTextVNode(toDisplayString(customer.businessName || `${customer.firstName} ${customer.lastName}`) + " ", 1),
                            customer.newsletter ? (openBlock(), createBlock(unref(UBadge), {
                              key: 0,
                              color: "success",
                              variant: "subtle",
                              size: "xs"
                            }, {
                              default: withCtx(() => [
                                createTextVNode("Newsletter")
                              ]),
                              _: 1
                            })) : createCommentVNode("", true)
                          ])
                        ])
                      ]),
                      eventCount(customer._id) > 0 ? (openBlock(), createBlock(unref(UBadge), {
                        key: 0,
                        color: "warning",
                        variant: "subtle",
                        size: "xs"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(eventCount(customer._id)) + " event" + toDisplayString(eventCount(customer._id) !== 1 ? "s" : ""), 1)
                        ]),
                        _: 2
                      }, 1024)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "space-y-1 text-xs" }, [
                      customer.email ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "flex items-center gap-1.5 text-parchment/50"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-mail",
                          class: "text-sm shrink-0"
                        }),
                        createVNode("a", {
                          href: `mailto:${customer.email}`,
                          class: "text-gold hover:underline truncate",
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }, toDisplayString(customer.email), 9, ["href", "onClick"])
                      ])) : createCommentVNode("", true),
                      customer.phone ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "flex items-center gap-1.5 text-parchment/50"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-phone",
                          class: "text-sm shrink-0"
                        }),
                        createVNode("a", {
                          href: `tel:${customer.phone}`,
                          class: "text-parchment/70",
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }, toDisplayString(customer.phone), 9, ["href", "onClick"])
                      ])) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "flex items-center justify-end gap-1 mt-3 pt-2 border-t border-brown/20" }, [
                      createVNode(_component_UButton, {
                        icon: "i-lucide-pencil",
                        color: "neutral",
                        variant: "ghost",
                        size: "xs",
                        onClick: withModifiers(() => {
                          unref(contactStore).contact = _ctx.structuredClone(("toRaw" in _ctx ? _ctx.toRaw : unref(toRaw))(customer));
                          openPanel();
                        }, ["stop"])
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Edit ")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_UButton, {
                        icon: "i-lucide-trash-2",
                        color: "error",
                        variant: "ghost",
                        size: "xs",
                        onClick: withModifiers(async () => {
                          const name = customer.businessName || `${customer.firstName} ${customer.lastName}`;
                          const confirmed = await unref(confirm)("Customer", name);
                          if (confirmed) unref(contactStore).deleteContact(customer._id);
                        }, ["stop"])
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Delete ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(customers).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-building-2",
                  title: "No customers found",
                  description: "Add customers to track events and relationships",
                  "action-label": "Add Customer",
                  onAction: addCustomer
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableCustomers.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "TableCustomers" });
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const tableRef = ref();
    const overlay = useOverlay();
    const mergeModal = overlay.create(LazyModalMergeCustomers);
    const openMerge = async () => {
      await mergeModal.open();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableCustomers = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Customers",
        subtitle: "Manage customer contacts and their events",
        icon: "i-lucide-heart-handshake"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-merge",
              variant: "outline",
              color: "neutral",
              onClick: openMerge
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Merge`);
                } else {
                  return [
                    createTextVNode("Merge")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: ($event) => unref(tableRef)?.addCustomer()
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Customer`);
                } else {
                  return [
                    createTextVNode("Add Customer")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: "i-lucide-merge",
                variant: "outline",
                color: "neutral",
                onClick: openMerge
              }, {
                default: withCtx(() => [
                  createTextVNode("Merge")
                ]),
                _: 1
              }),
              createVNode(_component_UButton, {
                icon: "i-lucide-plus",
                onClick: ($event) => unref(tableRef)?.addCustomer()
              }, {
                default: withCtx(() => [
                  createTextVNode("Add Customer")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TableCustomers, {
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/customers/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CFpIGi5o.mjs.map

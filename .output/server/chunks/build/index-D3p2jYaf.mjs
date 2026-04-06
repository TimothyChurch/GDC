import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { e as _sfc_main$8, h as useRouter, g as useOverlay, f as _sfc_main$e } from './server.mjs';
import { _ as _sfc_main$4 } from './Badge-BJMjvXJU.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$2 } from './Table-BV7aBYOB.mjs';
import { _ as __nuxt_component_6 } from './BaseEmptyState-BmEkGz1p.mjs';
import { _ as _sfc_main$3 } from './FormField-DcXe0kwN.mjs';
import { ref, withCtx, unref, createTextVNode, createVNode, defineComponent, computed, mergeProps, isRef, openBlock, createBlock, toDisplayString, Fragment, renderList, createCommentVNode, withModifiers, h, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { getPaginationRowModel } from '@tanstack/vue-table';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { u as useTableState, e as expandColumn, s as sortableColumn, a as actionsColumn } from './useTableHelpers-DFWtCr-k.mjs';
import { L as LazyPanelContact } from './PanelContact-BSAHu9XO.mjs';
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
  __name: "TableContacts",
  __ssrInlineRender: true,
  setup(__props, { expose: __expose }) {
    const router = useRouter();
    const contactStore = useContactStore();
    contactStore.ensureLoaded();
    const { confirm } = useDeleteConfirm();
    const UBadge = _sfc_main$4;
    const newsletterOnly = ref(false);
    const filteredContacts = computed(() => {
      if (newsletterOnly.value) {
        return contactStore.contacts.filter((c) => c.newsletter);
      }
      return contactStore.contacts;
    });
    const { search, pagination, tableRef, filteredTotal } = useTableState(
      computed(() => filteredContacts.value.length)
    );
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
              h(_sfc_main$4, { color: "success", variant: "subtle", size: "sm" }, () => "Newsletter")
            );
          }
          if (badges.length) {
            return h("div", { class: "flex items-center gap-2" }, [name, ...badges]);
          }
          return name;
        }
      }),
      sortableColumn("type", "Type"),
      actionsColumn((row) => [
        {
          label: "View Details",
          onSelect() {
            router.push(`/admin/contacts/${row.original._id}`);
          }
        },
        {
          label: "Edit contact",
          onSelect() {
            contactStore.contact = structuredClone(toRaw(row.original));
            openPanel();
          }
        },
        {
          label: "Delete contact",
          variant: "danger",
          async onClick() {
            const name = row.original.businessName || `${row.original.firstName} ${row.original.lastName}`;
            const confirmed = await confirm("Contact", name);
            if (confirmed) {
              contactStore.deleteContact(row.original._id);
            }
          }
        }
      ])
    ];
    const overlay = useOverlay();
    const panel = overlay.create(LazyPanelContact);
    const openPanel = async () => await panel.open();
    const addItem = () => {
      openPanel();
    };
    __expose({ addItem });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TableWrapper = __nuxt_component_4;
      const _component_UButton = _sfc_main$8;
      const _component_UTable = _sfc_main$2;
      const _component_BaseEmptyState = __nuxt_component_6;
      const _component_UFormField = _sfc_main$3;
      const _component_UIcon = _sfc_main$e;
      _push(ssrRenderComponent(_component_TableWrapper, mergeProps({
        search: unref(search),
        "onUpdate:search": ($event) => isRef(search) ? search.value = $event : null,
        pagination: unref(pagination),
        "onUpdate:pagination": ($event) => isRef(pagination) ? pagination.value = $event : null,
        "total-items": unref(filteredTotal),
        loading: unref(contactStore).loading,
        "search-placeholder": "Search contacts..."
      }, _attrs), {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: unref(newsletterOnly) ? "i-lucide-mail-check" : "i-lucide-mail",
              variant: unref(newsletterOnly) ? "solid" : "outline",
              color: unref(newsletterOnly) ? "success" : "neutral",
              size: "sm",
              onClick: ($event) => {
                newsletterOnly.value = !unref(newsletterOnly);
                unref(pagination).pageIndex = 0;
              }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Newsletter `);
                } else {
                  return [
                    createTextVNode(" Newsletter ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UButton, {
                icon: unref(newsletterOnly) ? "i-lucide-mail-check" : "i-lucide-mail",
                variant: unref(newsletterOnly) ? "solid" : "outline",
                color: unref(newsletterOnly) ? "success" : "neutral",
                size: "sm",
                onClick: ($event) => {
                  newsletterOnly.value = !unref(newsletterOnly);
                  unref(pagination).pageIndex = 0;
                }
              }, {
                default: withCtx(() => [
                  createTextVNode(" Newsletter ")
                ]),
                _: 1
              }, 8, ["icon", "variant", "color", "onClick"])
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
              data: unref(filteredContacts),
              columns,
              loading: unref(contactStore).loading,
              onSelect: (_e, row) => unref(router).push(`/admin/contacts/${row.original._id}`),
              ui: { tr: "cursor-pointer" }
            }, {
              empty: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_BaseEmptyState, {
                    icon: "i-lucide-users",
                    title: unref(newsletterOnly) ? "No newsletter subscribers" : "No contacts found",
                    description: unref(newsletterOnly) ? "No contacts have subscribed to the newsletter" : "Add contacts to manage vendors and customers",
                    "action-label": "Add Contact",
                    onAction: addItem
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-users",
                      title: unref(newsletterOnly) ? "No newsletter subscribers" : "No contacts found",
                      description: unref(newsletterOnly) ? "No contacts have subscribed to the newsletter" : "Add contacts to manage vendors and customers",
                      "action-label": "Add Contact",
                      onAction: addItem
                    }, null, 8, ["title", "description"])
                  ];
                }
              }),
              expanded: withCtx(({ row }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex gap-6 flex-wrap py-2 px-4"${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Website" }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.original.website) {
                          _push4(`<a${ssrRenderAttr("href", row.original.website)} target="_blank" rel="noopener noreferrer" class="text-gold hover:underline"${_scopeId3}>${ssrInterpolate(row.original.website)}</a>`);
                        } else {
                          _push4(`<span class="text-parchment/60"${_scopeId3}>N/A</span>`);
                        }
                      } else {
                        return [
                          row.original.website ? (openBlock(), createBlock("a", {
                            key: 0,
                            href: row.original.website,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            class: "text-gold hover:underline"
                          }, toDisplayString(row.original.website), 9, ["href"])) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
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
                  _push3(ssrRenderComponent(_component_UFormField, { label: "Email" }, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.original.email) {
                          _push4(`<span${_scopeId3}>${ssrInterpolate(row.original.email)}</span>`);
                        } else {
                          _push4(`<span class="text-parchment/60"${_scopeId3}>N/A</span>`);
                        }
                      } else {
                        return [
                          row.original.email ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.email), 1)) : (openBlock(), createBlock("span", {
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
                        if (row.original.phone) {
                          _push4(`<span${_scopeId3}>${ssrInterpolate(row.original.phone)}</span>`);
                        } else {
                          _push4(`<span class="text-parchment/60"${_scopeId3}>N/A</span>`);
                        }
                      } else {
                        return [
                          row.original.phone ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.phone), 1)) : (openBlock(), createBlock("span", {
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
                      createVNode(_component_UFormField, { label: "Website" }, {
                        default: withCtx(() => [
                          row.original.website ? (openBlock(), createBlock("a", {
                            key: 0,
                            href: row.original.website,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            class: "text-gold hover:underline"
                          }, toDisplayString(row.original.website), 9, ["href"])) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Address" }, {
                        default: withCtx(() => [
                          row.original.address ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.address), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Email" }, {
                        default: withCtx(() => [
                          row.original.email ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.email), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Phone" }, {
                        default: withCtx(() => [
                          row.original.phone ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.phone), 1)) : (openBlock(), createBlock("span", {
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
            ssrRenderList(unref(filteredContacts).filter((c) => {
              if (!unref(search)) return true;
              const term = unref(search).toLowerCase();
              return c.businessName?.toLowerCase().includes(term) || `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) || c.type?.toLowerCase().includes(term);
            }), (contact) => {
              _push2(`<div class="bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer"${_scopeId}><div class="flex items-start justify-between mb-2"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><div class="w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper"${_scopeId}>${ssrInterpolate((contact.firstName?.[0] || contact.businessName?.[0] || "?").toUpperCase())}</div><div${_scopeId}><div class="text-sm font-medium text-parchment flex items-center gap-2"${_scopeId}>${ssrInterpolate(contact.businessName || `${contact.firstName} ${contact.lastName}`)} `);
              if (contact.newsletter) {
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
              _push2(`</div>`);
              if (contact.type) {
                _push2(`<div class="text-xs text-parchment/60"${_scopeId}>${ssrInterpolate(contact.type)}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div></div><div class="space-y-1 text-xs"${_scopeId}>`);
              if (contact.email) {
                _push2(`<div class="flex items-center gap-1.5 text-parchment/50"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-mail",
                  class: "text-sm shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`<a${ssrRenderAttr("href", `mailto:${contact.email}`)} class="text-gold hover:underline truncate"${_scopeId}>${ssrInterpolate(contact.email)}</a></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (contact.phone) {
                _push2(`<div class="flex items-center gap-1.5 text-parchment/50"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-phone",
                  class: "text-sm shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`<a${ssrRenderAttr("href", `tel:${contact.phone}`)} class="text-parchment/70"${_scopeId}>${ssrInterpolate(contact.phone)}</a></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            });
            _push2(`<!--]-->`);
            if (unref(filteredContacts).length === 0) {
              _push2(ssrRenderComponent(_component_BaseEmptyState, {
                icon: "i-lucide-users",
                title: unref(newsletterOnly) ? "No newsletter subscribers" : "No contacts found",
                description: unref(newsletterOnly) ? "No contacts have subscribed to the newsletter" : "Add contacts to manage vendors and customers",
                "action-label": "Add Contact",
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
                  data: unref(filteredContacts),
                  columns,
                  loading: unref(contactStore).loading,
                  onSelect: (_e, row) => unref(router).push(`/admin/contacts/${row.original._id}`),
                  ui: { tr: "cursor-pointer" }
                }, {
                  empty: withCtx(() => [
                    createVNode(_component_BaseEmptyState, {
                      icon: "i-lucide-users",
                      title: unref(newsletterOnly) ? "No newsletter subscribers" : "No contacts found",
                      description: unref(newsletterOnly) ? "No contacts have subscribed to the newsletter" : "Add contacts to manage vendors and customers",
                      "action-label": "Add Contact",
                      onAction: addItem
                    }, null, 8, ["title", "description"])
                  ]),
                  expanded: withCtx(({ row }) => [
                    createVNode("div", { class: "flex gap-6 flex-wrap py-2 px-4" }, [
                      createVNode(_component_UFormField, { label: "Website" }, {
                        default: withCtx(() => [
                          row.original.website ? (openBlock(), createBlock("a", {
                            key: 0,
                            href: row.original.website,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            class: "text-gold hover:underline"
                          }, toDisplayString(row.original.website), 9, ["href"])) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Address" }, {
                        default: withCtx(() => [
                          row.original.address ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.address), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Email" }, {
                        default: withCtx(() => [
                          row.original.email ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.email), 1)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-parchment/60"
                          }, "N/A"))
                        ]),
                        _: 2
                      }, 1024),
                      createVNode(_component_UFormField, { label: "Phone" }, {
                        default: withCtx(() => [
                          row.original.phone ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.original.phone), 1)) : (openBlock(), createBlock("span", {
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
                (openBlock(true), createBlock(Fragment, null, renderList(unref(filteredContacts).filter((c) => {
                  if (!unref(search)) return true;
                  const term = unref(search).toLowerCase();
                  return c.businessName?.toLowerCase().includes(term) || `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) || c.type?.toLowerCase().includes(term);
                }), (contact) => {
                  return openBlock(), createBlock("div", {
                    key: contact._id,
                    class: "bg-charcoal rounded-lg border border-brown/30 p-4 cursor-pointer",
                    onClick: ($event) => unref(router).push(`/admin/contacts/${contact._id}`)
                  }, [
                    createVNode("div", { class: "flex items-start justify-between mb-2" }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode("div", { class: "w-8 h-8 rounded-full bg-copper/20 flex items-center justify-center text-xs font-bold text-copper" }, toDisplayString((contact.firstName?.[0] || contact.businessName?.[0] || "?").toUpperCase()), 1),
                        createVNode("div", null, [
                          createVNode("div", { class: "text-sm font-medium text-parchment flex items-center gap-2" }, [
                            createTextVNode(toDisplayString(contact.businessName || `${contact.firstName} ${contact.lastName}`) + " ", 1),
                            contact.newsletter ? (openBlock(), createBlock(unref(UBadge), {
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
                          ]),
                          contact.type ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "text-xs text-parchment/60"
                          }, toDisplayString(contact.type), 1)) : createCommentVNode("", true)
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "space-y-1 text-xs" }, [
                      contact.email ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "flex items-center gap-1.5 text-parchment/50"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-mail",
                          class: "text-sm shrink-0"
                        }),
                        createVNode("a", {
                          href: `mailto:${contact.email}`,
                          class: "text-gold hover:underline truncate",
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }, toDisplayString(contact.email), 9, ["href", "onClick"])
                      ])) : createCommentVNode("", true),
                      contact.phone ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "flex items-center gap-1.5 text-parchment/50"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-lucide-phone",
                          class: "text-sm shrink-0"
                        }),
                        createVNode("a", {
                          href: `tel:${contact.phone}`,
                          class: "text-parchment/70",
                          onClick: withModifiers(() => {
                          }, ["stop"])
                        }, toDisplayString(contact.phone), 9, ["href", "onClick"])
                      ])) : createCommentVNode("", true)
                    ])
                  ], 8, ["onClick"]);
                }), 128)),
                unref(filteredContacts).length === 0 ? (openBlock(), createBlock(_component_BaseEmptyState, {
                  key: 0,
                  icon: "i-lucide-users",
                  title: unref(newsletterOnly) ? "No newsletter subscribers" : "No contacts found",
                  description: unref(newsletterOnly) ? "No contacts have subscribed to the newsletter" : "Add contacts to manage vendors and customers",
                  "action-label": "Add Contact",
                  onAction: addItem
                }, null, 8, ["title", "description"])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Table/TableContacts.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "TableContacts" });
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const tableRef = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_TableContacts = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Contacts",
        subtitle: "Manage vendors, suppliers, and business contacts",
        icon: "i-lucide-users"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-plus",
              onClick: ($event) => unref(tableRef)?.addItem()
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Add Contact`);
                } else {
                  return [
                    createTextVNode("Add Contact")
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
                  createTextVNode("Add Contact")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_TableContacts, {
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/contacts/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-D3p2jYaf.mjs.map

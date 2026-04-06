import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$1 } from './Badge-BJMjvXJU.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, defineAsyncComponent, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useEventStore } from './useEventStore-LoZhbbHY.mjs';
import { u as useMessageStore } from './useMessageStore-BW2XxQau.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { L as LazyPanelContact } from './PanelContact-BSAHu9XO.mjs';
import { L as LazyPanelEvent } from './PanelEvent-BUlKmvCB.mjs';
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
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';

const LazyModalLinkEvent = defineAsyncComponent(() => import('./ModalLinkEvent-05jiWIIW.mjs').then((r) => r["default"] || r.default || r));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const contactStore = useContactStore();
    const eventStore = useEventStore();
    const messageStore = useMessageStore();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const contact = computed(() => contactStore.getContactById(route.params._id));
    const displayName = computed(() => {
      if (!contact.value) return "";
      return contact.value.businessName || `${contact.value.firstName || ""} ${contact.value.lastName || ""}`.trim();
    });
    const customerEvents = computed(() => {
      const evts = eventStore.getEventsByContact(route.params._id);
      return [...evts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    const customerMessages = computed(() => {
      return messageStore.getMessagesByContact(route.params._id, contact.value?.email);
    });
    function statusColor(status) {
      switch (status) {
        case "Pending":
          return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
        case "Confirmed":
          return "bg-green-500/15 text-green-400 border-green-500/25";
        case "Completed":
          return "bg-blue-500/15 text-blue-400 border-blue-500/25";
        case "Cancelled":
          return "bg-red-500/15 text-red-400 border-red-500/25";
        default:
          return "bg-brown/15 text-parchment/50 border-brown/25";
      }
    }
    function formatDate(val) {
      if (!val) return "—";
      return new Date(val).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    const overlay = useOverlay();
    const contactPanel = overlay.create(LazyPanelContact);
    const eventPanel = overlay.create(LazyPanelEvent);
    const mergeModal = overlay.create(LazyModalMergeCustomers);
    const linkEventModal = overlay.create(LazyModalLinkEvent);
    const editContact = () => {
      if (!contact.value) return;
      contactStore.contact = structuredClone(toRaw(contact.value));
      contactPanel.open();
    };
    const editEvent = (evt) => {
      eventStore.event = {
        ...evt,
        contact: typeof evt.contact === "object" ? evt.contact._id : evt.contact
      };
      eventPanel.open();
    };
    const addEvent = () => {
      eventStore.resetEvent();
      eventStore.event.contact = route.params._id;
      eventPanel.open();
    };
    const deleteContact = async () => {
      if (!contact.value) return;
      const confirmed = await confirm("Customer", displayName.value);
      if (!confirmed) return;
      await contactStore.deleteContact(contact.value._id);
      toast.add({ title: "Customer deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/customers");
    };
    const openMerge = async () => {
      const result = await mergeModal.open({ preselectedId: route.params._id });
      if (result) {
        if (!contactStore.getContactById(route.params._id)) {
          router.push("/admin/customers");
        }
      }
    };
    const openLinkEvent = async () => {
      await linkEventModal.open({
        contactId: route.params._id,
        contactName: displayName.value
      });
    };
    function formatMessageDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_UBadge = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_1$1;
      if (!unref(contactStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(contact)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(displayName),
          subtitle: "Customer",
          icon: "i-lucide-heart-handshake"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/customers")
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Back `);
                  } else {
                    return [
                      createTextVNode(" Back ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-merge",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: openMerge
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Merge `);
                  } else {
                    return [
                      createTextVNode(" Merge ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-pencil",
                size: "sm",
                onClick: editContact
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
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-trash-2",
                color: "error",
                variant: "soft",
                size: "sm",
                onClick: deleteContact
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
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  icon: "i-lucide-arrow-left",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: ($event) => unref(router).push("/admin/customers")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-merge",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: openMerge
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Merge ")
                  ]),
                  _: 1
                }),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editContact
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Edit ")
                  ]),
                  _: 1
                }),
                createVNode(_component_UButton, {
                  icon: "i-lucide-trash-2",
                  color: "error",
                  variant: "soft",
                  size: "sm",
                  onClick: deleteContact
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Delete ")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Customer Info</h3><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">`);
        if (unref(contact).firstName || unref(contact).lastName) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).firstName)} ${ssrInterpolate(unref(contact).lastName)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(contact).businessName) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Business</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).businessName)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Email</div>`);
        if (unref(contact).email) {
          _push(`<a${ssrRenderAttr("href", `mailto:${unref(contact).email}`)} class="text-sm text-copper hover:text-gold transition-colors">${ssrInterpolate(unref(contact).email)}</a>`);
        } else {
          _push(`<div class="text-sm text-parchment/60">N/A</div>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Phone</div>`);
        if (unref(contact).phone) {
          _push(`<a${ssrRenderAttr("href", `tel:${unref(contact).phone}`)} class="text-sm text-copper hover:text-gold transition-colors">${ssrInterpolate(unref(contact).phone)}</a>`);
        } else {
          _push(`<div class="text-sm text-parchment/60">N/A</div>`);
        }
        _push(`</div>`);
        if (unref(contact).address) {
          _push(`<div class="col-span-2"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Address</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).address)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Newsletter</div>`);
        if (unref(contact).newsletter) {
          _push(ssrRenderComponent(_component_UBadge, {
            color: "success",
            variant: "subtle",
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Subscribed`);
              } else {
                return [
                  createTextVNode("Subscribed")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<span class="text-sm text-parchment/60">No</span>`);
        }
        _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Customer Since</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).createdAt ? formatDate(unref(contact).createdAt) : "N/A")}</div></div>`);
        if (unref(contact).notes) {
          _push(`<div class="col-span-2 sm:col-span-3 lg:col-span-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div><div class="text-sm text-parchment">${ssrInterpolate(unref(contact).notes)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">Events</h3><div class="flex items-center gap-1">`);
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-link",
          variant: "ghost",
          size: "sm",
          onClick: openLinkEvent
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Link Existing `);
            } else {
              return [
                createTextVNode(" Link Existing ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          icon: "i-lucide-plus",
          variant: "ghost",
          size: "sm",
          onClick: addEvent
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Add Event `);
            } else {
              return [
                createTextVNode(" Add Event ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
        if (unref(customerEvents).length > 0) {
          _push(`<div class="divide-y divide-brown/20"><div class="grid grid-cols-5 gap-4 pb-2 text-xs text-parchment/60 uppercase tracking-wider hidden sm:grid"><span>Date</span><span>Type</span><span>Status</span><span>Group Size</span><span class="text-right">Actions</span></div><!--[-->`);
          ssrRenderList(unref(customerEvents), (evt) => {
            _push(`<div class="py-2"><div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 text-sm items-center"><span class="text-parchment">${ssrInterpolate(formatDate(evt.date))}</span><span class="text-parchment/80 hidden sm:block">${ssrInterpolate(evt.type)}</span><span><span class="${ssrRenderClass(["px-2 py-0.5 rounded-full text-[10px] font-semibold border", statusColor(evt.status)])}">${ssrInterpolate(evt.status)}</span></span><span class="text-parchment/80 hidden sm:block">${ssrInterpolate(evt.groupSize)}</span><span class="text-right flex items-center justify-end gap-1">`);
            _push(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-eye",
              color: "neutral",
              variant: "ghost",
              size: "xs",
              onClick: ($event) => unref(router).push(`/admin/events/${evt._id}`)
            }, null, _parent));
            _push(ssrRenderComponent(_component_UButton, {
              icon: "i-lucide-pencil",
              color: "neutral",
              variant: "ghost",
              size: "xs",
              onClick: ($event) => editEvent(evt)
            }, null, _parent));
            _push(`</span></div><div class="sm:hidden text-xs text-parchment/60 mt-1 pl-1">${ssrInterpolate(evt.type)} · Group of ${ssrInterpolate(evt.groupSize)} `);
            if (evt.notes) {
              _push(`<span> · ${ssrInterpolate(evt.notes)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-calendar",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No events for this customer</p></div>`);
        }
        _push(`</div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Messages</h3>`);
        if (unref(customerMessages).length > 0) {
          _push(`<div class="divide-y divide-brown/20"><!--[-->`);
          ssrRenderList(unref(customerMessages), (msg) => {
            _push(`<div class="py-3 first:pt-0 last:pb-0"><div class="flex items-start justify-between gap-3"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1"><div class="${ssrRenderClass([
              "w-2 h-2 rounded-full shrink-0",
              !msg.read ? "bg-gold" : "bg-brown/30"
            ])}"></div>`);
            _push(ssrRenderComponent(_component_UBadge, {
              color: {
                "General Inquiry": "info",
                "Private Events": "warning",
                "Private Class Request": "primary",
                "Distillery Tours": "success",
                "Wholesale / Distribution": "secondary"
              }[msg.topic] || "neutral",
              variant: "subtle",
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(msg.topic)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(msg.topic), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="text-xs text-parchment/60">${ssrInterpolate(formatMessageDate(msg.createdAt))}</span></div><p class="text-sm text-parchment/70 line-clamp-2">${ssrInterpolate(msg.message)}</p></div>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/inbox/${msg._id}`
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UButton, {
                    icon: "i-lucide-external-link",
                    color: "neutral",
                    variant: "ghost",
                    size: "xs"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      icon: "i-lucide-external-link",
                      color: "neutral",
                      variant: "ghost",
                      size: "xs"
                    })
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-mail",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No messages from this customer</p></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Customer not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/customers")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Customers `);
            } else {
              return [
                createTextVNode(" Back to Customers ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/customers/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-Dj0EXDN2.mjs.map

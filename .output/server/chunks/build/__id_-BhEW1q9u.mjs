import { u as useRoute, h as useRouter, m as useToast, g as useOverlay, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, toRaw, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { u as useEventStore } from './useEventStore-LoZhbbHY.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
import { L as LazyPanelEvent } from './PanelEvent-BdlUjVQV.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[_id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const eventStore = useEventStore();
    const contactStore = useContactStore();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const event = computed(() => eventStore.getEventById(route.params._id));
    const linkedContact = computed(() => {
      if (!event.value) return void 0;
      const c = event.value.contact;
      if (typeof c === "object" && c?._id) return contactStore.getContactById(c._id);
      if (typeof c === "string" && c) return contactStore.getContactById(c);
      return void 0;
    });
    const contactName = computed(() => {
      if (!linkedContact.value) {
        const c = event.value?.contact;
        if (typeof c === "object" && c) {
          return c.businessName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "—";
        }
        return "—";
      }
      return linkedContact.value.businessName || `${linkedContact.value.firstName || ""} ${linkedContact.value.lastName || ""}`.trim();
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
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    const overlay = useOverlay();
    const eventPanel = overlay.create(LazyPanelEvent);
    const editEvent = () => {
      if (!event.value) return;
      const raw = toRaw(event.value);
      const contactId = raw.contact && typeof raw.contact === "object" ? raw.contact._id : raw.contact;
      eventStore.setItem(raw._id);
      eventStore.event.contact = contactId;
      eventPanel.open();
    };
    const deleteEvent = async () => {
      if (!event.value) return;
      const name = `${event.value.type} on ${formatDate(event.value.date)}`;
      const confirmed = await confirm("Event", name);
      if (!confirmed) return;
      await eventStore.deleteEvent(event.value._id);
      toast.add({ title: "Event deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/events");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      if (!unref(eventStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(event)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: unref(event).type,
          subtitle: `Event — ${formatDate(unref(event).date)}`,
          icon: "i-lucide-calendar"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/events")
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
                icon: "i-lucide-pencil",
                size: "sm",
                onClick: editEvent
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
                onClick: deleteEvent
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
                  onClick: ($event) => unref(router).push("/admin/events")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-pencil",
                  size: "sm",
                  onClick: editEvent
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
                  onClick: deleteEvent
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
        if (unref(event).capacity) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Booking Summary</h3><div class="grid grid-cols-3 gap-6 text-center"><div><div class="text-3xl font-bold text-gold">${ssrInterpolate(unref(event).groupSize || 0)}</div><div class="text-xs text-parchment/60 uppercase tracking-wider mt-1">Booked (Paid)</div></div><div><div class="text-3xl font-bold text-parchment">${ssrInterpolate(unref(event).capacity)}</div><div class="text-xs text-parchment/60 uppercase tracking-wider mt-1">Total Capacity</div></div><div><div class="${ssrRenderClass(["text-3xl font-bold", unref(event).capacity - (unref(event).groupSize || 0) > 0 ? "text-green-400" : "text-red-400"])}">${ssrInterpolate(unref(event).capacity - (unref(event).groupSize || 0))}</div><div class="text-xs text-parchment/60 uppercase tracking-wider mt-1">Remaining</div></div></div><div class="mt-4"><div class="h-2 bg-brown/20 rounded-full overflow-hidden"><div class="h-full bg-gold rounded-full transition-all duration-500" style="${ssrRenderStyle({ width: `${Math.min(100, (unref(event).groupSize || 0) / unref(event).capacity * 100)}%` })}"></div></div><div class="text-xs text-parchment/50 mt-1 text-right">${ssrInterpolate(Math.round((unref(event).groupSize || 0) / unref(event).capacity * 100))}% filled </div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Event Details</h3><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Date</div><div class="text-sm text-parchment">${ssrInterpolate(formatDate(unref(event).date))}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Type</div><div class="text-sm text-parchment">${ssrInterpolate(unref(event).type)}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Status</div><span class="${ssrRenderClass(["px-2 py-0.5 rounded-full text-[10px] font-semibold border", statusColor(unref(event).status)])}">${ssrInterpolate(unref(event).status)}</span></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Visibility</div><span class="${ssrRenderClass(["px-2 py-0.5 rounded-full text-[10px] font-semibold border", unref(event).isPublic ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-brown/15 text-parchment/50 border-brown/25"])}">${ssrInterpolate(unref(event).isPublic ? "Public" : "Private")}</span></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Booked</div><div class="text-sm text-parchment">${ssrInterpolate(unref(event).groupSize)}${ssrInterpolate(unref(event).capacity ? ` / ${unref(event).capacity}` : "")}</div></div>`);
        if (unref(event).createdAt) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Created</div><div class="text-sm text-parchment/70">${ssrInterpolate(formatDate(unref(event).createdAt))}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(event).updatedAt) {
          _push(`<div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Updated</div><div class="text-sm text-parchment/70">${ssrInterpolate(formatDate(unref(event).updatedAt))}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(event).notes) {
          _push(`<div class="col-span-2 sm:col-span-3 lg:col-span-4"><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Notes</div><div class="text-sm text-parchment whitespace-pre-wrap">${ssrInterpolate(unref(event).notes)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4"> Bookings `);
        if (unref(event).bookings?.length) {
          _push(`<span class="text-sm font-normal text-parchment/50 ml-2"> (${ssrInterpolate(unref(event).bookings.length)}) </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</h3>`);
        if (unref(event).bookings?.length) {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(event).bookings, (booking) => {
            _push(`<div class="flex items-center justify-between gap-4 bg-espresso/50 rounded-lg px-4 py-3 border border-brown/20"><div class="min-w-0 flex-1">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/customers/${booking.contact}`,
              class: "text-sm font-medium text-copper hover:text-gold transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(booking.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(booking.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<div class="text-xs text-parchment/50 mt-0.5">${ssrInterpolate(booking.email)}</div></div><div class="text-center shrink-0"><div class="text-sm font-bold text-parchment">${ssrInterpolate(booking.quantity)}</div><div class="text-[10px] text-parchment/50 uppercase">${ssrInterpolate(booking.quantity === 1 ? "seat" : "seats")}</div></div><div class="text-right shrink-0"><div class="text-sm font-bold text-gold">$${ssrInterpolate(booking.amount.toFixed(2))}</div><div class="text-[10px] text-parchment/50">${ssrInterpolate(new Date(booking.bookedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else if (unref(linkedContact)) {
          _push(`<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/customers/${unref(linkedContact)._id}`,
            class: "text-sm text-copper hover:text-gold transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(contactName))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(contactName)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Email</div>`);
          if (unref(linkedContact).email) {
            _push(`<a${ssrRenderAttr("href", `mailto:${unref(linkedContact).email}`)} class="text-sm text-copper hover:text-gold transition-colors">${ssrInterpolate(unref(linkedContact).email)}</a>`);
          } else {
            _push(`<div class="text-sm text-parchment/60">N/A</div>`);
          }
          _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Phone</div>`);
          if (unref(linkedContact).phone) {
            _push(`<a${ssrRenderAttr("href", `tel:${unref(linkedContact).phone}`)} class="text-sm text-copper hover:text-gold transition-colors">${ssrInterpolate(unref(linkedContact).phone)}</a>`);
          } else {
            _push(`<div class="text-sm text-parchment/60">N/A</div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<div class="text-center py-4">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-ticket",
            class: "text-2xl text-parchment/20 mx-auto mb-2"
          }, null, _parent));
          _push(`<p class="text-sm text-parchment/50">No bookings yet</p></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Event not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/events")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Events `);
            } else {
              return [
                createTextVNode(" Back to Events ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/events/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-BhEW1q9u.mjs.map

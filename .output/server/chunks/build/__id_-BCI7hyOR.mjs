import { u as useRoute, h as useRouter, m as useToast, f as _sfc_main$e, e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { _ as _sfc_main$1 } from './Badge-BJMjvXJU.mjs';
import { defineComponent, computed, watch, unref, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { formatDistanceToNow } from 'date-fns';
import { u as useMessageStore } from './useMessageStore-BW2XxQau.mjs';
import { u as useContactStore } from './useContactStore-DKhOek2F.mjs';
import { u as useDeleteConfirm } from './useDeleteConfirm-ChUK9dnx.mjs';
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
    const messageStore = useMessageStore();
    const contactStore = useContactStore();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const message = computed(() => messageStore.getById(route.params._id));
    watch(message, (msg) => {
      if (msg && !msg.read) {
        messageStore.markAsRead(msg._id);
      }
    }, { immediate: true });
    const linkedContact = computed(() => {
      if (!message.value?.contact) return void 0;
      return contactStore.getContactById(message.value.contact);
    });
    const topicColors = {
      "General Inquiry": "info",
      "Private Events": "warning",
      "Private Class Request": "primary",
      "Distillery Tours": "success",
      "Wholesale / Distribution": "secondary",
      "Other": "neutral"
    };
    function formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    }
    function formatRelative(dateStr) {
      if (!dateStr) return "";
      try {
        return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
      } catch {
        return dateStr;
      }
    }
    async function toggleReadStatus() {
      if (!message.value) return;
      if (message.value.read) {
        await messageStore.markAsUnread(message.value._id);
      } else {
        await messageStore.markAsRead(message.value._id);
      }
    }
    async function deleteMessage() {
      if (!message.value) return;
      const confirmed = await confirm("message", `${message.value.firstName} ${message.value.lastName}`);
      if (!confirmed) return;
      await messageStore.deleteMessage(message.value._id);
      toast.add({ title: "Message deleted", color: "success", icon: "i-lucide-trash-2" });
      router.push("/admin/inbox");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_UBadge = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_1$1;
      if (!unref(messageStore).loaded) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "animate-spin text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(message)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: `${unref(message).firstName} ${unref(message).lastName}`,
          subtitle: unref(message).topic,
          icon: "i-lucide-mail"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-arrow-left",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: ($event) => unref(router).push("/admin/inbox")
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
              _push2(`<a${ssrRenderAttr("href", `mailto:${unref(message).email}?subject=Re: ${unref(message).topic}`)} class="inline-flex"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UButton, {
                icon: "i-lucide-reply",
                size: "sm"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Reply `);
                  } else {
                    return [
                      createTextVNode(" Reply ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</a>`);
              _push2(ssrRenderComponent(_component_UButton, {
                icon: unref(message).read ? "i-lucide-mail" : "i-lucide-mail-open",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: toggleReadStatus
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(message).read ? "Mark Unread" : "Mark Read")}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(message).read ? "Mark Unread" : "Mark Read"), 1)
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
                onClick: deleteMessage
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
                  onClick: ($event) => unref(router).push("/admin/inbox")
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Back ")
                  ]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode("a", {
                  href: `mailto:${unref(message).email}?subject=Re: ${unref(message).topic}`,
                  class: "inline-flex"
                }, [
                  createVNode(_component_UButton, {
                    icon: "i-lucide-reply",
                    size: "sm"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Reply ")
                    ]),
                    _: 1
                  })
                ], 8, ["href"]),
                createVNode(_component_UButton, {
                  icon: unref(message).read ? "i-lucide-mail" : "i-lucide-mail-open",
                  variant: "outline",
                  color: "neutral",
                  size: "sm",
                  onClick: toggleReadStatus
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(message).read ? "Mark Unread" : "Mark Read"), 1)
                  ]),
                  _: 1
                }, 8, ["icon"]),
                createVNode(_component_UButton, {
                  icon: "i-lucide-trash-2",
                  color: "error",
                  variant: "soft",
                  size: "sm",
                  onClick: deleteMessage
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
        _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond]">${ssrInterpolate(unref(message).firstName)} ${ssrInterpolate(unref(message).lastName)}</h3>`);
        _push(ssrRenderComponent(_component_UBadge, {
          color: topicColors[unref(message).topic] || "neutral",
          variant: "subtle",
          size: "sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(message).topic)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(message).topic), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(message).createdAt) {
          _push(`<span class="text-xs text-parchment/60 sm:ml-auto">${ssrInterpolate(formatDate(unref(message).createdAt))} <span class="text-parchment/50 ml-1">(${ssrInterpolate(formatRelative(unref(message).createdAt))})</span></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex flex-wrap gap-4 mb-4 text-sm"><a${ssrRenderAttr("href", `mailto:${unref(message).email}`)} class="flex items-center gap-1.5 text-copper hover:text-gold transition-colors">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-mail",
          class: "text-base"
        }, null, _parent));
        _push(` ${ssrInterpolate(unref(message).email)}</a>`);
        if (unref(message).phone) {
          _push(`<a${ssrRenderAttr("href", `tel:${unref(message).phone}`)} class="flex items-center gap-1.5 text-copper hover:text-gold transition-colors">`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-phone",
            class: "text-base"
          }, null, _parent));
          _push(` ${ssrInterpolate(unref(message).phone)}</a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="border-t border-brown/20 pt-4"><p class="text-sm text-parchment/80 leading-relaxed whitespace-pre-wrap">${ssrInterpolate(unref(message).message)}</p></div></div>`);
        if (unref(linkedContact)) {
          _push(`<div class="bg-charcoal rounded-xl border border-brown/30 p-5"><h3 class="text-lg font-bold text-parchment font-[Cormorant_Garamond] mb-4">Linked Customer</h3><div class="grid grid-cols-2 sm:grid-cols-3 gap-4"><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Name</div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/customers/${unref(linkedContact)._id}`,
            class: "text-sm text-copper hover:text-gold transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(linkedContact).businessName || `${unref(linkedContact).firstName || ""} ${unref(linkedContact).lastName || ""}`.trim())}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(linkedContact).businessName || `${unref(linkedContact).firstName || ""} ${unref(linkedContact).lastName || ""}`.trim()), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Email</div><div class="text-sm text-parchment">${ssrInterpolate(unref(linkedContact).email || "N/A")}</div></div><div><div class="text-xs text-parchment/60 uppercase tracking-wider mb-1">Phone</div><div class="text-sm text-parchment">${ssrInterpolate(unref(linkedContact).phone || "N/A")}</div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "text-center py-12" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-search-x",
          class: "text-4xl text-parchment/20 mx-auto mb-3"
        }, null, _parent));
        _push(`<p class="text-parchment/60">Message not found</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          variant: "outline",
          color: "neutral",
          size: "sm",
          class: "mt-3",
          onClick: ($event) => unref(router).push("/admin/inbox")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back to Inbox `);
            } else {
              return [
                createTextVNode(" Back to Inbox ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/inbox/[_id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=__id_-BCI7hyOR.mjs.map

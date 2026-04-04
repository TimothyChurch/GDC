import { _ as __nuxt_component_0 } from './AdminPageHeader-Dox1yGAO.mjs';
import { m as useToast, e as _sfc_main$8, f as _sfc_main$e, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as _sfc_main$1 } from './Badge-BJMjvXJU.mjs';
import { _ as _sfc_main$2 } from './Tooltip-wiUkEzv7.mjs';
import { defineComponent, ref, computed, withCtx, unref, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { formatDistanceToNow } from 'date-fns';
import { u as useMessageStore } from './useMessageStore-BW2XxQau.mjs';
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
import './Kbd-C22JBoFL.mjs';
import './useCrudStore-CgiT9u6L.mjs';
import './errorMessage-C32Dqgoz.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const messageStore = useMessageStore();
    const { confirm } = useDeleteConfirm();
    const toast = useToast();
    const activeTopic = ref("All");
    const showUnreadOnly = ref(false);
    const expandedId = ref(null);
    const topics = [
      "All",
      "General Inquiry",
      "Private Events",
      "Private Class Request",
      "Distillery Tours",
      "Wholesale / Distribution",
      "Other"
    ];
    const topicColors = {
      "General Inquiry": "info",
      "Private Events": "warning",
      "Private Class Request": "primary",
      "Distillery Tours": "success",
      "Wholesale / Distribution": "secondary",
      "Other": "neutral"
    };
    const filteredMessages = computed(() => {
      let msgs = messageStore.messages;
      if (activeTopic.value !== "All") {
        msgs = msgs.filter((m) => m.topic === activeTopic.value);
      }
      if (showUnreadOnly.value) {
        msgs = msgs.filter((m) => !m.read);
      }
      return msgs;
    });
    const totalCount = computed(() => messageStore.messages.length);
    const unreadCount = computed(() => messageStore.unreadCount);
    async function toggleReadStatus(msg) {
      if (msg.read) {
        await messageStore.markAsUnread(msg._id);
      } else {
        await messageStore.markAsRead(msg._id);
      }
    }
    async function deleteMessage(msg) {
      const confirmed = await confirm("message", `${msg.firstName} ${msg.lastName}`);
      if (!confirmed) return;
      await messageStore.deleteMessage(msg._id);
      if (expandedId.value === msg._id) {
        expandedId.value = null;
      }
      toast.add({
        title: "Message deleted",
        color: "success",
        icon: "i-lucide-trash-2"
      });
    }
    async function markAllAsRead() {
      const unread = messageStore.getUnreadMessages();
      for (const msg of unread) {
        await messageStore.markAsRead(msg._id);
      }
      toast.add({
        title: `Marked ${unread.length} messages as read`,
        color: "success",
        icon: "i-lucide-check-check"
      });
    }
    function truncateMessage(text, length = 100) {
      if (text.length <= length) return text;
      return text.slice(0, length).trimEnd() + "...";
    }
    function formatDate(dateStr) {
      if (!dateStr) return "";
      try {
        return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
      } catch {
        return dateStr;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = __nuxt_component_0;
      const _component_UButton = _sfc_main$8;
      const _component_UBadge = _sfc_main$1;
      const _component_UTooltip = _sfc_main$2;
      const _component_UIcon = _sfc_main$e;
      const _component_NuxtLink = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Inbox",
        subtitle: "View customer inquiries and messages",
        icon: "i-lucide-inbox"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(unreadCount) > 0) {
              _push2(ssrRenderComponent(_component_UButton, {
                label: "Mark All Read",
                icon: "i-lucide-check-check",
                color: "neutral",
                variant: "outline",
                size: "sm",
                onClick: markAllAsRead
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(unreadCount) > 0 ? (openBlock(), createBlock(_component_UButton, {
                key: 0,
                label: "Mark All Read",
                icon: "i-lucide-check-check",
                color: "neutral",
                variant: "outline",
                size: "sm",
                onClick: markAllAsRead
              })) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-center gap-4 mb-4 text-sm text-parchment/60"><span>${ssrInterpolate(unref(totalCount))} ${ssrInterpolate(unref(totalCount) === 1 ? "message" : "messages")}</span>`);
      if (unref(unreadCount) > 0) {
        _push(`<span class="text-gold font-medium">${ssrInterpolate(unref(unreadCount))} unread </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6"><div class="flex flex-wrap gap-1.5"><!--[-->`);
      ssrRenderList(topics, (topic) => {
        _push(ssrRenderComponent(_component_UButton, {
          key: topic,
          label: topic,
          size: "xs",
          variant: unref(activeTopic) === topic ? "soft" : "ghost",
          color: unref(activeTopic) === topic ? "primary" : "neutral",
          class: [
            "transition-all duration-200",
            unref(activeTopic) === topic ? "bg-gold/15 text-gold border border-gold/30" : "bg-charcoal text-parchment/50 hover:text-parchment hover:bg-brown/30 border border-brown/20"
          ],
          onClick: ($event) => activeTopic.value = topic
        }, null, _parent));
      });
      _push(`<!--]--></div><div class="sm:ml-auto flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        icon: unref(showUnreadOnly) ? "i-lucide-eye-off" : "i-lucide-eye",
        label: unref(showUnreadOnly) ? "Unread only" : "Show all",
        size: "xs",
        variant: unref(showUnreadOnly) ? "soft" : "ghost",
        color: unref(showUnreadOnly) ? "warning" : "neutral",
        class: [
          "transition-all duration-200",
          unref(showUnreadOnly) ? "bg-copper/15 text-copper border border-copper/30" : "bg-charcoal text-parchment/50 hover:text-parchment hover:bg-brown/30 border border-brown/20"
        ],
        onClick: ($event) => showUnreadOnly.value = !unref(showUnreadOnly)
      }, null, _parent));
      _push(`</div></div>`);
      if (unref(filteredMessages).length > 0) {
        _push(`<div class="flex flex-col gap-3"><!--[-->`);
        ssrRenderList(unref(filteredMessages), (msg) => {
          _push(`<div class="${ssrRenderClass([
            "rounded-xl border transition-all duration-200",
            !msg.read ? "bg-charcoal border-gold/30 shadow-[inset_3px_0_0_0] shadow-gold" : "bg-charcoal/60 border-brown/20"
          ])}"><div class="flex items-start gap-3 p-4 cursor-pointer hover:bg-brown/10 rounded-xl transition-colors duration-150"><div class="pt-1.5 shrink-0"><div class="${ssrRenderClass([
            "w-2.5 h-2.5 rounded-full transition-colors duration-200",
            !msg.read ? "bg-gold" : "bg-brown/30"
          ])}"></div></div><div class="flex-1 min-w-0"><div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1"><span class="${ssrRenderClass([
            "font-medium truncate",
            !msg.read ? "text-parchment" : "text-parchment/70"
          ])}">${ssrInterpolate(msg.firstName)} ${ssrInterpolate(msg.lastName)}</span>`);
          _push(ssrRenderComponent(_component_UBadge, {
            color: topicColors[msg.topic] || "neutral",
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
          _push(`</div><div class="text-xs text-parchment/60 mb-1.5">${ssrInterpolate(msg.email)}</div>`);
          if (unref(expandedId) !== msg._id) {
            _push(`<p class="${ssrRenderClass([
              "text-sm leading-relaxed",
              !msg.read ? "text-parchment/70" : "text-parchment/50"
            ])}">${ssrInterpolate(truncateMessage(msg.message))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex flex-col items-end gap-2 shrink-0"><span class="text-[11px] text-parchment/60 whitespace-nowrap">${ssrInterpolate(formatDate(msg.createdAt))}</span><div class="flex items-center gap-1">`);
          _push(ssrRenderComponent(_component_UTooltip, {
            text: msg.read ? "Mark unread" : "Mark read"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: msg.read ? "i-lucide-mail" : "i-lucide-mail-open",
                  color: "neutral",
                  variant: "ghost",
                  size: "xs",
                  onClick: ($event) => toggleReadStatus(msg)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UButton, {
                    icon: msg.read ? "i-lucide-mail" : "i-lucide-mail-open",
                    color: "neutral",
                    variant: "ghost",
                    size: "xs",
                    onClick: ($event) => toggleReadStatus(msg)
                  }, null, 8, ["icon", "onClick"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_UTooltip, { text: "Delete" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_UButton, {
                  icon: "i-lucide-trash-2",
                  color: "error",
                  variant: "ghost",
                  size: "xs",
                  onClick: ($event) => deleteMessage(msg)
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_UButton, {
                    icon: "i-lucide-trash-2",
                    color: "error",
                    variant: "ghost",
                    size: "xs",
                    onClick: ($event) => deleteMessage(msg)
                  }, null, 8, ["onClick"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div></div>`);
          if (unref(expandedId) === msg._id) {
            _push(`<div class="overflow-hidden"><div class="px-4 pb-4 pt-0 ml-[22px] border-t border-brown/15"><p class="text-sm text-parchment/80 leading-relaxed whitespace-pre-wrap mt-3">${ssrInterpolate(msg.message)}</p><div class="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-brown/15 text-xs text-parchment/60"><a${ssrRenderAttr("href", `mailto:${msg.email}`)} class="flex items-center gap-1.5 text-gold hover:text-gold/80 transition-colors">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-mail",
              class: "text-sm"
            }, null, _parent));
            _push(` ${ssrInterpolate(msg.email)}</a>`);
            if (msg.phone) {
              _push(`<span class="flex items-center gap-1.5">`);
              _push(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-phone",
                class: "text-sm"
              }, null, _parent));
              _push(` ${ssrInterpolate(msg.phone)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<span class="flex items-center gap-1.5">`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-clock",
              class: "text-sm"
            }, null, _parent));
            _push(` ${ssrInterpolate(formatDate(msg.createdAt))}</span></div><div class="mt-3 flex items-center gap-2"><a${ssrRenderAttr("href", `mailto:${msg.email}?subject=Re: ${msg.topic}`)} class="inline-flex">`);
            _push(ssrRenderComponent(_component_UButton, {
              label: "Reply",
              icon: "i-lucide-reply",
              color: "primary",
              variant: "soft",
              size: "sm"
            }, null, _parent));
            _push(`</a>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/inbox/${msg._id}`
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UButton, {
                    label: "Open",
                    icon: "i-lucide-external-link",
                    color: "neutral",
                    variant: "soft",
                    size: "sm"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UButton, {
                      label: "Open",
                      icon: "i-lucide-external-link",
                      color: "neutral",
                      variant: "soft",
                      size: "sm"
                    })
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="flex flex-col items-center justify-center py-16 text-center"><div class="w-16 h-16 rounded-full bg-charcoal flex items-center justify-center mb-4">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-inbox",
          class: "text-3xl text-parchment/50"
        }, null, _parent));
        _push(`</div><h3 class="text-lg font-medium text-parchment/60 mb-1">${ssrInterpolate(unref(showUnreadOnly) ? "No unread messages" : unref(activeTopic) !== "All" ? `No ${unref(activeTopic)} messages` : "No messages yet")}</h3><p class="text-sm text-parchment/60">${ssrInterpolate(unref(showUnreadOnly) ? "All messages have been read." : "Messages from the contact form will appear here.")}</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/inbox/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-rnddICUa.mjs.map

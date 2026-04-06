import { a as useSeoMeta, u as useRoute, f as _sfc_main$e, c as __nuxt_component_1$1, e as _sfc_main$8 } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "return",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "Payment Status | Galveston Distilling Co",
        robots: "noindex, nofollow"
      });
    }
    const route = useRoute();
    const orderId = route.query.orderId || null || void 0;
    const transactionId = route.query.transactionId;
    const data = ref(null);
    const fetchError = ref(null);
    const polling = ref(!!orderId);
    const status = computed(() => {
      if (!orderId) return "error";
      if (polling.value) return "loading";
      if (fetchError.value) return "error";
      const orderState = data.value?.status;
      if (orderState === "COMPLETED") return "complete";
      if (orderState === "OPEN") return "open";
      return "error";
    });
    const errorMessage = computed(() => {
      if (!orderId) return "No order ID provided.";
      if (fetchError.value) return fetchError.value;
      return "";
    });
    function formatPrice(dollars) {
      return `$${dollars.toFixed(2)}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_NuxtLink = __nuxt_component_1$1;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-cream dark:bg-espresso py-12 px-4" }, _attrs))}><div class="max-w-md w-full text-center space-y-6">`);
      if (unref(status) === "loading") {
        _push(`<div class="space-y-4">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "text-5xl animate-spin text-brown/40 dark:text-parchment/40"
        }, null, _parent));
        _push(`<p class="text-brown/60 dark:text-parchment/60">Confirming your payment...</p></div>`);
      } else if (unref(status) === "complete") {
        _push(`<div class="space-y-4"><div class="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-check",
          class: "text-3xl text-green-600"
        }, null, _parent));
        _push(`</div><h1 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment">Payment Successful!</h1><p class="text-brown/60 dark:text-parchment/60">Thank you for your booking. A confirmation will be sent to your email.</p>`);
        if (unref(data)) {
          _push(`<div class="bg-white dark:bg-charcoal rounded-xl border border-gold/10 p-6 text-left space-y-4 mt-4"><h3 class="font-[Cormorant_Garamond] text-lg font-bold text-brown dark:text-parchment border-b border-gold/10 pb-2">Booking Confirmation</h3>`);
          if (unref(data).guest) {
            _push(`<div class="flex justify-between items-center"><span class="text-sm text-brown/50 dark:text-parchment/50">Guest</span><span class="font-medium text-brown dark:text-parchment">${ssrInterpolate(unref(data).guest.firstName)} ${ssrInterpolate(unref(data).guest.lastName)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(data).guest?.email) {
            _push(`<div class="flex justify-between items-center"><span class="text-sm text-brown/50 dark:text-parchment/50">Email</span><span class="text-sm text-brown/80 dark:text-parchment/80">${ssrInterpolate(unref(data).guest.email)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(data).guest?.phone) {
            _push(`<div class="flex justify-between items-center"><span class="text-sm text-brown/50 dark:text-parchment/50">Phone</span><span class="text-sm text-brown/80 dark:text-parchment/80">${ssrInterpolate(unref(data).guest.phone)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(data).quantity > 0) {
            _push(`<div class="flex justify-between items-center"><span class="text-sm text-brown/50 dark:text-parchment/50">Guests</span><span class="font-medium text-brown dark:text-parchment">${ssrInterpolate(unref(data).quantity)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(data).origin?.label) {
            _push(`<div class="flex justify-between items-start"><span class="text-sm text-brown/50 dark:text-parchment/50">Event</span><span class="font-medium text-brown dark:text-parchment text-right max-w-[60%]">${ssrInterpolate(unref(data).origin.label)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(data).amount) {
            _push(`<div class="flex justify-between items-center pt-3 border-t border-gold/10"><span class="text-sm font-semibold text-brown dark:text-parchment">Total Paid</span><span class="text-lg font-bold text-gold">${ssrInterpolate(formatPrice(unref(data).amount))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(transactionId)) {
            _push(`<div class="pt-2 border-t border-gold/10"><span class="text-xs text-brown/30 dark:text-parchment/30">Transaction: ${ssrInterpolate(unref(transactionId))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "inline-block mt-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                label: "Return to Home",
                class: "bg-gold text-espresso hover:bg-copper"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  label: "Return to Home",
                  class: "bg-gold text-espresso hover:bg-copper"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(status) === "open") {
        _push(`<div class="space-y-4"><div class="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-clock",
          class: "text-3xl text-yellow-600"
        }, null, _parent));
        _push(`</div><h1 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment">Payment Pending</h1><p class="text-brown/60 dark:text-parchment/60">Your payment is being processed. Please check back shortly.</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "inline-block mt-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                label: "Return to Home",
                variant: "outline",
                class: "border-gold text-gold hover:bg-gold/10"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  label: "Return to Home",
                  variant: "outline",
                  class: "border-gold text-gold hover:bg-gold/10"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="space-y-4"><div class="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-alert-triangle",
          class: "text-3xl text-red-600"
        }, null, _parent));
        _push(`</div><h1 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment">Something Went Wrong</h1><p class="text-brown/60 dark:text-parchment/60">${ssrInterpolate(unref(errorMessage) || "We could not verify your payment. Please contact support.")}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "inline-block mt-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UButton, {
                label: "Return to Home",
                variant: "outline",
                class: "border-gold text-gold hover:bg-gold/10"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UButton, {
                  label: "Return to Home",
                  variant: "outline",
                  class: "border-gold text-gold hover:bg-gold/10"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/return.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=return-B0YJfEuV.mjs.map

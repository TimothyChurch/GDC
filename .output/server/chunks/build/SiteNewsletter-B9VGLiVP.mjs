import { e as _sfc_main$8, c as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "SiteNewsletter",
  __ssrInlineRender: true,
  setup(__props) {
    const email = ref("");
    const firstName = ref("");
    const lastName = ref("");
    const phone = ref("");
    const status = ref("idle");
    const message = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8;
      const _component_NuxtLink = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "py-16 sm:py-24" }, _attrs))}><div class="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8"><h2 class="max-w-xl text-3xl font-semibold tracking-tight text-balance text-brown dark:text-parchment sm:text-4xl lg:col-span-7 font-[Cormorant_Garamond]"> Want product news and updates? Sign up for our newsletter. </h2><form class="w-full max-w-md lg:col-span-5 lg:pt-2"><div class="space-y-3"><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><input${ssrRenderAttr("value", unref(firstName))} name="firstName" type="text" autocomplete="given-name"${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="min-w-0 w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="First name"><input${ssrRenderAttr("value", unref(lastName))} name="lastName" type="text" autocomplete="family-name"${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="min-w-0 w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="Last name"></div><input${ssrRenderAttr("value", unref(phone))} name="phone" type="tel" autocomplete="tel"${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="Phone number"><div class="flex flex-col sm:flex-row gap-3 sm:gap-4"><label for="email-address" class="sr-only">Email address</label><input id="email-address"${ssrRenderAttr("value", unref(email))} name="email" type="email" autocomplete="email" required${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="min-w-0 flex-auto rounded-md bg-cream dark:bg-charcoal px-3.5 py-2 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6" placeholder="Enter your email">`);
      _push(ssrRenderComponent(_component_UButton, {
        type: "submit",
        disabled: unref(status) === "loading",
        loading: unref(status) === "loading",
        label: unref(status) === "loading" ? "Subscribing..." : "Subscribe",
        class: "flex-none bg-gold text-espresso hover:bg-copper"
      }, null, _parent));
      _push(`</div></div>`);
      if (unref(status) === "success") {
        _push(`<p class="mt-4 text-sm text-green-500">${ssrInterpolate(unref(message))}</p>`);
      } else if (unref(status) === "error") {
        _push(`<p class="mt-4 text-sm text-red-500">${ssrInterpolate(unref(message))}</p>`);
      } else {
        _push(`<p class="mt-4 text-sm/6 text-brown/70 dark:text-parchment/70"> We care about your data. Read our `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/privacy",
          class: "font-semibold whitespace-nowrap text-gold hover:text-copper transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`privacy policy`);
            } else {
              return [
                createTextVNode("privacy policy")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`. </p>`);
      }
      _push(`</form></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Site/SiteNewsletter.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SiteNewsletter = Object.assign(_sfc_main, { __name: "SiteNewsletter" });

export { SiteNewsletter as default };
//# sourceMappingURL=SiteNewsletter-B9VGLiVP.mjs.map

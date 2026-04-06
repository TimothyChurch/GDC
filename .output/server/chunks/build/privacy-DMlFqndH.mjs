import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { a as useSeoMeta } from './server.mjs';
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
  __name: "privacy",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "Privacy Policy | Galveston Distilling Co",
        description: "Privacy policy for Galveston Distilling Co website and services.",
        ogTitle: "Privacy Policy | Galveston Distilling Co",
        ogDescription: "Privacy policy for Galveston Distilling Co website and services.",
        ogUrl: "https://galvestondistilling.com/privacy"
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "py-16 sm:py-24" }, _attrs))}><div class="mx-auto max-w-3xl px-6 lg:px-8"><h1 class="font-[Cormorant_Garamond] text-4xl font-bold text-brown dark:text-parchment mb-2"> Privacy Policy </h1><div class="w-16 h-0.5 bg-gold mb-8"></div><p class="text-sm text-brown/50 dark:text-parchment/50 mb-8"> Last updated: February 27, 2026 </p><div class="prose dark:prose-invert prose-headings:font-[Cormorant_Garamond] max-w-none space-y-6 text-brown/80 dark:text-parchment/80"><section><h2 class="text-2xl font-bold text-brown dark:text-parchment">Information We Collect</h2><p> When you visit our website, we may collect information you voluntarily provide, such as your email address when subscribing to our newsletter. We also collect standard web analytics data to improve our services. </p></section><section><h2 class="text-2xl font-bold text-brown dark:text-parchment">How We Use Your Information</h2><ul class="list-disc pl-6 space-y-2"><li>To send newsletter updates about our products and events (with your consent)</li><li>To process purchases and provide customer service</li><li>To improve our website and services</li><li>To comply with legal requirements</li></ul></section><section><h2 class="text-2xl font-bold text-brown dark:text-parchment">Cookies &amp; Analytics</h2><p> We use cookies and similar technologies to enhance your browsing experience and understand how visitors interact with our site. You can control cookie preferences through your browser settings. </p></section><section><h2 class="text-2xl font-bold text-brown dark:text-parchment">Third-Party Services</h2><p> We use Square for payment processing. When you make a purchase, your payment information is handled directly by Square under their privacy policy. We do not store your payment card details. </p></section><section><h2 class="text-2xl font-bold text-brown dark:text-parchment">Your Rights</h2><p> You may request access to, correction of, or deletion of your personal data at any time. To unsubscribe from our newsletter, use the unsubscribe link in any email or contact us directly. </p></section><section><h2 class="text-2xl font-bold text-brown dark:text-parchment">Contact Us</h2><p> If you have questions about this privacy policy, please contact us at <a href="mailto:Timothy@GalvestonDistillingCo.com" class="text-gold hover:text-copper transition-colors"> Timothy@GalvestonDistillingCo.com </a>. </p></section></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/privacy.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=privacy-DMlFqndH.mjs.map

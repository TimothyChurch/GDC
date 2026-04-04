import { _ as __nuxt_component_0 } from './SitePageHero-6cglFhn2.mjs';
import { a as useSeoMeta, u as useRoute, b as __nuxt_component_2, e as _sfc_main$8 } from './server.mjs';
import { defineComponent, ref, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
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

const inputClass = "w-full rounded-md bg-cream dark:bg-charcoal px-3.5 py-2.5 text-base text-brown dark:text-parchment outline-1 -outline-offset-1 outline-copper/30 placeholder:text-brown/60 dark:placeholder:text-parchment/60 focus:outline-2 focus:-outline-offset-2 focus:outline-gold sm:text-sm/6";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "contact",
  __ssrInlineRender: true,
  setup(__props) {
    {
      useSeoMeta({
        title: "Contact Us | Galveston Distilling Co",
        description: "Get in touch with Galveston Distilling Co. Ask questions, inquire about private events, or reach out about wholesale opportunities.",
        ogTitle: "Contact Us | Galveston Distilling Co",
        ogDescription: "Get in touch with Galveston Distilling Co. Ask questions, inquire about private events, or reach out about wholesale opportunities.",
        ogImage: "https://galvestondistilling.com/images/og-contact.jpg",
        ogUrl: "https://galvestondistilling.com/contact"
      });
    }
    const route = useRoute();
    const topicMap = {
      "private-events": "Private Events",
      "tours": "Distillery Tours",
      "wholesale": "Wholesale / Distribution"
    };
    const firstName = ref("");
    const lastName = ref("");
    const email = ref("");
    const phone = ref("");
    const topic = ref(topicMap[route.query.topic] || "");
    const message = ref("");
    const website = ref("");
    const status = ref("idle");
    const responseMessage = ref("");
    const topics = [
      "General Inquiry",
      "Private Events",
      "Distillery Tours",
      "Wholesale / Distribution",
      "Other"
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SitePageHero = __nuxt_component_0;
      const _component_Icon = __nuxt_component_2;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_SitePageHero, {
        title: "Contact Us",
        subtitle: "Have a question or want to plan an event? We'd love to hear from you.",
        "background-image": "/images/20231205_174024 (3).jpg"
      }, null, _parent));
      _push(`<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20"><div class="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16"><div class="lg:col-span-3"><h2 class="font-[Cormorant_Garamond] text-3xl font-bold text-brown dark:text-parchment"> Send Us a Message </h2><div class="mt-3 w-12 h-0.5 bg-gold"></div><p class="mt-4 text-brown/70 dark:text-parchment/70"> Fill out the form below and we&#39;ll get back to you as soon as possible. </p>`);
      if (unref(status) === "success") {
        _push(`<div class="mt-8 rounded-xl bg-green-500/10 border border-green-500/20 p-8 text-center"><div class="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "carbon:checkmark",
          class: "text-2xl text-green-500"
        }, null, _parent));
        _push(`</div><h3 class="text-lg font-semibold text-brown dark:text-parchment">Message Sent!</h3><p class="mt-2 text-brown/70 dark:text-parchment/70">${ssrInterpolate(unref(responseMessage))}</p>`);
        _push(ssrRenderComponent(_component_UButton, {
          label: "Send Another Message",
          class: "mt-6 bg-gold text-espresso hover:bg-copper",
          onClick: ($event) => status.value = "idle"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<form class="mt-8 space-y-5"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label for="firstName" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5"> First Name <span class="text-red-500">*</span></label><input id="firstName"${ssrRenderAttr("value", unref(firstName))} type="text" autocomplete="given-name" required${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="${ssrRenderClass(inputClass)}" placeholder="First name"></div><div><label for="lastName" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5"> Last Name <span class="text-red-500">*</span></label><input id="lastName"${ssrRenderAttr("value", unref(lastName))} type="text" autocomplete="family-name" required${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="${ssrRenderClass(inputClass)}" placeholder="Last name"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label for="email" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5"> Email <span class="text-red-500">*</span></label><input id="email"${ssrRenderAttr("value", unref(email))} type="email" autocomplete="email" required${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="${ssrRenderClass(inputClass)}" placeholder="you@example.com"></div><div><label for="phone" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5"> Phone </label><input id="phone"${ssrRenderAttr("value", unref(phone))} type="tel" autocomplete="tel"${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="${ssrRenderClass(inputClass)}" placeholder="(555) 123-4567"></div></div><div><label for="topic" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5"> Topic <span class="text-red-500">*</span></label><select id="topic" required${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="${ssrRenderClass(inputClass)}"><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray(unref(topic)) ? ssrLooseContain(unref(topic), "") : ssrLooseEqual(unref(topic), "")) ? " selected" : ""}>Select a topic...</option><!--[-->`);
        ssrRenderList(topics, (t) => {
          _push(`<option${ssrRenderAttr("value", t)}${ssrIncludeBooleanAttr(Array.isArray(unref(topic)) ? ssrLooseContain(unref(topic), t) : ssrLooseEqual(unref(topic), t)) ? " selected" : ""}>${ssrInterpolate(t)}</option>`);
        });
        _push(`<!--]--></select></div><div><label for="message" class="block text-sm font-medium text-brown dark:text-parchment mb-1.5"> Message <span class="text-red-500">*</span></label><textarea id="message" rows="5" required${ssrIncludeBooleanAttr(unref(status) === "loading") ? " disabled" : ""} class="${ssrRenderClass(inputClass)}" placeholder="Tell us what you have in mind...">${ssrInterpolate(unref(message))}</textarea></div><div class="absolute -left-[9999px]" aria-hidden="true" tabindex="-1"><label for="website">Website</label><input id="website"${ssrRenderAttr("value", unref(website))} type="text" name="website" autocomplete="off" tabindex="-1"></div><div>`);
        _push(ssrRenderComponent(_component_UButton, {
          type: "submit",
          disabled: unref(status) === "loading",
          loading: unref(status) === "loading",
          label: unref(status) === "loading" ? "Sending..." : "Send Message",
          class: "bg-gold text-espresso hover:bg-copper"
        }, null, _parent));
        _push(`</div>`);
        if (unref(status) === "error") {
          _push(`<p class="text-sm text-red-500">${ssrInterpolate(unref(responseMessage))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</form>`);
      }
      _push(`</div><div class="lg:col-span-2"><div class="space-y-8"><div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6"><h3 class="font-[Cormorant_Garamond] text-xl font-bold text-brown dark:text-parchment flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:location",
        class: "text-gold"
      }, null, _parent));
      _push(` Visit Us </h3><div class="mt-4 space-y-1 text-sm text-brown/80 dark:text-parchment/80"><p>2618 Market St.</p><p>Galveston, TX 77550</p></div><a href="https://maps.google.com/?q=2618+Market+St+Galveston+TX+77550" target="_blank" rel="noopener noreferrer" class="inline-block mt-3 text-sm font-semibold text-gold hover:text-copper transition-colors"> Get Directions → </a></div><div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6"><h3 class="font-[Cormorant_Garamond] text-xl font-bold text-brown dark:text-parchment flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:time",
        class: "text-gold"
      }, null, _parent));
      _push(` Hours </h3><div class="mt-4 space-y-1 text-sm text-brown/80 dark:text-parchment/80"><p>Monday - Saturday</p><p>11:00 AM - 11:00 PM</p></div></div><div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6"><h3 class="font-[Cormorant_Garamond] text-xl font-bold text-brown dark:text-parchment flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:email",
        class: "text-gold"
      }, null, _parent));
      _push(` Direct Contact </h3><div class="mt-4 space-y-3"><a href="mailto:Timothy@GalvestonDistillingCo.com" class="flex items-center gap-2 text-sm text-brown/80 dark:text-parchment/80 hover:text-gold transition-colors">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:email",
        class: "text-gold/60"
      }, null, _parent));
      _push(` Timothy@GalvestonDistillingCo.com </a><a href="tel:14093513248" class="flex items-center gap-2 text-sm text-brown/80 dark:text-parchment/80 hover:text-gold transition-colors">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:phone",
        class: "text-gold/60"
      }, null, _parent));
      _push(` (409) 351-3248 </a></div></div><div class="bg-cream dark:bg-charcoal rounded-xl border border-gold/10 p-6"><h3 class="font-[Cormorant_Garamond] text-xl font-bold text-brown dark:text-parchment flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:share",
        class: "text-gold"
      }, null, _parent));
      _push(` Follow Us </h3><div class="mt-4 flex gap-4"><a href="https://www.instagram.com/galvestondistillingco/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-sm text-brown/80 dark:text-parchment/80 hover:text-gold transition-colors">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:logo-instagram",
        class: "text-lg"
      }, null, _parent));
      _push(` Instagram </a><a href="https://www.facebook.com/GalvestonDistillingCo/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-sm text-brown/80 dark:text-parchment/80 hover:text-gold transition-colors">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "carbon:logo-facebook",
        class: "text-lg"
      }, null, _parent));
      _push(` Facebook </a></div></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/contact.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=contact-BsjERCDx.mjs.map
